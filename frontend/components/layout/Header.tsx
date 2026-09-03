"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut } from "@/lib/api/auth-client";
import type { AuthenticatedUser } from "@/types/auth";
import { Icon } from "./Icon";

function initialsFromEmail(email: string): string {
  const characters = email.split("@")[0].replace(/[^a-z0-9]/gi, "");
  return characters.slice(0, 2).toUpperCase() || "IF";
}

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<AuthenticatedUser>();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => router.replace("/login"));
  }, [router]);

  async function handleSignOut() {
    setSigningOut(true);
    try { await signOut(); }
    finally { router.replace("/login"); router.refresh(); }
  }

  return <header className="topbar">
    <div className="mobile-brand"><div className="brand-mark"><span/><span/><span/></div><span>IncidentFlow</span></div>
    <div className="page-heading"><p>Workspace</p><h1>Dashboard</h1></div>
    <div className="header-actions">
      <label className="search-box"><Icon name="search" size={18}/><span className="sr-only">Search incidents</span><input type="search" placeholder="Search incidents..."/><kbd>⌘ K</kbd></label>
      <button className="icon-button notification-button" type="button" aria-label="Notifications"><Icon name="bell" size={20}/><span className="notification-dot"/></button>
      {user ? <div className="user-profile"><div className="avatar">{initialsFromEmail(user.email)}</div><div className="user-copy"><strong title={user.email}>{user.email}</strong><span>{user.role}</span></div><button className="sign-out-button" type="button" onClick={handleSignOut} disabled={signingOut}>{signingOut ? "Signing out..." : "Sign out"}</button></div>
        : <div className="user-profile auth-loading" aria-label="Loading user"><div className="avatar-skeleton"/><div className="user-copy-skeleton"><span/><span/></div></div>}
    </div>
  </header>;
}
