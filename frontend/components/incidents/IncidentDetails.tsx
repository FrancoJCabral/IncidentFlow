"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/layout/Icon";
import { changeIncidentStatus, IncidentNotFoundError, IncidentsUnauthorizedError } from "@/lib/api/incidents-client";
import { formatIncidentDate, incidentReference } from "@/lib/incidents/presentation";
import type { Incident, IncidentStatus } from "@/types/incident";
import { PriorityBadge, StatusBadge } from "./Badge";

export function IncidentDetails({ incident, onIncidentChanged }: { incident: Incident | null; onIncidentChanged: (incident: Incident) => void }) {
  const router = useRouter();
  const [changingTo, setChangingTo] = useState<IncidentStatus>();
  const [statusError, setStatusError] = useState<string>();

  async function changeStatus(status: IncidentStatus) {
    if (!incident || changingTo) return;
    setChangingTo(status);
    setStatusError(undefined);
    try {
      onIncidentChanged(await changeIncidentStatus(incident.id, status));
    } catch (error) {
      if (error instanceof IncidentsUnauthorizedError) { router.replace("/login"); router.refresh(); return; }
      setStatusError(error instanceof IncidentNotFoundError ? "This incident no longer exists." : error instanceof Error ? error.message : "Unable to update incident status. Please try again.");
    } finally {
      setChangingTo(undefined);
    }
  }

  if (!incident) return <aside className="panel incident-details details-empty"><h3>No incident selected</h3><p>Select an incident to view its details.</p></aside>;

  return <aside className="panel incident-details">
    <div className="details-top"><span>Incident details</span><button className="icon-button" type="button" aria-label="More incident options" disabled><Icon name="dots"/></button></div>
    <div className="details-heading"><span className="incident-id" title={incident.id}>{incidentReference(incident.id)}</span><h3>{incident.title}</h3><div className="details-badges"><StatusBadge value={incident.status}/><PriorityBadge value={incident.priority}/></div></div>
    <div className="details-section"><h4>Description</h4><p>{incident.description}</p></div>
    <dl className="details-grid"><div><dt>Category</dt><dd>{incident.category}</dd></div><div><dt>Priority</dt><dd><PriorityBadge value={incident.priority}/></dd></div><div><dt>Status</dt><dd><StatusBadge value={incident.status}/></dd></div><div><dt>Created at</dt><dd>{formatIncidentDate(incident.createdAt)}</dd></div><div><dt>Updated at</dt><dd>{formatIncidentDate(incident.updatedAt)}</dd></div>{incident.resolvedAt && <div><dt>Resolved at</dt><dd>{formatIncidentDate(incident.resolvedAt)}</dd></div>}</dl>
    {statusError && <p className="status-change-error" role="alert">{statusError}</p>}
    <div className="detail-actions">
      {incident.status === "Open" && <button className="primary-action" type="button" disabled={Boolean(changingTo)} onClick={() => void changeStatus("InProgress")}>{changingTo ? "Starting..." : "Start progress"}</button>}
      {incident.status === "InProgress" && <button className="primary-action" type="button" disabled={Boolean(changingTo)} onClick={() => void changeStatus("Resolved")}>{changingTo ? "Resolving..." : "Resolve"}</button>}
      {incident.status === "Resolved" && <><button className="primary-action" type="button" disabled={Boolean(changingTo)} onClick={() => void changeStatus("Closed")}>{changingTo === "Closed" ? "Closing..." : "Close incident"}</button><button className="secondary-action" type="button" disabled={Boolean(changingTo)} onClick={() => void changeStatus("InProgress")}>{changingTo === "InProgress" ? "Reopening..." : "Reopen"}</button></>}
      {incident.status === "Closed" && <p className="terminal-status">Closed is the final status.</p>}
      <Link className="secondary-action edit-incident-action" href={`/incidents/${incident.id}/edit`} aria-disabled={Boolean(changingTo)}>Edit incident</Link>
    </div>
  </aside>;
}
