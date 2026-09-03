import { Icon } from "@/components/layout/Icon";
import type { Incident } from "@/types/incident";
import { formatIncidentDate, incidentReference } from "@/lib/incidents/presentation";
import { PriorityBadge, StatusBadge } from "./Badge";

export function IncidentDetails({ incident }: { incident: Incident | null }) {
  if (!incident) return <aside className="panel incident-details details-empty"><h3>No incident selected</h3><p>Select an incident to view its details.</p></aside>;

  return <aside className="panel incident-details">
    <div className="details-top"><span>Incident details</span><button className="icon-button" type="button" aria-label="More incident options" disabled><Icon name="dots"/></button></div>
    <div className="details-heading"><span className="incident-id" title={incident.id}>{incidentReference(incident.id)}</span><h3>{incident.title}</h3><div className="details-badges"><StatusBadge value={incident.status}/><PriorityBadge value={incident.priority}/></div></div>
    <div className="details-section"><h4>Description</h4><p>{incident.description}</p></div>
    <dl className="details-grid"><div><dt>Category</dt><dd>{incident.category}</dd></div><div><dt>Priority</dt><dd><PriorityBadge value={incident.priority}/></dd></div><div><dt>Status</dt><dd><StatusBadge value={incident.status}/></dd></div><div><dt>Created at</dt><dd>{formatIncidentDate(incident.createdAt)}</dd></div><div><dt>Updated at</dt><dd>{formatIncidentDate(incident.updatedAt)}</dd></div>{incident.resolvedAt && <div><dt>Resolved at</dt><dd>{formatIncidentDate(incident.resolvedAt)}</dd></div>}</dl>
    <div className="detail-actions"><button className="primary-action" type="button" disabled>Start Progress</button><button className="secondary-action" type="button" disabled>Resolve</button><button className="icon-button bordered" type="button" aria-label="More actions" disabled><Icon name="dots"/></button></div>
  </aside>;
}
