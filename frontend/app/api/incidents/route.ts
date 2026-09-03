import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { getBackendUrl } from "@/lib/auth/server";
import type { Incident } from "@/types/incident";

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
