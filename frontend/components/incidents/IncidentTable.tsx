import { Icon } from "@/components/layout/Icon";
import type { Incident } from "@/types/incident";
import { incidentReference, incidentUpdatedDate } from "@/lib/incidents/presentation";
import { PriorityBadge, StatusBadge } from "./Badge";

export function IncidentTable({ incidents, selectedId, onSelect }: { incidents: Incident[]; selectedId?: string; onSelect: (id: string) => void }) {
  return <section className="panel incident-list">
    <div className="panel-header"><div><h3>Recent incidents</h3><p>Latest activity across your organization</p></div></div>
    <div className="table-scroll"><table><thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Updated</th></tr></thead><tbody>{incidents.map((incident) =>
      <tr key={incident.id} className={incident.id === selectedId ? "selected" : undefined} onClick={() => onSelect(incident.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(incident.id); } }} tabIndex={0} aria-selected={incident.id === selectedId}>
        <td><span className="incident-id" title={incident.id}>{incidentReference(incident.id)}</span></td><td><strong className="incident-title">{incident.title}</strong></td><td>{incident.category}</td>
        <td><PriorityBadge value={incident.priority}/></td><td><StatusBadge value={incident.status}/></td><td><span className="updated"><Icon name="clock" size={14}/>{incidentUpdatedDate(incident)}</span></td>
      </tr>)}</tbody></table></div>
    <div className="mobile-incidents">{incidents.map((incident) =>
      <article key={incident.id} className={incident.id === selectedId ? "selected" : undefined} onClick={() => onSelect(incident.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(incident.id); } }} tabIndex={0} aria-current={incident.id === selectedId ? "true" : undefined}><div><span className="incident-id" title={incident.id}>{incidentReference(incident.id)}</span><PriorityBadge value={incident.priority}/></div><strong>{incident.title}</strong><span className="mobile-category">{incident.category}</span><div><StatusBadge value={incident.status}/><span>{incidentUpdatedDate(incident)}</span></div></article>
    )}</div>
  </section>;
}
