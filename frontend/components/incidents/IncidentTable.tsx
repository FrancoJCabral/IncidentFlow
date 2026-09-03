import { Icon } from "@/components/layout/Icon";
import type { Incident } from "@/types/incident";
import { PriorityBadge, StatusBadge } from "./Badge";

export function IncidentTable({ incidents, selectedId }: { incidents: Incident[]; selectedId: string }) {
  return <section className="panel incident-list">
    <div className="panel-header"><div><h3>Recent incidents</h3><p>Latest activity across your organization</p></div><button className="text-action" type="button">View all <span>→</span></button></div>
    <div className="table-scroll"><table><thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Updated</th></tr></thead><tbody>{incidents.map((incident) =>
      <tr key={incident.id} className={incident.id === selectedId ? "selected" : undefined}>
        <td><span className="incident-id">{incident.id}</span></td><td><strong className="incident-title">{incident.title}</strong></td><td>{incident.category}</td>
        <td><PriorityBadge value={incident.priority}/></td><td><StatusBadge value={incident.status}/></td><td><span className="updated"><Icon name="clock" size={14}/>{incident.updatedAt}</span></td>
      </tr>)}</tbody></table></div>
    <div className="mobile-incidents">{incidents.map((incident) =>
      <article key={incident.id} className={incident.id === selectedId ? "selected" : undefined}><div><span className="incident-id">{incident.id}</span><PriorityBadge value={incident.priority}/></div><strong>{incident.title}</strong><div><StatusBadge value={incident.status}/><span>{incident.updatedAt}</span></div></article>
    )}</div>
  </section>;
}
