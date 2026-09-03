import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export async function POST() {
  (await cookies()).delete(AUTH_COOKIE_NAME);
  return new NextResponse(null, { status: 204 });
}
