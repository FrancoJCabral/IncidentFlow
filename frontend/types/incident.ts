export type IncidentPriority = "Low" | "Medium" | "High" | "Critical";
export type IncidentStatus = "Open" | "InProgress" | "Resolved" | "Closed";
export type IncidentCategory = "Software" | "Hardware" | "Network" | "Access" | "Security" | "Other";

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  priority: IncidentPriority;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string | null;
  resolvedAt: string | null;
}

export interface CreateIncidentInput {
  title: string;
  description: string;
  priority: IncidentPriority;
  category: IncidentCategory;
}

export type StatTone = "teal" | "blue" | "red" | "green";

export interface DashboardStat {
  label: string;
  value: number;
  note: string;
  icon: "inbox" | "progress" | "alert" | "check";
  tone: StatTone;
}
