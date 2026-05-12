import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminSessionValid } from "@/lib/admin-session";

function parseAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email: string | null | undefined): boolean {
  const list = parseAdminEmails();
  if (!email || list.length === 0) return false;
  return list.includes(email.trim().toLowerCase());
}

export async function isPlatformAdmin(): Promise<boolean> {
  const session = await auth();
  if (session?.user?.role === "admin") return true;
  if (isAdminEmail(session?.user?.email)) return true;
  return isAdminSessionValid();
}

export async function requirePlatformAdmin(): Promise<void> {
  if (!(await isPlatformAdmin())) {
    redirect("/admin");
  }
}
