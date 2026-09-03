import { Icon } from "@/components/layout/Icon";
import type { IncidentCategory, IncidentPriority, IncidentStatus } from "@/types/incident";

export interface DashboardFilters {
  search: string;
  status: "All" | IncidentStatus;
  priority: "All" | IncidentPriority;
  category: "All" | IncidentCategory;
}

interface Props {
  filters: DashboardFilters;
  hasFilters: boolean;
  onChange: (filters: DashboardFilters) => void;
  onClear: () => void;
}

export const emptyDashboardFilters: DashboardFilters = { search: "", status: "All", priority: "All", category: "All" };

export function DashboardToolbar({ filters, hasFilters, onChange, onClear }: Props) {
  return <section className="dashboard-toolbar" aria-label="Incident filters">
    <label className="toolbar-search"><span className="sr-only">Search incidents</span><Icon name="search" size={17}/><input type="search" placeholder="Search incidents..." value={filters.search} onChange={(event) => onChange({ ...filters, search: event.target.value })}/></label>
    <label className="toolbar-select"><span>Status</span><select value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value as DashboardFilters["status"] })}><option value="All">All statuses</option><option value="Open">Open</option><option value="InProgress">In progress</option><option value="Resolved">Resolved</option><option value="Closed">Closed</option></select></label>
    <label className="toolbar-select"><span>Priority</span><select value={filters.priority} onChange={(event) => onChange({ ...filters, priority: event.target.value as DashboardFilters["priority"] })}><option value="All">All priorities</option><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option></select></label>
    <label className="toolbar-select"><span>Category</span><select value={filters.category} onChange={(event) => onChange({ ...filters, category: event.target.value as DashboardFilters["category"] })}><option value="All">All categories</option><option value="Software">Software</option><option value="Hardware">Hardware</option><option value="Network">Network</option><option value="Access">Access</option><option value="Security">Security</option><option value="Other">Other</option></select></label>
    {hasFilters && <button className="clear-filters" type="button" onClick={onClear}>Clear filters</button>}
  </section>;
}
