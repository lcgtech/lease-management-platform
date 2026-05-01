import { useState } from 'react';
import Topbar from '../components/Topbar';
import StatusBadge from '../components/StatusBadge';
import { properties } from '../data/leases';

const allLeases = properties.flatMap(p =>
  p.leases.map(l => ({ ...l, property: p, key: `${p.id}-${l.tenant.slice(0, 10)}` }))
);

const SECTIONS = [
  { key: 'leaseStructure',  title: '📋 Lease Structure' },
  { key: 'financialTerms',  title: '💰 Financial Terms' },
  { key: 'tenantRisk',      title: '🏢 Tenant Risk Assessment' },
  { key: 'renewalAnalysis', title: '🔄 Renewal & Options Analysis' },
  { key: 'notableFlags',    title: '⚠ Notable Clauses & Flags' },
];

export default function AiInsights() {
  const [selected, setSelected] = useState(allLeases[0]);
  const [notes, setNotes] = useState({});

  const noteKey = (leaseKey, section) => `${leaseKey}::${section}`;

  return (
    <>
      <Topbar title="AI Lease Insights" sub="Portfolio-wide AI summaries with editable notes" />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <div className="ai-split" style={{ flex: 1, overflow: 'hidden' }}>

          {/* Property list */}
          <div className="ai-prop-list">
            <div style={{ padding: '10px 14px 6px', fontSize: 9, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              {allLeases.length} Leases
            </div>
            {allLeases.map(l => (
              <div
                key={l.key}
                className={`ai-prop-item ${selected?.key === l.key ? 'active' : ''}`}
                onClick={() => setSelected(l)}
              >
                <div className="ai-prop-name">{l.property.address}</div>
                <div className="ai-prop-city">{l.property.city}</div>
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <StatusBadge status={l.status} />
                  <span style={{ fontSize: 9, color: 'var(--muted)' }}>{l.expirationDisplay || 'MTM'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          <div className="ai-prop-detail">
            {selected && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: 2 }}>
                    {selected.property.address}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
                    {selected.property.city} · {selected.tenant}
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="ai-section">
                  <div className="ai-section-header">
                    <span style={{ fontSize: 16 }}>✦</span>
                    <span className="ai-section-title">AI Lease Insights</span>
                    <span className="ai-section-sub">Generated · Apr 30, 2026</span>
                  </div>
                  <div className="ai-body">
                    {SECTIONS.map(({ key, title }) => (
                      <div className="ai-subsection" key={key}>
                        <div className="ai-sub-title">{title}</div>
                        <div className="ai-text">{selected.aiSummary[key]}</div>
                        <div className="ai-notes-label">✏ Your notes</div>
                        <textarea
                          className="ai-notes-box"
                          placeholder="Add context, flags, or action items…"
                          value={notes[noteKey(selected.key, key)] || ''}
                          onChange={e => setNotes(n => ({
                            ...n,
                            [noteKey(selected.key, key)]: e.target.value
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
