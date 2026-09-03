import type { CreateIncidentInput, Incident } from "@/types/incident";

export class IncidentsUnauthorizedError extends Error {}

export class IncidentValidationError extends Error {}

export async function getIncidents(): Promise<Incident[]> {
  const response = await fetch("/api/incidents", { cache: "no-store" });
  if (response.status === 401) throw new IncidentsUnauthorizedError("Unauthorized");
  if (!response.ok) throw new Error("Unable to load incidents.");
  return await response.json() as Incident[];
}

export async function createIncident(input: CreateIncidentInput): Promise<Incident> {
  const response = await fetch("/api/incidents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (response.status === 401) throw new IncidentsUnauthorizedError("Unauthorized");
  if (response.status === 400) {
    const body = await response.json().catch(() => null) as { message?: string } | null;
    throw new IncidentValidationError(body?.message || "Check the incident information and try again.");
  }
  if (!response.ok) throw new Error("Unable to create incident. Please try again.");
  return await response.json() as Incident;
}
