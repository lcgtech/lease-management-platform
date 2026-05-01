import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import StatusBadge from '../components/StatusBadge';
import { properties } from '../data/leases';

const allRows = properties.flatMap(p =>
  p.leases.map(l => ({ ...l, property: p }))
);

export default function RentRoll() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterState, setFilterState] = useState('');
  const [sortCol, setSortCol] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(true); }
  };

  let rows = allRows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.property.address.toLowerCase().includes(q) || r.tenant.toLowerCase().includes(q);
    const matchStatus = !filterStatus || r.status === filterStatus;
    const matchState = !filterState || r.property.state === filterState;
    return matchSearch && matchStatus && matchState;
  });

  if (sortCol === 'expiry') {
    rows = [...rows].sort((a, b) => {
      const da = a.expiration || '9999';
      const db = b.expiration || '9999';
      return sortAsc ? da.localeCompare(db) : db.localeCompare(da);
    });
  } else if (sortCol === 'rate') {
    rows = [...rows].sort((a, b) => sortAsc ? (a.rate ?? 0) - (b.rate ?? 0) : (b.rate ?? 0) - (a.rate ?? 0));
  }

  const SortTh = ({ col, children }) => (
    <th onClick={() => handleSort(col)} style={{ cursor: 'pointer' }}>
      {children} {sortCol === col ? (sortAsc ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <>
      <Topbar title="Rent Roll" sub={`${allRows.length} leases across ${properties.length} properties`} />
      <div className="page-content">
        <div className="filter-bar">
          <input
            className="filter-input"
            placeholder="🔍  Search address or tenant…"
            style={{ width: 240 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="filter-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="vacant">Vacant</option>
            <option value="mtm">MTM</option>
            <option value="pre-comm">Pre-Comm</option>
            <option value="expired">Expired</option>
          </select>
          <select className="filter-input" value={filterState} onChange={e => setFilterState(e.target.value)}>
            <option value="">All States</option>
            <option>TX</option><option>AZ</option><option>NC</option><option>SC</option>
          </select>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--muted)' }}>
            {rows.length} of {allRows.length} leases
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => alert('Export to Excel — coming in full build')}>
            ↗ Export Excel
          </button>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Tenant</th>
                <th>State</th>
                <th>Tenant SF</th>
                <SortTh col="rate">Rate $/SF</SortTh>
                <SortTh col="expiry">Expiration</SortTh>
                <th>Renewal</th>
                <th>Status</th>
                <th>AI Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} onClick={() => navigate(`/properties/${r.property.id}`)}>
                  <td>
                    <strong style={{ color: 'var(--navy)' }}>{r.property.address}</strong>
                    <span className="addr-sub">{r.property.city}</span>
                  </td>
                  <td>{r.tenant}</td>
                  <td>{r.property.state}</td>
                  <td>{r.tenantSF ? r.tenantSF.toLocaleString() : '—'}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {r.rate != null ? `$${r.rate.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ fontWeight: r.status === 'active' ? 500 : 400, color: r.expiration && r.expiration < '2026-12' ? 'var(--red)' : 'inherit' }}>
                    {r.expirationDisplay || '—'}
                  </td>
                  <td>{r.renewalOptions || '—'}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    <span className="ai-preview">
                      ✦ {r.aiSummary?.notableFlags?.slice(0, 55)}…
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
