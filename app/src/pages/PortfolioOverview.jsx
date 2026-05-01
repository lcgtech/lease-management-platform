import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, Cell, XAxis, YAxis,
  PieChart, Pie, Tooltip, ResponsiveContainer, LabelList,
} from 'recharts';
import Topbar from '../components/Topbar';
import StatusBadge from '../components/StatusBadge';
import { properties, getPortfolioStats } from '../data/leases';

const stats = getPortfolioStats();

const expiryData = [
  { year: '2026', count: stats.expiryBuckets['2026'],  fill: '#e05c5c' },
  { year: '2027', count: stats.expiryBuckets['2027'],  fill: '#f0a030' },
  { year: '2028', count: stats.expiryBuckets['2028'],  fill: '#c9a84c' },
  { year: '2029', count: stats.expiryBuckets['2029'],  fill: '#0a1f44' },
  { year: '2030+', count: stats.expiryBuckets['2030+'], fill: '#2ecc8f' },
];

const occupancyData = [
  { name: 'Active',   value: stats.statusCounts.active,        fill: '#2ecc8f' },
  { name: 'MTM',      value: stats.statusCounts.mtm,           fill: '#f0a030' },
  { name: 'Vacant',   value: stats.statusCounts.vacant,        fill: '#e05c5c' },
  { name: 'Pre-Comm', value: stats.statusCounts['pre-comm'],   fill: '#6478dc' },
  { name: 'Expired',  value: stats.statusCounts.expired,       fill: '#ccc'    },
].filter(d => d.value > 0);

const stateData = [
  { state: 'TX', count: stats.stateCounts.TX, fill: '#0a1f44' },
  { state: 'AZ', count: stats.stateCounts.AZ, fill: '#c9a84c' },
  { state: 'NC', count: stats.stateCounts.NC, fill: '#f0a030' },
  { state: 'SC', count: stats.stateCounts.SC, fill: '#2ecc8f' },
];

const STATUS_COUNT_MAP = {
  Active:    stats.statusCounts.active,
  MTM:       stats.statusCounts.mtm,
  Vacant:    stats.statusCounts.vacant,
  'Pre-Comm': stats.statusCounts['pre-comm'],
  Expired:   stats.statusCounts.expired,
};

const LEGEND = [
  { label: 'Active',    color: '#2ecc8f' },
  { label: 'MTM',       color: '#f0a030' },
  { label: 'Vacant',    color: '#e05c5c' },
  { label: 'Pre-Comm',  color: '#6478dc' },
  { label: 'Expired',   color: '#ccc'    },
];

export default function PortfolioOverview() {
  const navigate = useNavigate();
  const allLeases = properties.flatMap(p => p.leases.map(l => ({ ...l, property: p })));

  return (
    <>
      <Topbar title="Portfolio Overview" sub="LEON Industrial — All Properties" />
      <div className="page-content">

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Total Properties</div>
            <div className="kpi-value">{stats.totalProperties}</div>
            <div className="kpi-sub">TX · AZ · NC · SC</div>
          </div>
          <div className="kpi-card green">
            <div className="kpi-label">Wtd Avg Occupancy</div>
            <div className="kpi-value">91.2%</div>
            <div className="kpi-sub">Paying tenants only</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Avg Rate ($/SF)</div>
            <div className="kpi-value">${stats.avgRate}</div>
            <div className="kpi-sub">Active, paying tenants</div>
          </div>
          <div className="kpi-card navy">
            <div className="kpi-label">WALE</div>
            <div className="kpi-value">{stats.wale} yr</div>
            <div className="kpi-sub">Wtd avg lease expiry</div>
          </div>
          <div className="kpi-card red">
            <div className="kpi-label">Expiring ≤ 12 mo</div>
            <div className="kpi-value">{stats.expiringLeases.length}</div>
            <div className="kpi-sub" style={{ color: '#9a2020' }}>
              {stats.expiringLeases.map(l => l.tenant.split(' ')[0]).join(' · ')}
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="charts-row">

          {/* Expiry Timeline — horizontal bar chart */}
          <div className="card">
            <div className="card-title">Lease Expiry Timeline</div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart
                data={expiryData}
                layout="vertical"
                margin={{ top: 4, right: 40, bottom: 4, left: 8 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 'dataMax + 1']}
                  allowDecimals={false}
                  tick={{ fontSize: 9, fill: '#6b7a9b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="year"
                  width={36}
                  tick={{ fontSize: 10, fill: '#0a1f44', fontWeight: 700 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={v => [`${v} lease${v !== 1 ? 's' : ''}`, 'Expiring']}
                  contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid #dde1e9' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  {expiryData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{ fontSize: 10, fontWeight: 700, fill: '#1a2340' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Occupancy Mix — donut */}
          <div className="card">
            <div className="card-title">Occupancy Mix</div>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={52}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {occupancyData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [v, n]}
                  contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid #dde1e9' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
              {LEGEND.map(({ label, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span>{label}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--navy)' }}>
                    {STATUS_COUNT_MAP[label] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Properties by State — custom bars */}
          <div className="card">
            <div className="card-title">Properties by State</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
              {stateData.map(({ state, count, fill }) => (
                <div key={state} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, width: 24, color: 'var(--navy)', fontWeight: 700 }}>{state}</span>
                  <div style={{ flex: 1, background: 'var(--lt)', borderRadius: 4, height: 18, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(count / stats.totalProperties) * 100}%`,
                      background: fill,
                      height: '100%',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 6,
                      transition: 'width .4s',
                    }}>
                      {count >= 2 && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>{count}</span>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--navy)', width: 12, textAlign: 'right' }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rent Roll Table */}
        <div className="table-card">
          <div className="table-header">
            <span className="table-title">Rent Roll — All Tenants</span>
            <span className="table-spacer" />
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/rent-roll')}>
              Full Rent Roll →
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Tenant</th>
                <th>Rate $/SF</th>
                <th>Expiration</th>
                <th>Renewal</th>
                <th>Status</th>
                <th>AI Notes</th>
              </tr>
            </thead>
            <tbody>
              {allLeases.map((l, i) => (
                <tr key={i} style={{ cursor: 'pointer' }} onClick={() => navigate(`/properties/${l.property.id}`)}>
                  <td>
                    <strong style={{ color: 'var(--navy)' }}>{l.property.address}</strong>
                    <span className="addr-sub">{l.property.city}</span>
                  </td>
                  <td style={{ maxWidth: 180 }}>{l.tenant}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {l.rate != null ? `$${l.rate.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ color: l.expiration && l.expiration < '2026-12' ? 'var(--red)' : 'inherit', fontWeight: l.expiration && l.expiration < '2026-12' ? 700 : 400 }}>
                    {l.expirationDisplay || '—'}
                  </td>
                  <td>{l.renewalOptions || '—'}</td>
                  <td><StatusBadge status={l.status} /></td>
                  <td>
                    <span className="ai-preview">
                      ✦ {l.aiSummary?.leaseStructure?.slice(0, 55)}…
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
