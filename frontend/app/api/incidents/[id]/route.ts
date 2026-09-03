import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { getBackendUrl } from "@/lib/auth/server";
import type { Incident, IncidentCategory, IncidentPriority, UpdateIncidentInput } from "@/types/incident";

const priorities: IncidentPriority[] = ["Low", "Medium", "High", "Critical"];
const categories: IncidentCategory[] = ["Software", "Hardware", "Network", "Access", "Security", "Other"];
type RouteContext = { params: Promise<{ id: string }> };

async function session() {
  const cookieStore = await cookies();
  return { cookieStore, token: cookieStore.get(AUTH_COOKIE_NAME)?.value };
}

export async function GET(_request: Request, context: RouteContext) {
  const { cookieStore, token } = await session();
  if (!token) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  try {
    const backendResponse = await fetch(`${getBackendUrl()}/api/incidents/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
    });
    if (backendResponse.status === 401) {
      cookieStore.delete(AUTH_COOKIE_NAME);
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    if (backendResponse.status === 404) return NextResponse.json({ message: "Incident not found." }, { status: 404 });
    if (!backendResponse.ok) throw new Error("Backend incident request failed.");
    return NextResponse.json(await backendResponse.json() as Incident);
  } catch {
    return NextResponse.json({ message: "Unable to load incident." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { cookieStore, token } = await session();
  if (!token) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  let body: Partial<UpdateIncidentInput>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); }
  if (typeof body.title !== "string" || typeof body.description !== "string" ||
      !priorities.includes(body.priority as IncidentPriority) || !categories.includes(body.category as IncidentCategory)) {
    return NextResponse.json({ message: "Check the incident information and try again." }, { status: 400 });
  }
  const payload: UpdateIncidentInput = {
    title: body.title.trim(), description: body.description.trim(),
    priority: body.priority as IncidentPriority, category: body.category as IncidentCategory,
  };
  try {
    const backendResponse = await fetch(`${getBackendUrl()}/api/incidents/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload), cache: "no-store",
    });
    if (backendResponse.status === 401) {
      cookieStore.delete(AUTH_COOKIE_NAME);
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    if (backendResponse.status === 404) return NextResponse.json({ message: "Incident not found." }, { status: 404 });
    if (backendResponse.status === 400) return NextResponse.json({ message: "Check the incident information and try again." }, { status: 400 });
    if (!backendResponse.ok) throw new Error("Backend incident update failed.");
    return NextResponse.json(await backendResponse.json() as Incident);
  } catch {
    return NextResponse.json({ message: "Unable to update incident. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { cookieStore, token } = await session();
  if (!token) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  try {
    const backendResponse = await fetch(`${getBackendUrl()}/api/incidents/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (backendResponse.status === 401) {
      cookieStore.delete(AUTH_COOKIE_NAME);
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    if (backendResponse.status === 404) return NextResponse.json({ message: "This incident is no longer available." }, { status: 404 });
    if (backendResponse.status === 400) return NextResponse.json({ message: "Only closed incidents can be archived." }, { status: 400 });
    if (backendResponse.status !== 204) throw new Error("Backend incident archive failed.");
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ message: "Unable to archive incident. Please try again." }, { status: 500 });
  }
}
