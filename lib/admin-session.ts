import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminSessionToken, verifyAdminSessionToken } from "./admin-session-crypto";

export const ADMIN_SESSION_COOKIE = "rs_admin_session";

export { createAdminSessionToken, verifyAdminSessionToken };

export function getAdminCookieSetOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/admin",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function isAdminSessionValid(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) return false;
  const value = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(secret, value);
}

export async function requireAdminSessionCookie(): Promise<void> {
  if (!(await isAdminSessionValid())) {
    redirect("/admin");
  }
}
