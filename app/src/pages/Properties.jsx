import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import StatusBadge from '../components/StatusBadge';
import { properties } from '../data/leases';

const getPrimaryLease = (p) => p.leases[0];

const getStatusForProp = (p) => {
  if (p.leases.some(l => l.status === 'vacant'))   return 'vacant';
  if (p.leases.every(l => l.status === 'expired'))  return 'expired';
  if (p.leases.some(l => l.status === 'active'))    return 'active';
  if (p.leases.some(l => l.status === 'mtm'))       return 'mtm';
  return p.leases[0]?.status || 'active';
};

/* ── View-toggle button ── */
function ViewToggle({ view, onChange }) {
  const btn = (v, icon, label) => (
    <button
      onClick={() => onChange(v)}
      title={label}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 12px', border: 'none', borderRadius: 0,
        fontSize: 11, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'var(--font)',
        background: view === v ? 'var(--navy)' : 'var(--white)',
        color:      view === v ? 'var(--gold)' : 'var(--muted)',
        transition: 'all .15s',
      }}
    >
      {icon} {label}
    </button>
  );
  return (
    <div style={{
      display: 'flex', border: '1px solid var(--border)',
      borderRadius: 7, overflow: 'hidden',
    }}>
      {btn('card', '⊞', 'Cards')}
      {btn('list', '☰', 'List')}
    </div>
  );
}

/* ── Card view ── */
function CardView({ filtered, navigate }) {
  return (
    <div className="prop-grid">
      {filtered.map(p => {
        const lease = getPrimaryLease(p);
        const status = getStatusForProp(p);
        const multiTenant = p.leases.length > 1;
        return (
          <div key={p.id} className="prop-card" onClick={() => navigate(`/properties/${p.id}`)}>
            {/* Navy header: icon · address · badge */}
            <div className="prop-card-hero" style={{ justifyContent: 'flex-start', padding: '0 14px', gap: 12, height: 80 }}>
              <span style={{ fontSize: 26, flexShrink: 0 }}>🏭</span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.address}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>
                  {p.city}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <StatusBadge status={status} />
              </div>
            </div>

            {/* White body */}
            <div className="prop-card-body">
              <div className="prop-meta-row">
                <span className="prop-meta-label">Expiry</span>
                <span className="prop-meta-value">{lease.expirationDisplay || '—'}</span>
              </div>
              <div className="prop-meta-row">
                <span className="prop-meta-label">Rate</span>
                <span className="prop-meta-value">
                  {lease.rate != null ? `$${lease.rate.toFixed(2)}/SF` : '—'}
                </span>
              </div>
              <div className="prop-meta-row">
                <span className="prop-meta-label">Renewal</span>
                <span className="prop-meta-value">{lease.renewalOptions || '—'}</span>
              </div>
            </div>

            <div className="prop-card-footer">
              {multiTenant
                ? `${p.leases.length} tenants — ${lease.tenant.split(' ')[0]}…`
                : lease.tenant}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── List view ── */
function ListView({ filtered, navigate }) {
  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th style={{ width: 32 }}></th>
            <th>Address</th>
            <th>City / State</th>
            <th>Tenant(s)</th>
            <th>Rate $/SF</th>
            <th>Expiry</th>
            <th>Renewal</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => {
            const lease = getPrimaryLease(p);
            const status = getStatusForProp(p);
            const multiTenant = p.leases.length > 1;
            return (
              <tr
                key={p.id}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/properties/${p.id}`)}
              >
                <td style={{ fontSize: 18, textAlign: 'center', paddingRight: 0 }}>🏭</td>
                <td>
                  <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{p.address}</span>
                </td>
                <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{p.city}</td>
                <td style={{ maxWidth: 200 }}>
                  {multiTenant
                    ? <span>{p.leases.length} tenants <span style={{ color: 'var(--muted)', fontSize: 10 }}>({lease.tenant.split(' ')[0]}…)</span></span>
                    : lease.tenant}
                </td>
                <td style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {lease.rate != null ? `$${lease.rate.toFixed(2)}` : '—'}
                </td>
                <td style={{
                  whiteSpace: 'nowrap',
                  color: lease.expiration && lease.expiration < '2026-12' ? 'var(--red)' : 'inherit',
                  fontWeight: lease.expiration && lease.expiration < '2026-12' ? 700 : 400,
                }}>
                  {lease.expirationDisplay || '—'}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{lease.renewalOptions || '—'}</td>
                <td><StatusBadge status={status} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Page ── */
export default function Properties() {
  const navigate = useNavigate();
  const [view, setView] = useState('card');
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = properties.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || p.address.toLowerCase().includes(q)
      || p.city.toLowerCase().includes(q)
      || p.leases.some(l => l.tenant.toLowerCase().includes(q));
    const matchState  = !filterState  || p.state === filterState;
    const matchStatus = !filterStatus || p.leases.some(l => l.status === filterStatus);
    return matchSearch && matchState && matchStatus;
  });

  return (
    <>
      <Topbar title="Properties" sub={`${properties.length} buildings across TX · AZ · NC · SC`} />
      <div className="page-content">

        {/* Filter bar */}
        <div className="filter-bar">
          <input
            className="filter-input"
            placeholder="🔍  Search address or tenant…"
            style={{ width: 240 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="filter-input" value={filterState} onChange={e => setFilterState(e.target.value)}>
            <option value="">All States</option>
            <option>TX</option><option>AZ</option><option>NC</option><option>SC</option>
          </select>
          <select className="filter-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="vacant">Vacant</option>
            <option value="mtm">MTM</option>
            <option value="pre-comm">Pre-Comm</option>
            <option value="expired">Expired</option>
          </select>

          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--muted)' }}>
            {filtered.length} of {properties.length} shown
          </span>

          <ViewToggle view={view} onChange={setView} />
        </div>

        {view === 'card'
          ? <CardView filtered={filtered} navigate={navigate} />
          : <ListView filtered={filtered} navigate={navigate} />
        }

      </div>
    </>
  );
}
