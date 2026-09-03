import type { Incident } from "@/types/incident";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function incidentReference(id: string): string {
  return `INC-${id.split("-")[0].toUpperCase()}`;
}

export function formatIncidentDate(value: string | null): string {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : dateFormatter.format(date);
}

export function incidentUpdatedDate(incident: Incident): string {
  return formatIncidentDate(incident.updatedAt ?? incident.createdAt);
}
