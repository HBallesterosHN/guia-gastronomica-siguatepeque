import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminSessionValid } from "@/lib/admin-session";

export async function isPlatformAdmin(): Promise<boolean> {
  const session = await auth();
  if (session?.user?.role === "admin") return true;
  return isAdminSessionValid();
}

export async function requirePlatformAdmin(): Promise<void> {
  if (!(await isPlatformAdmin())) {
    redirect("/admin");
  }
}
