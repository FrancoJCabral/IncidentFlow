import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./constants";
import type { AuthenticatedUser } from "@/types/auth";

export function getBackendUrl(): string {
  const url = process.env.INCIDENTFLOW_API_URL;
  if (!url) throw new Error("INCIDENTFLOW_API_URL is not configured.");
  return url.replace(/\/$/, "");
}

export async function getServerUser(): Promise<AuthenticatedUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${getBackendUrl()}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return await response.json() as AuthenticatedUser;
  } catch {
    return null;
  }
}
