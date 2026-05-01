# Leon Capital — Lease Management Platform: Data Model

**Version:** 1.1  
**Date:** 2026-04-30  
**Scope:** Current prototype data layer + full production schema (SharePoint → PostgreSQL).

---

## Architecture Overview

```
SharePoint (source of truth)
      │
      │  Microsoft Graph API (read/write)
      ▼
  Sync Service  ──────────────────────────────────────────┐
  (Node.js / Python)                                      │
      │                                                   │
      │  upsert on change                                 │ AI pipeline
      ▼                                                   │ (document parsing,
  PostgreSQL (lcg_leases DB)                              │  Claude / GPT)
      │                                                   │
      │  REST API (Express or FastAPI)                    │
      ▼                                                   │
  React Frontend  ◄──────────────────────────────────────┘
  (current prototype)
```

**SharePoint is the source of truth for all lease data.** PostgreSQL is the operational read store — populated by a sync service that calls the Microsoft Graph API. The React frontend reads only from the API (never directly from SharePoint or the DB).

---

## SharePoint Data Sources

| SharePoint Asset | Type | Maps To | Sync Trigger |
|---|---|---|---|
| **Tenancy Report** | Excel file in document library | `properties` + `leases` tables | Graph API driveItem subscription (file change webhook) |
| **Lease Documents** | PDF files in document library | `documents` table (type: lease) | driveItem subscription on folder |
| **Amendments** | PDF files in amendments subfolder | `documents` table (type: amendment) | driveItem subscription on folder |
| **Estoppels** | PDF files in estoppels subfolder | `documents` table (type: estoppel) | driveItem subscription on folder |

### Excel File Sync Pattern

The Tenancy Report is the **primary data source** — an Excel workbook maintained in a SharePoint document library. It is exported from the internal tenancy tracking system and re-uploaded when updated.

**Sync flow:**

```
SharePoint (Excel file updated)
      │
      │  Graph API driveItem subscription fires webhook
      ▼
Sync Service receives notification
      │
      │  GET /drives/{drive-id}/items/{item-id}/content
      │  (downloads the Excel binary)
      ▼
Parse workbook (SheetJS / openpyxl)
      │
      │  Map columns → schema fields
      ▼
Upsert into PostgreSQL
      │
      └── Write to sync_log
```

**Key considerations:**
- Graph API webhooks notify within ~5 minutes of file save
- Sync service compares row hash against last-known state before writing (avoids spurious updates)
- If the webhook misses a change, a daily full-reconciliation job runs at 02:00 CT as a fallback
- Excel column headers must be stable — any header rename in the workbook breaks the mapping and triggers a `sync_log` error

### Azure AD App Registration (M365)

The sync service authenticates to Graph API using an **Azure AD App Registration** with the following permissions:

| Permission | Type | Purpose |
|---|---|---|
| `Files.Read.All` | Application | Read Excel file and PDF documents from SharePoint |
| `Sites.Read.All` | Application | Access the SharePoint site and document libraries |

Credentials stored as environment variables — never in source code:

```
AZURE_TENANT_ID       = <Directory (tenant) ID from App Registration>
AZURE_CLIENT_ID       = <Application (client) ID>
AZURE_CLIENT_SECRET   = <Client secret value>
SHAREPOINT_SITE_ID    = <Graph API site ID>
SHAREPOINT_DRIVE_ID   = <Document library drive ID>
TENANCY_REPORT_ITEM_ID = <driveItem ID of the Excel file>
```

To obtain `SHAREPOINT_SITE_ID` and `SHAREPOINT_DRIVE_ID`, call:
```
GET https://graph.microsoft.com/v1.0/sites/{hostname}:/sites/{site-name}
GET https://graph.microsoft.com/v1.0/sites/{site-id}/drives
```

---

## PostgreSQL Schema

Database: `lcg_leases`

---

### Table: `properties`

One row per physical building.

```sql
CREATE TABLE properties (
  id               TEXT PRIMARY KEY,          -- kebab-case slug, e.g. "chase-mesquite"
  address          TEXT NOT NULL,
  city             TEXT NOT NULL,
  state            CHAR(2) NOT NULL,           -- TX, AZ, NC, SC
  msa              TEXT,
  building_sf      INTEGER,                    -- gross building SF
  year_built       INTEGER,
  clear_height_ft  NUMERIC(5,1),
  dock_doors       INTEGER,
  drive_in_doors   INTEGER,
  sprinklered      BOOLEAN,
  parcel_apn       TEXT,
  latitude         NUMERIC(9,6),
  longitude        NUMERIC(9,6),
  acquisition_date DATE,
  acquisition_cost NUMERIC(14,2),
  appraised_value  NUMERIC(14,2),
  lender           TEXT,
  loan_maturity    DATE,
  property_manager TEXT,
  fund_id          UUID REFERENCES funds(id),
  sharepoint_item_id TEXT,                    -- Graph API item ID for sync
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);
```

---

### Table: `leases`

One row per tenant per building.

```sql
CREATE TABLE leases (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id           TEXT NOT NULL REFERENCES properties(id),
  tenant                TEXT NOT NULL,
  status                TEXT NOT NULL CHECK (status IN (
                          'active','vacant','mtm','pre-comm','expired'
                        )),
  lease_type            TEXT NOT NULL CHECK (lease_type IN (
                          'NNN','Gross','Modified Gross','License'
                        )),
  tenant_sf             INTEGER,
  rate_per_sf           NUMERIC(8,2),          -- annual $/SF at current step
  commencement          DATE,
  expiration            DATE,
  term_months           INTEGER,
  renewal_options       TEXT,                  -- e.g. "1 × 5-yr"
  notice_period_days    INTEGER,               -- days notice required for renewal
  guarantor             TEXT,
  abatement_months      INTEGER DEFAULT 0,
  first_cash_rent       DATE,
  annual_escalation_pct NUMERIC(5,2),          -- e.g. 4.00
  expansion_sf          INTEGER,
  outside_delivery_date DATE,                  -- pre-comm only
  op_ex_responsibility  TEXT CHECK (op_ex_responsibility IN (
                          'Tenant','Landlord','Pro-rata'
                        )),
  cam_cap_pct           NUMERIC(5,2),
  security_deposit      NUMERIC(12,2),
  tenant_industry       TEXT,
  credit_rating         TEXT,
  public_ticker         TEXT,
  broker_name           TEXT,
  broker_commission     NUMERIC(12,2),
  footnote              TEXT,
  occupancy_override_pct NUMERIC(5,2),         -- only when auto-calc is wrong
  sharepoint_item_id    TEXT,                  -- Graph API item ID for sync
  last_amendment_date   DATE,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON leases(property_id);
CREATE INDEX ON leases(status);
CREATE INDEX ON leases(expiration);
```

---

### Table: `rent_steps`

Full rent schedule for step-rent leases (many per lease).

```sql
CREATE TABLE rent_steps (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id       UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  step_number    INTEGER NOT NULL,             -- 1-indexed
  effective_date DATE NOT NULL,
  monthly_rent   NUMERIC(12,2),
  annual_rent    NUMERIC(12,2),
  rate_per_sf    NUMERIC(8,2),                -- derived: annual_rent / tenant_sf
  UNIQUE (lease_id, step_number)
);
```

---

### Table: `ai_summaries`

One row per lease. Stores AI-generated and user-edited analysis.

```sql
CREATE TABLE ai_summaries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id          UUID NOT NULL UNIQUE REFERENCES leases(id) ON DELETE CASCADE,
  lease_structure   TEXT,
  financial_terms   TEXT,
  tenant_risk       TEXT,
  renewal_analysis  TEXT,
  notable_flags     TEXT,
  generated_by      TEXT,                     -- "claude-3-5", "gpt-4o", "manual"
  generated_at      TIMESTAMPTZ,
  last_edited_by    UUID REFERENCES users(id),
  last_edited_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);
```

---

### Table: `documents`

Lease documents and amendments stored in SharePoint; metadata mirrored here.

```sql
CREATE TABLE documents (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id              UUID REFERENCES leases(id),
  property_id           TEXT REFERENCES properties(id),
  doc_type              TEXT NOT NULL CHECK (doc_type IN (
                          'lease','amendment','estoppel','guaranty',
                          'notice','report','other'
                        )),
  title                 TEXT NOT NULL,
  sharepoint_file_id    TEXT NOT NULL,         -- Graph API driveItem ID
  sharepoint_web_url    TEXT,                  -- direct link to file in SharePoint
  version               INTEGER DEFAULT 1,
  effective_date        DATE,
  uploaded_by           UUID REFERENCES users(id),
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON documents(lease_id);
CREATE INDEX ON documents(property_id);
```

---

### Table: `tasks`

Action items linked to a property or lease (renewal notices, broker calls, delivery deadlines).

```sql
CREATE TABLE tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   TEXT REFERENCES properties(id),
  lease_id      UUID REFERENCES leases(id),
  title         TEXT NOT NULL,
  description   TEXT,
  due_date      DATE,
  priority      TEXT CHECK (priority IN ('high','medium','low')) DEFAULT 'medium',
  status        TEXT CHECK (status IN ('open','in-progress','done')) DEFAULT 'open',
  assigned_to   UUID REFERENCES users(id),
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

---

### Table: `notes`

Time-stamped comments on a property or lease.

```sql
CREATE TABLE notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT REFERENCES properties(id),
  lease_id    UUID REFERENCES leases(id),
  body        TEXT NOT NULL,
  author_id   UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

### Table: `users`

Platform users with role-based access.

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  display_name  TEXT,
  role          TEXT NOT NULL CHECK (role IN ('admin','analyst','read-only')),
  azure_oid     TEXT UNIQUE,                   -- Microsoft Entra object ID (for SSO)
  created_at    TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ
);
```

---

### Table: `funds`

Investment vehicles; groups properties by fund.

```sql
CREATE TABLE funds (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  vintage     INTEGER,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

### Table: `contacts`

Tenant reps, brokers, property managers — linked to properties or leases.

```sql
CREATE TABLE contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  role        TEXT,                            -- "Tenant Rep", "Broker", "PM", etc.
  email       TEXT,
  phone       TEXT,
  company     TEXT,
  property_id TEXT REFERENCES properties(id),
  lease_id    UUID REFERENCES leases(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

### Table: `sync_log`

Audit trail for every SharePoint → PostgreSQL sync operation.

```sql
CREATE TABLE sync_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source        TEXT NOT NULL,                 -- "sharepoint_list", "sharepoint_file", etc.
  operation     TEXT NOT NULL CHECK (operation IN ('insert','update','delete','skip')),
  entity_type   TEXT,                          -- "property", "lease", "document"
  entity_id     TEXT,
  sharepoint_id TEXT,
  changed_fields JSONB,
  error         TEXT,
  synced_at     TIMESTAMPTZ DEFAULT now()
);
```

---

## Entity Relationships

```
funds (1) ──────< properties (many)
                     │
                     ├──< leases (many)
                     │       │
                     │       ├── ai_summaries (1:1)
                     │       ├──< rent_steps (many)
                     │       ├──< documents (many)
                     │       ├──< tasks (many)
                     │       ├──< notes (many)
                     │       └──< contacts (many)
                     │
                     ├──< documents (many)   ← property-level docs
                     ├──< tasks (many)
                     └──< contacts (many)
```

---

## Status Codes

| Code | Label | Meaning |
|---|---|---|
| `active` | Active | Lease in effect, tenant in occupancy, rent being paid |
| `vacant` | Vacant | Building/suite physically unoccupied (lease may be contractually active) |
| `mtm` | MTM | Month-to-month; terminable on 30 days' notice |
| `pre-comm` | Pre-Comm | Lease executed; commencement pending Landlord delivery |
| `expired` | Expired | Lease term ended; tenant has departed |

Property-level status is derived by precedence: `vacant` → `expired` → `active` → `mtm`.

---

## Computed / Derived Values

Not stored — calculated at query time:

| Computed Value | Formula |
|---|---|
| **Portfolio avg rate** | `AVG(rate_per_sf)` WHERE `status = 'active' AND rate_per_sf IS NOT NULL` |
| **WALE** | Mean months to expiration across active leases with known `expiration` |
| **SF-weighted WALT** | `SUM(tenant_sf × months_remaining) / SUM(tenant_sf)` — requires `tenant_sf` |
| **Occupancy %** | `SUM(tenant_sf) / building_sf`; use `occupancy_override_pct` if set |
| **NOI estimate** | `SUM(tenant_sf × rate_per_sf)` for active leases |
| **Renewal notice due** | `expiration - INTERVAL '1 day' * notice_period_days` |
| **Expiry buckets** | `COUNT(*) GROUP BY EXTRACT(YEAR FROM expiration)` |

---

## SharePoint Sync: Excel Column Mapping

The Tenancy Report workbook is parsed row by row. Each row is one lease. Properties are identified by address — the sync service groups rows by address to build the `properties` → `leases` hierarchy.

**Assumed Excel column headers** (must match exactly — case-sensitive):

| Excel Column Header | PostgreSQL Field | Table | Notes |
|---|---|---|---|
| `Property Address` | `address` | `properties` | Used as grouping key |
| `City` | `city` | `properties` | |
| `State` | `state` | `properties` | |
| `MSA` | `msa` | `properties` | |
| `Building SF` | `building_sf` | `properties` | Currently blank in source |
| `Tenant` | `tenant` | `leases` | |
| `Lease Status` | `status` | `leases` | Normalized to: active / vacant / mtm / pre-comm / expired |
| `Lease Type` | `lease_type` | `leases` | NNN, Gross, License, etc. |
| `Tenant SF` | `tenant_sf` | `leases` | |
| `Base Rent ($/SF)` | `rate_per_sf` | `leases` | Annual $/SF |
| `Commencement Date` | `commencement` | `leases` | Excel date serial → ISO date |
| `Expiration Date` | `expiration` | `leases` | Excel date serial → ISO date |
| `Term (Months)` | `term_months` | `leases` | |
| `Renewal Options` | `renewal_options` | `leases` | Free text |
| `Guarantor` | `guarantor` | `leases` | |
| `Abatement Months` | `abatement_months` | `leases` | Default 0 if blank |
| `First Cash Rent` | `first_cash_rent` | `leases` | Excel date → ISO date |
| `Annual Escalation %` | `annual_escalation_pct` | `leases` | Stored as decimal, e.g. 4.00 |
| `Expansion SF` | `expansion_sf` | `leases` | |
| `Outside Delivery Date` | `outside_delivery_date` | `leases` | Pre-comm only |
| `Footnotes` | `footnote` | `leases` | |

> **Note:** The exact column headers in your Excel file should be confirmed and this mapping updated to match. The sync service uses this mapping table as its configuration — a mismatch silently skips the field and logs a warning.

---

## Known Data Gaps (Current Portfolio)

Must be collected from executed lease documents or added to the SharePoint list:

| Field | Records Missing | Impact |
|---|---|---|
| `building_sf` | 17 / 17 properties | Blocks occupancy %, cap rate, $/SF calcs |
| `tenant_sf` | ~12 / 21 leases | Blocks SF-weighted WALT, occupancy |
| `rate_per_sf` | ~8 / 21 leases | Blocks NOI estimate, portfolio avg rate |
| `commencement` | ~9 / 21 leases | Blocks term-remaining calc |
| `annual_escalation_pct` | ~15 / 21 leases | Blocks forward income projection |
| `term_months` | ~14 / 21 leases | Blocks WALT |
| `notice_period_days` | All leases | Blocks renewal notice due-date alert |

---

## Authentication

Production login uses **Microsoft Entra ID (Azure AD) SSO** — users sign in with their Leon Capital Microsoft 365 account. The `azure_oid` field on `users` maps the Entra object ID to a platform role. No separate password management required.

---

## Current Prototype File

```
app/src/data/leases.js
```

Exports: `properties`, `getPortfolioStats()`, `getPropertyById(id)`, `STATUS_COLORS`, `STATUS_LABELS`

This file is replaced by API calls to the PostgreSQL backend in production.
