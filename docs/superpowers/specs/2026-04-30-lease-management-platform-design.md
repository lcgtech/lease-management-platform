# Leon Capital — Lease Management Platform: Design Spec
**Date:** 2026-04-30  
**Author:** F. Hussain / Leon Capital Group  
**Status:** Approved — ready for implementation

---

## 1. Overview

A front-end web prototype for managing Leon Capital Group's industrial lease portfolio. Data is sourced from the Leon Industrial Tenancy Report Excel schedule (and eventually from SharePoint). The platform surfaces lease terms, financial data, key dates, and AI-generated summaries per lease section — all in a single, branded interface.

**Reference UI:** JLL Beacon (screenshots in `data/Interface for JLL/`)  
**Data source:** `data/LEON_Industrial_Tenancy_Report.xlsx` (sample data for prototype)  
**Future data sources:** Master Building List, Lease Repository, Loan Repository (SharePoint)

---

## 2. Branding

| Token | Value |
|---|---|
| Primary | Navy `#0a1f44` |
| Secondary | Navy2 `#0d2b5e` |
| Accent | Gold `#c9a84c` |
| Background | White `#ffffff` |
| Surface | Light `#f0f2f6` |
| Border | `#dde1e9` |
| Font | Inter / Segoe UI / Arial (system sans-serif stack) |
| Status: Active | Green `#2ecc8f` |
| Status: Vacant | Red `#e05c5c` |
| Status: MTM | Amber `#f0a030` |
| Status: Pre-comm | Blue `#6478dc` |

---

## 3. Layout

**Option A — Dashboard + Sidebar** (selected)

- Fixed 220px navy sidebar on the left with icon + label navigation
- Top bar with breadcrumb, page title, date pill, and search
- Main content area scrolls independently
- Sidebar collapses to icon-only at narrow widths (future)

---

## 4. Navigation — Sidebar Pages

| # | Label | Icon | Description |
|---|---|---|---|
| 1 | Portfolio Overview | ⊞ | Top-level KPI dashboard |
| 2 | Properties | 🏭 | All buildings list + property detail |
| 3 | Rent Roll | 📋 | Full tenancy table (badge: 14) |
| 4 | Lease Calendar | 📅 | Key date timeline (badge: alerts) |
| 5 | AI Lease Insights | ✦ | Per-property AI summaries |
| 6 | Export / Reports | ↗ | Excel / PDF export |
| 7 | Settings | ⚙ | Admin config |

Sidebar sections: **Portfolio**, **Leases**, **Intelligence**, **Admin**  
Footer: User avatar + name (F. Hussain / Leon Capital Group)

---

## 5. Pages

### 5.1 Portfolio Overview

**Purpose:** Landing page. Portfolio-level snapshot.

**KPI Cards (5):**
- Total Properties (14 — TX, AZ, SC, NC)
- Weighted Avg Occupancy (91.2% — excl. MTM & vacant)
- Avg Rate $/SF (weighted avg — paying tenants only)
- WALE — Weighted Average Lease Expiry (years)
- Expiring ≤ 12 months (count + tenant names)

**Charts (3-column row):**
- Lease Expiry Timeline — horizontal bar chart by year, color-coded (red = current year, amber = +1, gold = +2, navy/green = 3+)
- Occupancy Mix — donut chart (Active / MTM / Vacant / Pre-Comm)
- Properties by State — horizontal bar chart (TX, AZ, NC, SC)

**Rent Roll Table:**
- Columns: Property, Tenant, Bldg SF, Tenant SF, Rate ($/SF), Expiration, Renewal Options, Status badge, AI Notes (truncated, italic)
- Sortable columns, filter by status dropdown
- Export button (top-right of table card)
- Each row is clickable → navigates to Property Detail

---

### 5.2 Properties

**Purpose:** Visual list of all 14 buildings. Entry point to Property Detail.

**Layout:** Card grid (3 columns) or toggle to table view  
**Each card shows:** Address, city/state, tenant name, occupancy %, expiry date, status badge  
**Filter bar:** State, status, expiry window  
**Click a card → Property Detail page**

---

### 5.3 Property Detail

**Purpose:** Full detail view for a single property/lease.

**Hero bar (navy):**
- Property address + city/MSA
- Thumbnail icon
- KPI pills: Occupancy, Expiry date, Remaining term, Lease type
- Status badge (Active / Vacant / MTM / Pre-Comm / Expired)

**5 Tabs:**

#### Tab 1 — Lease Summary
- Lease Details: Tenant, Lease Type, Commencement, Expiration, Term (months), Renewal Options
- Space: Building SF, Tenant SF, Expansion SF (if any), Occupancy %
- Lease History: Original lease date, amendment count, controlling document
- Rent Step Schedule: Visual bar chart of rent periods / abatement / escalation
- Alert boxes for notable conditions (e.g., expansion space at $0 rent, MTM termination rights)
- Tags: NNN, anchor, free-rent period, etc.

#### Tab 2 — Financial Terms
- Base rent per period, escalation schedule, abatement months
- Operating expense structure
- Current paying rate vs. contract rate

#### Tab 3 — Tenant Info
- Tenant name, guarantor (if any), sector
- Tenant risk notes
- Contact / entity details (when available)

#### Tab 4 — Key Dates
- Commencement, expiration, renewal option windows
- Free rent period end, first cash rent date
- Rent bump dates
- Outside Delivery Date (for pre-commencement leases)
- Mini calendar view

#### Tab 5 — AI Insights & Notes
Five AI-generated sections, each followed by an editable user notes field:
1. **Lease Structure** — lease form, term, key structural provisions
2. **Financial Terms** — rent schedule, abatements, escalations, OpEx
3. **Tenant Risk Assessment** — tenant covenant, guarantor, sector risk
4. **Renewal & Options Analysis** — renewal options, holdover risk, re-leasing timeline
5. **Notable Clauses & Flags** — termination rights, special provisions, documentation gaps

Each section:
- AI text (generated from lease document / Excel footnotes)
- Editable notes box below (user can add context, flags, action items)

---

### 5.4 Rent Roll

**Purpose:** Dedicated full-screen tenancy table. Matches the Excel schedule exactly.

**Columns (from Excel):**
Property Address | Building SF | Occupancy % | Tenant | Tenant SF | Expiration | Current Rate ($/SF) | Renewal Options | Status | AI Notes

**Features:**
- Sort by any column
- Filter: State, Status (Active/Vacant/MTM/Pre-Comm/Expired), Expiry window
- Search by tenant name or address
- Status badges: Active (green), Vacant (red), MTM (amber), Pre-Comm (blue), Expired (grey/italic)
- Footnote indicators (superscript numbers → expandable tooltip with full footnote text)
- AI Notes column: truncated italic preview, click to expand full AI insight panel

---

### 5.5 Lease Calendar

**Purpose:** Timeline view of all critical lease events.

**View modes:** Month grid | Timeline strip  
**Event types:**
- 🔴 Lease Expiration
- 🟡 Renewal Option Window Opens
- 🟢 Lease Commencement
- 🔵 First Cash Rent Date
- ⚪ Annual Rent Bump
- ⚠ Outside Delivery Date (pre-comm)

**Alert badge:** Red counter on sidebar for events within 90 days  
**Click event → Property Detail**

---

### 5.6 AI Lease Insights

**Purpose:** Portfolio-wide AI summary hub. Browse AI insights across all properties without navigating to each one.

**Layout:** Left list of properties, right panel shows selected property's 5-section AI summary  
**Same 5-section structure as Tab 5 on Property Detail**  
**Editable notes fields persist per property**

---

### 5.7 Export / Reports

**Purpose:** Generate formatted output.

**Options:**
- Full rent roll → Excel (matching the source format)
- Individual property summary → PDF
- Portfolio overview → PDF (with KPI cards + charts)

---

## 6. Data Model — Lease Fields (from Excel)

| Field | Source | Notes |
|---|---|---|
| Property Address | Excel col A | Primary key |
| Building SF | Excel / Master Bldg List | From SharePoint future |
| Occupancy % | Calculated | Tenant SF / Bldg SF |
| Tenant Name | Excel col D | May have multiple per property |
| Tenant SF | Excel col E | |
| Lease Expiration | Excel col F | |
| Current Rate ($/SF) | Excel col G | NNN; excl. abatement periods |
| Renewal Options | Excel col H | e.g., "1 × 5-yr" |
| Status | Derived | Active / Vacant / MTM / Pre-Comm / Expired |
| Footnotes | Excel footnote section | → AI Notes input |
| AI Summary | Generated | 5 sections per property |
| User Notes | User-entered | Editable per AI section |

**Portfolio-level calculated fields:**
- Weighted Avg Occupancy (excl. MTM, vacant, pre-comm, abatement)
- Weighted Avg Rate (paying tenants only)
- WALE (weighted average lease expiry in years)
- Expiry count by year bucket

---

## 7. Sample Data

The prototype uses data from `data/LEON_Industrial_Tenancy_Report.xlsx`:

**14 properties across:** TX (10), AZ (3), NC (1), SC (1)

Key properties for prototype UI:
- **4301 Mansfield Hwy, Forest Hill TX** — Samsill Corp, Oct 2035 expiry, $0 expansion space
- **1917 W. 1st St, Tempe AZ** — AV Concepts, Jul 2026 expiry (urgent)
- **602 Fountain Pkwy, Grand Prairie TX** — ProSource + Translogistics (multi-tenant)
- **2727 Northaven Rd, Dallas TX** — UPS (investment-grade)
- **3615 Block Drive, Irving TX** — BP Aero (pre-commencement)

---

## 8. Tech Stack

**Framework:** React (Vite)  
**Styling:** Tailwind CSS (with custom Leon Capital theme tokens)  
**Charts:** Recharts  
**Data:** Static JSON parsed from Excel (prototype); SharePoint API (future)  
**Routing:** React Router (page-level, sidebar-driven)  
**State:** React Context (selected property, active tab, filter state)  
**Export:** SheetJS (Excel), html2pdf or react-pdf (PDF)

---

## 9. Out of Scope (Prototype)

- Authentication / SSO
- Live SharePoint data sync
- Loan Repository integration
- Master Building List integration
- Real AI inference (AI summaries will be pre-written from footnote text for prototype)
- Mobile / responsive layout

---

## 10. Approved Mockups

Located in `.superpowers/brainstorm/98924-1777595276/`:
- `layout-options.html` — layout approach selection (Option A chosen)
- `sidebar-nav.html` — navigation structure (6 pages confirmed)
- `portfolio-overview.html` — Portfolio Overview dashboard
- `property-detail.html` — Property Detail with 5 tabs + AI Insights
