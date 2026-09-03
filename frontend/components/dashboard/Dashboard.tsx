"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IncidentDetails } from "@/components/incidents/IncidentDetails";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { getIncidents, IncidentsUnauthorizedError } from "@/lib/api/incidents-client";
import type { DashboardStat, Incident } from "@/types/incident";
import { StatCard } from "./StatCard";

function isToday(value: string | null): boolean {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return !Number.isNaN(date.getTime()) && date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

function calculateStats(incidents: Incident[]): DashboardStat[] {
  return [
    { label: "Open Incidents", value: incidents.filter((item) => item.status === "Open").length, note: "Requires attention", icon: "inbox", tone: "teal" },
    { label: "In Progress", value: incidents.filter((item) => item.status === "InProgress").length, note: "Currently assigned", icon: "progress", tone: "blue" },
    { label: "Critical", value: incidents.filter((item) => item.priority === "Critical" && item.status !== "Closed").length, note: "Immediate priority", icon: "alert", tone: "red" },
    { label: "Resolved Today", value: incidents.filter((item) => (item.status === "Resolved" || item.status === "Closed") && isToday(item.resolvedAt)).length, note: "Based on your local time", icon: "check", tone: "green" },
  ];
}

export function Dashboard() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const loadIncidents = useCallback(async () => {
    setStatus("loading");
    try {
      const loaded = await getIncidents();
      setIncidents(loaded);
      setSelectedId((current) => loaded.some((item) => item.id === current) ? current : loaded[0]?.id);
      setStatus("success");
    } catch (error) {
      if (error instanceof IncidentsUnauthorizedError) {
        router.replace("/login");
        router.refresh();
        return;
      }
      setStatus("error");
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    getIncidents().then((loaded) => {
      if (!active) return;
      setIncidents(loaded);
      setSelectedId(loaded[0]?.id);
      setStatus("success");
    }).catch((error: unknown) => {
      if (!active) return;
      if (error instanceof IncidentsUnauthorizedError) {
        router.replace("/login");
        router.refresh();
        return;
      }
      setStatus("error");
    });
    return () => { active = false; };
  }, [router]);

  const stats = useMemo(() => calculateStats(incidents), [incidents]);
  const selectedIncident = incidents.find((item) => item.id === selectedId) ?? null;

  return <div className="dashboard-content">
    <section className="welcome-row" aria-labelledby="dashboard-overview"><div><p className="eyebrow">Overview</p><h2 id="dashboard-overview">Incident operations at a glance</h2><p>Monitor priorities, track progress, and keep your team aligned.</p></div><button className="primary-action" type="button"><span aria-hidden="true">＋</span> New incident</button></section>
    {status === "loading" ? <DashboardSkeleton/> : <>
      <section className="stats-grid" aria-label="Incident statistics">{stats.map((stat) => <StatCard key={stat.label} stat={stat}/>)}</section>
      {status === "error" ? <section className="panel dashboard-state error-state"><div className="state-icon">!</div><h3>Unable to load incidents.</h3><p>Please check your connection and try again.</p><button className="secondary-action" type="button" onClick={() => void loadIncidents()}>Try again</button></section>
        : incidents.length === 0 ? <section className="panel dashboard-state"><div className="state-icon empty">✓</div><h3>No incidents yet</h3><p>Incidents created in your workspace will appear here.</p></section>
        : <section className="workspace-grid"><IncidentTable incidents={incidents} selectedId={selectedId} onSelect={setSelectedId}/><IncidentDetails incident={selectedIncident}/></section>}
    </>}
  </div>;
}

function DashboardSkeleton() {
  return <div aria-label="Loading incidents" aria-busy="true"><section className="stats-grid">{Array.from({ length: 4 }, (_, index) => <div className="stat-card dashboard-skeleton" key={index}><span/><div><i/><b/><small/></div></div>)}</section><section className="workspace-grid"><div className="panel table-skeleton">{Array.from({ length: 6 }, (_, index) => <span key={index}/>)}</div><div className="panel detail-skeleton"><span/><span/><span/><span/></div></section></div>;
}
