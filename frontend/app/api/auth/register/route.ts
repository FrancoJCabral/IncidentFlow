import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/auth/server";
import { setSessionCookie } from "@/lib/auth/session-cookie";
import type { AuthenticatedUser } from "@/types/auth";

interface BackendAuthResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthenticatedUser;
}

export async function POST(request: Request) {
  let credentials: { email?: unknown; password?: unknown };
  try { credentials = await request.json(); }
  catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); }

  if (typeof credentials.email !== "string" || typeof credentials.password !== "string") {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  try {
    const backendResponse = await fetch(`${getBackendUrl()}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
      cache: "no-store",
    });

    if (backendResponse.status === 409) {
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
    }
    if (backendResponse.status === 400) {
      return NextResponse.json({ message: "Check the information entered and try again." }, { status: 400 });
    }
    if (!backendResponse.ok) throw new Error("Backend registration failed.");

    const auth = await backendResponse.json() as BackendAuthResponse;
    const response = NextResponse.json({ user: auth.user }, { status: 201 });
    setSessionCookie(response, auth.accessToken, auth.expiresAt);
    return response;
  } catch {
    return NextResponse.json({ message: "Unable to create your account. Please try again." }, { status: 502 });
  }
}
