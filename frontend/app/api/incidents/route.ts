import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { getBackendUrl } from "@/lib/auth/server";
import type { CreateIncidentInput, Incident, IncidentCategory, IncidentPriority } from "@/types/incident";

const priorities: IncidentPriority[] = ["Low", "Medium", "High", "Critical"];
const categories: IncidentCategory[] = ["Software", "Hardware", "Network", "Access", "Security", "Other"];

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  try {
    const backendResponse = await fetch(`${getBackendUrl()}/api/incidents`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (backendResponse.status === 401) {
      cookieStore.delete(AUTH_COOKIE_NAME);
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    if (!backendResponse.ok) throw new Error("Backend incidents request failed.");
    return NextResponse.json(await backendResponse.json() as Incident[]);
  } catch {
    return NextResponse.json({ message: "Unable to load incidents." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  let body: Partial<CreateIncidentInput>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); }

  if (typeof body.title !== "string" || typeof body.description !== "string" ||
      !priorities.includes(body.priority as IncidentPriority) || !categories.includes(body.category as IncidentCategory)) {
    return NextResponse.json({ message: "Check the incident information and try again." }, { status: 400 });
  }

  const payload: CreateIncidentInput = {
    title: body.title.trim(),
    description: body.description.trim(),
    priority: body.priority as IncidentPriority,
    category: body.category as IncidentCategory,
  };

  try {
    const backendResponse = await fetch(`${getBackendUrl()}/api/incidents`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (backendResponse.status === 401) {
      cookieStore.delete(AUTH_COOKIE_NAME);
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    if (backendResponse.status === 400) {
      return NextResponse.json({ message: "Check the incident information and try again." }, { status: 400 });
    }
    if (backendResponse.status !== 201) throw new Error("Backend incident creation failed.");
    return NextResponse.json(await backendResponse.json() as Incident, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to create incident. Please try again." }, { status: 500 });
  }
}
