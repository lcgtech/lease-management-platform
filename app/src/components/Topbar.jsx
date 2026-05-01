export default function Topbar({ title, sub, children }) {
  return (
    <div className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        {sub && <div className="topbar-sub">{sub}</div>}
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-pill">As of April 30, 2026</div>
      {children}
    </div>
  );
}
