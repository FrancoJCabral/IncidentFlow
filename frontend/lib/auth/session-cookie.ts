import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./constants";

export function setSessionCookie(response: NextResponse, accessToken: string, expiresAt: string) {
  const expires = new Date(expiresAt);
  if (!accessToken || Number.isNaN(expires.getTime())) throw new Error("Invalid authentication response.");
  const secure = process.env.INCIDENTFLOW_COOKIE_SECURE === undefined
    ? process.env.NODE_ENV === "production"
    : process.env.INCIDENTFLOW_COOKIE_SECURE === "true";

  response.cookies.set(AUTH_COOKIE_NAME, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires,
  });
}
