import type { Incident } from "@/types/incident";

export class IncidentsUnauthorizedError extends Error {}

export async function getIncidents(): Promise<Incident[]> {
  const response = await fetch("/api/incidents", { cache: "no-store" });
  if (response.status === 401) throw new IncidentsUnauthorizedError("Unauthorized");
  if (!response.ok) throw new Error("Unable to load incidents.");
  return await response.json() as Incident[];
}
