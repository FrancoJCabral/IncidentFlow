import { Icon } from "@/components/layout/Icon";
import type { Incident } from "@/types/incident";
import { PriorityBadge, StatusBadge } from "./Badge";

export function IncidentDetails({ incident }: { incident: Incident }) {
  return <aside className="panel incident-details">
    <div className="details-top"><span>Incident details</span><button className="icon-button" type="button" aria-label="More incident options"><Icon name="dots"/></button></div>
    <div className="details-heading"><span className="incident-id">{incident.id}</span><h3>{incident.title}</h3><div className="details-badges"><StatusBadge value={incident.status}/><PriorityBadge value={incident.priority}/></div></div>
    <div className="details-section"><h4>Description</h4><p>{incident.description}</p></div>
    <dl className="details-grid"><div><dt>Category</dt><dd>{incident.category}</dd></div><div><dt>Priority</dt><dd><PriorityBadge value={incident.priority}/></dd></div><div><dt>Status</dt><dd><StatusBadge value={incident.status}/></dd></div><div><dt>Created at</dt><dd>{incident.createdAt}</dd></div><div><dt>Updated at</dt><dd>{incident.updatedAt}</dd></div></dl>
    <div className="detail-actions"><button className="primary-action" type="button">Start Progress</button><button className="secondary-action" type="button">Resolve</button><button className="icon-button bordered" type="button" aria-label="More actions"><Icon name="dots"/></button></div>
  </aside>;
}
