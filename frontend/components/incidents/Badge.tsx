import type { IncidentPriority, IncidentStatus } from "@/types/incident";

export function PriorityBadge({ value }: { value: IncidentPriority }) {
  return <span className={`badge priority-${value.toLowerCase()}`}><span/>{value}</span>;
}

export function StatusBadge({ value }: { value: IncidentStatus }) {
  return <span className={`badge status-${value.toLowerCase()}`}><span/>{value === "InProgress" ? "In progress" : value}</span>;
}
