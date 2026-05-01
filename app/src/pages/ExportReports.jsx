import Topbar from '../components/Topbar';

const cards = [
  { icon: '📊', title: 'Full Rent Roll — Excel', desc: 'Export all lease data matching the source format. Includes all fields: address, tenant, SF, rate, expiry, renewal, status, footnotes.', action: 'Download Excel' },
  { icon: '📄', title: 'Portfolio Overview — PDF', desc: 'Print-ready portfolio summary with KPI cards, expiry timeline chart, occupancy mix, and rent roll table in Leon Capital branding.', action: 'Download PDF' },
  { icon: '🏭', title: 'Property Summary — PDF', desc: 'Individual property report with full lease details, financial terms, AI insights, and your notes. Select a property from the Properties page first.', action: 'Select Property' },
];

export default function ExportReports() {
  return (
    <>
      <Topbar title="Export / Reports" sub="Generate formatted outputs" />
      <div className="page-content">
        <div className="export-grid">
          {cards.map(c => (
            <div key={c.title} className="export-card" onClick={() => alert(`${c.action} — available in the full build`)}>
              <div className="export-icon">{c.icon}</div>
              <div className="export-title">{c.title}</div>
              <div className="export-desc">{c.desc}</div>
              <button className="btn btn-primary" style={{ width: '100%' }}>{c.action}</button>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">📋 Export Notes</div>
          <ul style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 2, paddingLeft: 16 }}>
            <li>Excel export uses SheetJS — included in full build</li>
            <li>PDF reports use react-pdf — included in full build</li>
            <li>AI Notes you've typed are included in property PDF exports</li>
            <li>Data sourced from SharePoint in production; static JSON in this prototype</li>
          </ul>
        </div>
      </div>
    </>
  );
}
