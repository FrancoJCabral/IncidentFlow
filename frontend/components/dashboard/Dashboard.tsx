"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IncidentDetails } from "@/components/incidents/IncidentDetails";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { getIncidents, IncidentsUnauthorizedError } from "@/lib/api/incidents-client";
import { incidentReference } from "@/lib/incidents/presentation";
import type { DashboardStat, Incident } from "@/types/incident";
import { DashboardToolbar, emptyDashboardFilters, type DashboardFilters } from "./DashboardToolbar";
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

function filterIncidents(incidents: Incident[], filters: DashboardFilters): Incident[] {
  const search = filters.search.trim().toLocaleLowerCase();
  return incidents.filter((incident) => {
    const matchesSearch = !search || [incident.title, incident.description, incidentReference(incident.id)]
      .some((value) => value.toLocaleLowerCase().includes(search));
    return matchesSearch &&
      (filters.status === "All" || incident.status === filters.status) &&
      (filters.priority === "All" || incident.priority === filters.priority) &&
      (filters.category === "All" || incident.category === filters.category);
  });
}

export function Dashboard() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [filters, setFilters] = useState<DashboardFilters>(emptyDashboardFilters);

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
  const visibleIncidents = useMemo(() => filterIncidents(incidents, filters), [incidents, filters]);
  const selectedIncident = visibleIncidents.find((item) => item.id === selectedId) ?? null;
  const hasFilters = Boolean(filters.search.trim()) || filters.status !== "All" || filters.priority !== "All" || filters.category !== "All";

  function applyFilters(next: DashboardFilters) {
    const nextVisible = filterIncidents(incidents, next);
    setFilters(next);
    setSelectedId((current) => nextVisible.some((incident) => incident.id === current) ? current : nextVisible[0]?.id);
  }

  function handleIncidentChanged(updated: Incident) {
    setIncidents((current) => {
      const next = current.map((incident) => incident.id === updated.id ? updated : incident);
      const nextVisible = filterIncidents(next, filters);
      setSelectedId((selected) => nextVisible.some((incident) => incident.id === selected) ? selected : nextVisible[0]?.id);
      return next;
    });
  }

  function handleIncidentArchived(id: string) {
    setIncidents((current) => {
      const remaining = current.filter((incident) => incident.id !== id);
      const nextVisible = filterIncidents(remaining, filters);
      setSelectedId((selected) => nextVisible.some((incident) => incident.id === selected) ? selected : nextVisible[0]?.id);
      return remaining;
    });
  }

  return <div className="dashboard-content">
    <section className="welcome-row" aria-labelledby="dashboard-overview"><div><p className="eyebrow">Overview</p><h2 id="dashboard-overview">Incident operations at a glance</h2><p>Monitor priorities, track progress, and keep your team aligned.</p></div><Link className="primary-action" href="/incidents/new"><span aria-hidden="true">＋</span> New incident</Link></section>
    {status === "loading" ? <DashboardSkeleton/> : <>
      <section className="stats-grid" aria-label="Incident statistics">{stats.map((stat) => <StatCard key={stat.label} stat={stat}/>)}</section>
      {status === "error" ? <section className="panel dashboard-state error-state"><div className="state-icon">!</div><h3>Unable to load incidents.</h3><p>Please check your connection and try again.</p><button className="secondary-action" type="button" onClick={() => void loadIncidents()}>Try again</button></section>
        : incidents.length === 0 ? <section className="panel dashboard-state"><div className="state-icon empty">✓</div><h3>No incidents yet</h3><p>Create your first incident to start tracking issues.</p><Link className="primary-action" href="/incidents/new">New incident</Link></section>
        : <><DashboardToolbar filters={filters} hasFilters={hasFilters} onChange={applyFilters} onClear={() => applyFilters(emptyDashboardFilters)}/><p className="incident-result-count" aria-live="polite">{hasFilters ? `${visibleIncidents.length} of ${incidents.length} ${incidents.length === 1 ? "incident" : "incidents"}` : `${incidents.length} ${incidents.length === 1 ? "incident" : "incidents"}`}</p><section className="workspace-grid">{visibleIncidents.length === 0 ? <section className="panel dashboard-state filter-empty-state"><div className="state-icon empty">⌕</div><h3>No incidents match your filters</h3><p>Try changing your search or filters.</p><button className="secondary-action" type="button" onClick={() => applyFilters(emptyDashboardFilters)}>Clear filters</button></section> : <IncidentTable incidents={visibleIncidents} selectedId={selectedId} onSelect={setSelectedId}/>}<IncidentDetails incident={selectedIncident} onIncidentChanged={handleIncidentChanged} onIncidentArchived={handleIncidentArchived}/></section></>}
    </>}
  </div>;
}

function DashboardSkeleton() {
  return <div aria-label="Loading incidents" aria-busy="true"><section className="stats-grid">{Array.from({ length: 4 }, (_, index) => <div className="stat-card dashboard-skeleton" key={index}><span/><div><i/><b/><small/></div></div>)}</section><section className="workspace-grid"><div className="panel table-skeleton">{Array.from({ length: 6 }, (_, index) => <span key={index}/>)}</div><div className="panel detail-skeleton"><span/><span/><span/><span/></div></section></div>;
}
