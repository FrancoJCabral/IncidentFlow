import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { getBackendUrl } from "@/lib/auth/server";
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
    const backendResponse = await fetch(`${getBackendUrl()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
      cache: "no-store",
    });

    if (backendResponse.status === 401) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }
    if (backendResponse.status === 400) {
      return NextResponse.json({ message: "Check the information entered and try again." }, { status: 400 });
    }
    if (!backendResponse.ok) throw new Error("Backend authentication failed.");

    const auth = await backendResponse.json() as BackendAuthResponse;
    const expires = new Date(auth.expiresAt);
    if (!auth.accessToken || Number.isNaN(expires.getTime())) throw new Error("Invalid authentication response.");

    const response = NextResponse.json({ user: auth.user });
    response.cookies.set(AUTH_COOKIE_NAME, auth.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires,
    });
    return response;
  } catch {
    return NextResponse.json({ message: "Unable to sign in. Please try again." }, { status: 502 });
  }
}
