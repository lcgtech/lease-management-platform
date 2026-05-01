import Topbar from '../components/Topbar';

export default function Settings() {
  return (
    <>
      <Topbar title="Settings" sub="Platform configuration" />
      <div className="page-content">
        <div className="settings-section">
          <div className="settings-title">Data Source</div>
          <div className="settings-row">
            <div>
              <div className="settings-label">Data Mode</div>
              <div className="settings-sub">Current: Static JSON (prototype). Production: SharePoint API.</div>
            </div>
            <button className="btn btn-secondary btn-sm">Configure SharePoint →</button>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-label">Master Building List</div>
              <div className="settings-sub">Connect to SharePoint for building SF data</div>
            </div>
            <button className="btn btn-secondary btn-sm">Connect</button>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-label">Loan Repository</div>
              <div className="settings-sub">Link loan data per property</div>
            </div>
            <button className="btn btn-secondary btn-sm">Connect</button>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-title">Branding</div>
          <div className="settings-row">
            <div>
              <div className="settings-label">Organisation Name</div>
              <div className="settings-sub">Shown in sidebar and reports</div>
            </div>
            <input className="filter-input" defaultValue="Leon Capital Group" style={{ width: 200 }} />
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-label">Report Date</div>
              <div className="settings-sub">As-of date shown in platform and exports</div>
            </div>
            <input className="filter-input" type="date" defaultValue="2026-04-30" />
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-title">User</div>
          <div className="settings-row">
            <div>
              <div className="settings-label">F. Hussain</div>
              <div className="settings-sub">fhussain@leoncapitalgroup.com</div>
            </div>
            <span style={{ fontSize: 10, color: 'var(--muted)' }}>Admin</span>
          </div>
        </div>
      </div>
    </>
  );
}
