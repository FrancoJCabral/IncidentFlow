import type { AuthenticatedUser, AuthResult } from "@/types/auth";

async function readMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json() as { message?: string };
    return body.message || fallback;
  } catch {
    return fallback;
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(await readMessage(response, "Unable to sign in. Please try again."));
  return await response.json() as AuthResult;
}

export async function register(email: string, password: string): Promise<AuthResult> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(await readMessage(response, "Unable to create your account. Please try again."));
  return await response.json() as AuthResult;
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  if (!response.ok) throw new Error("Unauthorized");
  return await response.json() as AuthenticatedUser;
}

export async function signOut(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) throw new Error("Unable to sign out.");
}
