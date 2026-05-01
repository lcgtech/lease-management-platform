import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { properties } from '../data/leases';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function buildEvents() {
  const events = [];
  properties.forEach(p => {
    p.leases.forEach(l => {
      if (l.expiration) {
        const [yr, mo] = l.expiration.split('-');
        events.push({ type: 'expiry', year: yr, month: parseInt(mo) - 1, label: `${l.tenant.split(' ')[0]} – Expiry`, propertyId: p.id });
      }
      if (l.commencement) {
        const d = new Date(l.commencement);
        events.push({ type: 'comm', year: String(d.getFullYear()), month: d.getMonth(), label: `${l.tenant.split(' ')[0]} – Comm.`, propertyId: p.id });
      }
      if (l.firstCashRent) {
        const [yr, mo] = l.firstCashRent.split('-');
        events.push({ type: 'rent', year: yr, month: parseInt(mo) - 1, label: `${l.tenant.split(' ')[0]} – Cash Rent`, propertyId: p.id });
      }
      if (l.outsideDeliveryDate) {
        const d = new Date(l.outsideDeliveryDate);
        events.push({ type: 'delivery', year: String(d.getFullYear()), month: d.getMonth(), label: `${l.tenant.split(' ')[0]} – Delivery OD`, propertyId: p.id });
      }
    });
  });
  return events;
}

const allEvents = buildEvents();

export default function LeaseCalendar() {
  const navigate = useNavigate();
  const years = ['2026', '2027'];

  const getEvents = (year, monthIdx) =>
    allEvents.filter(e => e.year === year && e.month === monthIdx);

  return (
    <>
      <Topbar title="Lease Calendar" sub="Key lease events across the portfolio" />
      <div className="page-content">
        <div className="cal-legend">
          <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background: 'var(--red)' }} />Lease Expiry</div>
          <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background: 'var(--green)' }} />Commencement</div>
          <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background: 'var(--gold)' }} />First Cash Rent</div>
          <div className="cal-legend-item"><div className="cal-legend-dot" style={{ background: 'var(--blue)' }} />Outside Delivery</div>
        </div>

        {years.map(year => (
          <div key={year}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--navy)', marginBottom: 10, marginTop: 4 }}>
              {year}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
              {MONTHS.map((mo, i) => {
                const evs = getEvents(year, i);
                return (
                  <div key={mo} className="cal-month-card">
                    <div className="cal-month-name">{mo} {year}</div>
                    {evs.length === 0
                      ? <div style={{ fontSize: 9, color: 'var(--border)', fontStyle: 'italic' }}>No events</div>
                      : evs.map((e, j) => (
                        <div
                          key={j}
                          className={`cal-event ${e.type}`}
                          onClick={() => navigate(`/properties/${e.propertyId}`)}
                        >
                          {e.label}
                        </div>
                      ))
                    }
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Upcoming alerts */}
        <div className="card">
          <div className="card-title">⚠ Urgent — Events Within 90 Days</div>
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Tenant</th>
                <th>Event</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {properties.flatMap(p => p.leases.map(l => ({ ...l, property: p })))
                .filter(l => {
                  if (!l.expiration) return false;
                  const exp = new Date(l.expiration + '-01');
                  const today = new Date('2026-04-30');
                  const days = (exp - today) / (1000 * 60 * 60 * 24);
                  return days >= 0 && days <= 90;
                })
                .map((l, i) => (
                  <tr key={i} style={{ cursor: 'pointer' }} onClick={() => navigate(`/properties/${l.property.id}`)}>
                    <td><strong style={{ color: 'var(--navy)' }}>{l.property.address}</strong><span className="addr-sub">{l.property.city}</span></td>
                    <td>{l.tenant}</td>
                    <td><span style={{ color: 'var(--red)', fontWeight: 600 }}>🔴 Lease Expiry</span></td>
                    <td style={{ color: 'var(--red)', fontWeight: 700 }}>{l.expirationDisplay}</td>
                  </tr>
                ))
              }
              {/* Outside Delivery Date for BP Aero */}
              <tr style={{ cursor: 'pointer' }} onClick={() => navigate('/properties/block-irving')}>
                <td><strong style={{ color: 'var(--navy)' }}>3615 Block Drive</strong><span className="addr-sub">Irving, TX</span></td>
                <td>BP Aero Services, LLC</td>
                <td><span style={{ color: 'var(--blue)', fontWeight: 600 }}>🔵 Outside Delivery Date</span></td>
                <td style={{ color: 'var(--blue)', fontWeight: 700 }}>May 1, 2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
