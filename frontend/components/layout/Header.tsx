import { Icon } from "./Icon";

export function Header() {
  return <header className="topbar">
    <div className="mobile-brand"><div className="brand-mark"><span/><span/><span/></div><span>IncidentFlow</span></div>
    <div className="page-heading"><p>Workspace</p><h1>Dashboard</h1></div>
    <div className="header-actions">
      <label className="search-box"><Icon name="search" size={18}/><span className="sr-only">Search incidents</span><input type="search" placeholder="Search incidents..."/><kbd>⌘ K</kbd></label>
      <button className="icon-button notification-button" type="button" aria-label="Notifications"><Icon name="bell" size={20}/><span className="notification-dot"/></button>
      <div className="user-profile"><div className="avatar">DU</div><div className="user-copy"><strong>Demo User</strong><span>Operator</span></div><Icon name="chevron" size={15}/></div>
    </div>
  </header>;
}
