import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { getBackendUrl } from "@/lib/auth/server";
import type { Incident, IncidentStatus } from "@/types/incident";

const statuses: IncidentStatus[] = ["Open", "InProgress", "Resolved", "Closed"];
type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  let body: { status?: unknown };
  try { body = await request.json(); }
  catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); }
  if (typeof body.status !== "string" || !statuses.includes(body.status as IncidentStatus)) {
    return NextResponse.json({ message: "Select a valid incident status." }, { status: 400 });
  }

  const { id } = await context.params;
  try {
    const backendResponse = await fetch(`${getBackendUrl()}/api/incidents/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status: body.status }),
      cache: "no-store",
    });
    if (backendResponse.status === 401) {
      cookieStore.delete(AUTH_COOKIE_NAME);
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    if (backendResponse.status === 404) return NextResponse.json({ message: "Incident not found." }, { status: 404 });
    if (backendResponse.status === 400) return NextResponse.json({ message: "This status change is not allowed." }, { status: 400 });
    if (!backendResponse.ok) throw new Error("Backend status update failed.");
    return NextResponse.json(await backendResponse.json() as Incident);
  } catch {
    return NextResponse.json({ message: "Unable to update incident status. Please try again." }, { status: 500 });
  }
}
