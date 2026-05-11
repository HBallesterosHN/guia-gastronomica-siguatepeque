"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminCookieSetOptions,
  getAdminSecret,
} from "@/lib/admin-session";

function safeEqualString(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function loginAdminSecret(formData: FormData): Promise<void> {
  const envSecret = getAdminSecret();
  const submitted = formData.get("secret");
  const submittedStr = typeof submitted === "string" ? submitted : "";

  if (!envSecret || !safeEqualString(submittedStr, envSecret)) {
    redirect("/admin?error=1");
  }

  const token = createAdminSessionToken(envSecret);
  (await cookies()).set(ADMIN_SESSION_COOKIE, token, getAdminCookieSetOptions());
  redirect("/admin/reclamos");
}

export async function logoutAdminSecret(): Promise<void> {
  (await cookies()).delete({ name: ADMIN_SESSION_COOKIE, path: "/admin" });
  redirect("/admin");
}
