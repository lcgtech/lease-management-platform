import { STATUS_COLORS, STATUS_LABELS } from '../data/leases';

export default function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.expired;
  return (
    <span
      className="badge"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
