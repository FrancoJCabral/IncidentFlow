"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";

const navigation: { label: string; icon: IconName; href: string }[] = [
  { label: "Dashboard", icon: "dashboard", href: "/" }, { label: "Incidents", icon: "incidents", href: "/" },
  { label: "New Incident", icon: "new", href: "/incidents/new" },
];

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark" aria-hidden="true"><span/><span/><span/></div><span>IncidentFlow</span></div>
    <nav className="sidebar-nav" aria-label="Primary navigation"><p className="nav-label">Workspace</p>{navigation.map((item) => {
      const active = item.href === "/incidents/new" ? pathname === item.href : pathname === "/" && item.label === "Dashboard";
      return <Link className={`nav-item${active ? " active" : ""}`} href={item.href} key={item.label} aria-current={active ? "page" : undefined}><Icon name={item.icon}/><span>{item.label}</span></Link>;
    })}</nav>
  </aside>;
}
