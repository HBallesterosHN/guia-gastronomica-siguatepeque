import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE } from "./admin-session-cookie";
import { createAdminSessionToken, verifyAdminSessionToken } from "./admin-session-crypto";

export { ADMIN_SESSION_COOKIE };
export { createAdminSessionToken, verifyAdminSessionToken };

/**
 * Prefer ADMIN_SECRET; fallback a AUTH_SECRET para evitar bloqueos de acceso.
 */
export function getAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET?.trim() || process.env.AUTH_SECRET?.trim();
}

export function getAdminCookieSetOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    // Must cover /api/* (e.g. Cloudinary signature) as well as /admin.
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

/** Clears both current and legacy cookie paths. */
export async function clearAdminSessionCookies(): Promise<void> {
  const jar = await cookies();
  jar.delete({ name: ADMIN_SESSION_COOKIE, path: "/" });
  jar.delete({ name: ADMIN_SESSION_COOKIE, path: "/admin" });
}

export async function setAdminSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  // Drop legacy path so only path=/ remains.
  jar.delete({ name: ADMIN_SESSION_COOKIE, path: "/admin" });
  jar.set(ADMIN_SESSION_COOKIE, token, getAdminCookieSetOptions());
}

export async function isAdminSessionValid(): Promise<boolean> {
  const secret = getAdminSecret();
  if (!secret) return false;
  const value = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(secret, value);
}

export async function requireAdminSessionCookie(): Promise<void> {
  if (!(await isAdminSessionValid())) {
    redirect("/admin");
  }
}
