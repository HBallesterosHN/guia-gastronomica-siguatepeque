"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseRestaurantClaimForm } from "@/lib/validations/restaurant-claim";

export type ClaimActionState =
  | { ok: true }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

function flattenZodFieldErrors(issues: { path: (string | number)[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) out[key] = issue.message;
  }
  return out;
}

export async function submitRestaurantClaim(
  slug: string,
  _prev: ClaimActionState,
  formData: FormData,
): Promise<ClaimActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/restaurantes/${slug}/reclamar`)}`);
  }

  const honeypot = String(formData.get("companyWebsite") ?? "").trim();
  if (honeypot.length > 0) {
    return { ok: true };
  }

  const parsed = parseRestaurantClaimForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los campos.",
      fieldErrors: flattenZodFieldErrors(parsed.error.issues),
    };
  }

  const trimmedSlug = slug.trim();
  const pending = await prisma.restaurantClaim.findFirst({
    where: {
      restaurantSlug: trimmedSlug,
      userId: session.user.id,
      status: "pending",
    },
  });
  if (pending) {
    return { ok: false, message: "Ya tienes una solicitud pendiente para este restaurante." };
  }

  let restaurantId: string | null = null;
  const existing = await prisma.restaurant.findUnique({
    where: { slug: trimmedSlug },
    select: { id: true },
  });
  if (existing) restaurantId = existing.id;

  await prisma.restaurantClaim.create({
    data: {
      restaurantSlug: trimmedSlug,
      restaurantId,
      userId: session.user.id,
      ownerName: parsed.data.ownerName,
      ownerPhone: parsed.data.ownerPhone,
      ownerEmail: parsed.data.ownerEmail ?? null,
      message: parsed.data.message,
      evidenceUrl: parsed.data.evidenceUrl ?? null,
      status: "pending",
    },
  });

  revalidatePath(`/admin/reclamos`);
  revalidatePath(`/restaurantes/${trimmedSlug}/reclamar`);
  return { ok: true };
}
