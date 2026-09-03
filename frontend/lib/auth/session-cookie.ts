import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./constants";

export function setSessionCookie(response: NextResponse, accessToken: string, expiresAt: string) {
  const expires = new Date(expiresAt);
  if (!accessToken || Number.isNaN(expires.getTime())) throw new Error("Invalid authentication response.");

  response.cookies.set(AUTH_COOKIE_NAME, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}
