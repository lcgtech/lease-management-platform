import { useNavigate, useLocation } from 'react-router-dom';
import { getPortfolioStats } from '../data/leases';

const stats = getPortfolioStats();
const urgentCount = stats.expiringLeases.length;

const NAV = [
  { section: 'Portfolio' },
  { path: '/',           label: 'Portfolio Overview', icon: '⊞' },
  { path: '/properties', label: 'Properties',         icon: '🏭' },
  { section: 'Leases' },
  { path: '/rent-roll',  label: 'Rent Roll',    icon: '📋', badge: stats.totalProperties },
  { path: '/calendar',   label: 'Lease Calendar', icon: '📅', badge: urgentCount, badgeRed: true },
  { section: 'Intelligence' },
  { path: '/ai-insights', label: 'AI Lease Insights', icon: '✦' },
  { divider: true },
  { section: 'Admin' },
  { path: '/export',   label: 'Export / Reports', icon: '↗' },
  { path: '/settings', label: 'Settings',         icon: '⚙' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav className="sidebar">
      <div className="sb-header">
        <div className="sb-logo" onClick={() => navigate('/')}>L</div>
        <div className="sb-brand">
          LEON CAPITAL
          <span>Lease Management</span>
        </div>
      </div>

      {NAV.map((item, i) => {
        if (item.divider) return <div key={i} className="sb-divider" />;
        if (item.section) return <div key={i} className="sb-section-label">{item.section}</div>;
        return (
          <div
            key={item.path}
            className={`sb-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sb-ico">{item.icon}</span>
            {item.label}
            {item.badge != null && (
              <span className={`sb-badge ${item.badgeRed ? 'red' : ''}`}>{item.badge}</span>
            )}
          </div>
        );
      })}

      <div className="sb-footer">
        <div className="sb-avatar">FH</div>
        <div className="sb-user">
          <strong>F. Hussain</strong>
          Leon Capital Group
        </div>
      </div>
    </nav>
  );
}
