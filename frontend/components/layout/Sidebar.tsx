import { Icon, type IconName } from "./Icon";

const navigation: { label: string; icon: IconName; active?: boolean }[] = [
  { label: "Dashboard", icon: "dashboard", active: true }, { label: "Incidents", icon: "incidents" },
  { label: "New Incident", icon: "new" },
];

export function Sidebar() {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark" aria-hidden="true"><span/><span/><span/></div><span>IncidentFlow</span></div>
    <nav className="sidebar-nav" aria-label="Primary navigation"><p className="nav-label">Workspace</p>{navigation.map((item) =>
      <a className={`nav-item${item.active ? " active" : ""}`} href="#" key={item.label} aria-current={item.active ? "page" : undefined}><Icon name={item.icon}/><span>{item.label}</span></a>
    )}</nav>
  </aside>;
}
