import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import StatusBadge from '../components/StatusBadge';
import { getPropertyById } from '../data/leases';

const TABS = ['Lease Summary', 'Financial Terms', 'Tenant Info', 'Key Dates', 'AI Insights & Notes'];

function Field({ label, value, sub, color }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      <div className="field-value" style={color ? { color } : {}}>{value || '—'}</div>
      {sub && <div className="field-sub">{sub}</div>}
    </div>
  );
}

function AiInsightsTab({ property, lease }) {
  const [notes, setNotes] = useState({});
  const ai = lease.aiSummary;
  const sections = [
    { key: 'leaseStructure',   title: '📋 Lease Structure' },
    { key: 'financialTerms',   title: '💰 Financial Terms' },
    { key: 'tenantRisk',       title: '🏢 Tenant Risk Assessment' },
    { key: 'renewalAnalysis',  title: '🔄 Renewal & Options Analysis' },
    { key: 'notableFlags',     title: '⚠ Notable Clauses & Flags' },
  ];

  return (
    <div>
      <div className="ai-section">
        <div className="ai-section-header">
          <span style={{ fontSize: 16 }}>✦</span>
          <span className="ai-section-title">AI Lease Insights — {property.address}</span>
          <span className="ai-section-sub">From lease documents · Apr 30, 2026</span>
        </div>
        <div className="ai-body">
          {sections.map(({ key, title }) => (
            <div className="ai-subsection" key={key}>
              <div className="ai-sub-title">{title}</div>
              <div className="ai-text">{ai[key]}</div>
              <div className="ai-notes-label">✏ Your notes</div>
              <textarea
                className="ai-notes-box"
                placeholder="Add context, flags, or action items…"
                value={notes[key] || ''}
                onChange={e => setNotes(n => ({ ...n, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [activeLease, setActiveLease] = useState(0);

  const property = getPropertyById(id);
  if (!property) return (
    <div className="page-content" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 36 }}>🏭</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginTop: 12 }}>Property not found</div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/properties')}>
        Back to Properties
      </button>
    </div>
  );

  const lease = property.leases[activeLease];

  return (
    <>
      {/* Topbar with breadcrumb */}
      <div className="topbar">
        <div className="breadcrumb">
          <button className="crumb-link" onClick={() => navigate('/properties')}>Properties</button>
          <span className="sep">›</span>
          <span className="current">{property.address}</span>
        </div>
        <div className="topbar-spacer" />
        <div className="topbar-pill">As of April 30, 2026</div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/properties')}>← Back</button>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/export')}>↗ Export</button>
      </div>

      {/* Hero */}
      <div className="prop-hero">
        <div className="prop-hero-inner">
          <div className="prop-hero-icon">🏭</div>
          <div style={{ flex: 1 }}>
            <div className="prop-hero-address">{property.address}</div>
            <div className="prop-hero-city">{property.city} · {property.msa}</div>
            <div className="prop-hero-kpis">
              <div>
                <div className="hero-kpi-val">{lease.expirationDisplay || 'TBD'}</div>
                <div className="hero-kpi-lbl">Lease Expiry</div>
              </div>
              <div>
                <div className="hero-kpi-val">{lease.leaseType || 'NNN'}</div>
                <div className="hero-kpi-lbl">Lease Type</div>
              </div>
              <div>
                <div className="hero-kpi-val">{lease.renewalOptions || '—'}</div>
                <div className="hero-kpi-lbl">Renewal Options</div>
              </div>
              {lease.rate != null && (
                <div>
                  <div className="hero-kpi-val">${lease.rate.toFixed(2)}/SF</div>
                  <div className="hero-kpi-lbl">Current Rate</div>
                </div>
              )}
            </div>
          </div>
          <div>
            <StatusBadge status={lease.status} />
          </div>
        </div>

        {/* Multi-tenant selector */}
        {property.leases.length > 1 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {property.leases.map((l, i) => (
              <button
                key={i}
                onClick={() => setActiveLease(i)}
                style={{
                  background: activeLease === i ? 'var(--gold)' : 'rgba(255,255,255,.15)',
                  color: activeLease === i ? 'var(--navy)' : 'rgba(255,255,255,.8)',
                  border: 'none', borderRadius: 6, padding: '4px 12px',
                  fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                }}
              >
                {l.tenant.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((t, i) => (
          <div key={i} className={`tab-item ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
            {t}
          </div>
        ))}
      </div>

      {/* Tab content */}
      <div className="page-content">

        {/* TAB 0 — Lease Summary */}
        {activeTab === 0 && (
          <>
            {(lease.status === 'vacant' || lease.status === 'expired') && (
              <div className="alert-box red mb-14">
                <span className="alert-icon">⚠</span>
                <div>
                  <strong>
                    {lease.status === 'vacant' ? 'Property Physically Vacant' : 'Lease Expired'}
                  </strong>
                  {lease.footnote && <div style={{ marginTop: 4 }}>{lease.footnote}</div>}
                </div>
              </div>
            )}
            {lease.expansionSF && (
              <div className="alert-box amber mb-14">
                <span className="alert-icon">⚠</span>
                <div>
                  <strong>Expansion Space:</strong> {lease.expansionSF.toLocaleString()} SF occupied at $0 base rent. Landlord holds 30-day termination right on this space.
                </div>
              </div>
            )}

            <div className="three-col">
              <div className="card">
                <div className="card-title">📋 Lease Details</div>
                <div className="field-grid">
                  <Field label="Tenant" value={lease.tenant} />
                  <Field label="Lease Type" value={lease.leaseType} />
                  <Field label="Commencement" value={lease.commencement || '—'} />
                  <Field label="Expiration" value={lease.expirationDisplay} />
                  <Field label="Term" value={lease.termMonths ? `${lease.termMonths} months` : '—'} />
                  <Field label="Renewal Options" value={lease.renewalOptions} />
                </div>
              </div>

              <div className="card">
                <div className="card-title">📐 Space</div>
                <div className="field-grid">
                  <Field label="Building SF" value={property.buildingSF ? property.buildingSF.toLocaleString() : 'See Master Bldg List'} sub="From SharePoint" />
                  <Field label="Tenant SF" value={lease.tenantSF ? lease.tenantSF.toLocaleString() : '—'} />
                  {lease.expansionSF && <Field label="Expansion SF" value={lease.expansionSF.toLocaleString()} sub="$0 base rent" color="var(--amber)" />}
                  <Field label="Status" value={<StatusBadge status={lease.status} />} />
                </div>
              </div>

              <div className="card">
                <div className="card-title">📜 Notes & Flags</div>
                <div style={{ fontSize: 11, color: '#2a3650', lineHeight: 1.6 }}>
                  {lease.footnote || 'No special notes on file for this lease.'}
                </div>
                {lease.guarantor && (
                  <div style={{ marginTop: 10 }}>
                    <div className="field-label">Guarantor</div>
                    <div className="field-value">{lease.guarantor}</div>
                  </div>
                )}
                <div className="tags">
                  <span className="tag">{lease.leaseType || 'NNN'}</span>
                  {lease.abatementMonths > 0 && <span className="tag gold">Free rent period</span>}
                  {lease.annualEscalation && <span className="tag gold">{lease.annualEscalation}% annual bump</span>}
                  {lease.guarantor && <span className="tag gold">Guaranteed</span>}
                  {lease.expansionSF && <span className="tag red">$0 expansion space</span>}
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 1 — Financial Terms */}
        {activeTab === 1 && (
          <div className="three-col">
            <div className="card">
              <div className="card-title">💰 Rate Information</div>
              <div className="field-grid">
                <Field label="Current Rate ($/SF)" value={lease.rate != null ? `$${lease.rate.toFixed(2)} NNN` : '—'} />
                <Field label="Annual Escalation" value={lease.annualEscalation ? `${lease.annualEscalation}%` : '—'} />
                <Field label="Abatement Months" value={lease.abatementMonths > 0 ? `${lease.abatementMonths} months` : 'None'} />
                <Field label="First Cash Rent" value={lease.firstCashRent || '—'} />
              </div>
            </div>
            <div className="card">
              <div className="card-title">📊 Expense Structure</div>
              <div className="field-grid">
                <Field label="Lease Type" value={lease.leaseType || 'NNN'} />
                <Field label="OpEx Structure" value="Tenant responsible" />
                <Field label="Insurance" value="Tenant responsible" />
                <Field label="Taxes" value="Tenant responsible" />
              </div>
            </div>
            <div className="card">
              <div className="card-title">📋 Financial Notes</div>
              <div style={{ fontSize: 11, color: '#2a3650', lineHeight: 1.6 }}>
                {lease.aiSummary?.financialTerms || '—'}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 — Tenant Info */}
        {activeTab === 2 && (
          <div className="two-col">
            <div className="card">
              <div className="card-title">🏢 Tenant Details</div>
              <div className="field-grid">
                <Field label="Tenant Name" value={lease.tenant} />
                <Field label="Guarantor" value={lease.guarantor || 'None noted'} />
                <Field label="Lease Status" value={<StatusBadge status={lease.status} />} />
                <Field label="Lease Type" value={lease.leaseType || 'NNN'} />
              </div>
            </div>
            <div className="card">
              <div className="card-title">⚠ Risk Assessment</div>
              <div style={{ fontSize: 11, color: '#2a3650', lineHeight: 1.6 }}>
                {lease.aiSummary?.tenantRisk || '—'}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3 — Key Dates */}
        {activeTab === 3 && (
          <div className="two-col">
            <div className="card">
              <div className="card-title">📅 Critical Dates</div>
              <div className="field-grid">
                <Field label="Commencement" value={lease.commencement || '—'} />
                <Field label="Expiration" value={lease.expirationDisplay || '—'} />
                <Field label="First Cash Rent" value={lease.firstCashRent || '—'} />
                <Field label="Outside Delivery Date" value={lease.outsideDeliveryDate || '—'} />
                <Field label="Abatement End" value={lease.abatementMonths > 0 ? `${lease.abatementMonths} months from commencement` : 'N/A'} />
                <Field label="Renewal Options" value={lease.renewalOptions || '—'} />
              </div>
            </div>
            <div className="card">
              <div className="card-title">🔄 Renewal Analysis</div>
              <div style={{ fontSize: 11, color: '#2a3650', lineHeight: 1.6 }}>
                {lease.aiSummary?.renewalAnalysis || '—'}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4 — AI Insights */}
        {activeTab === 4 && <AiInsightsTab property={property} lease={lease} />}

      </div>
    </>
  );
}
