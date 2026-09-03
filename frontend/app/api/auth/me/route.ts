import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { getBackendUrl } from "@/lib/auth/server";
import type { AuthenticatedUser } from "@/types/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  try {
    const backendResponse = await fetch(`${getBackendUrl()}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
    });
    if (backendResponse.status === 401) {
      cookieStore.delete(AUTH_COOKIE_NAME);
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    if (!backendResponse.ok) throw new Error("Current user request failed.");
    return NextResponse.json(await backendResponse.json() as AuthenticatedUser);
  } catch {
    return NextResponse.json({ message: "Unable to verify the session." }, { status: 502 });
  }
}
