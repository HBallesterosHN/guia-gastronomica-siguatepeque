"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { userOwnsRestaurantSlug } from "@/lib/assert-ownership";
import {
  parseImageUrlsHiddenField,
  parseOwnerChangeRequestForm,
} from "@/lib/validations/restaurant-change-request";

export type ChangeRequestActionState =
  | { ok: true }
  | { ok: false; message?: string };

export async function submitOwnerChangeRequest(
  slug: string,
  _prev: ChangeRequestActionState,
  formData: FormData,
): Promise<ChangeRequestActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/dashboard/restaurants/${slug}/solicitar`)}`);
  }

  const own = await userOwnsRestaurantSlug(session.user.id, slug.trim());
  if (!own) {
    return { ok: false, message: "No tienes permiso para este restaurante." };
  }

  const parsed = parseOwnerChangeRequestForm(formData);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const d = parsed.data;
  const changes: Record<string, unknown> = {};
  if (d.phone) changes.phone = d.phone;
  if (d.whatsapp) changes.whatsapp = d.whatsapp;
  if (d.scheduleLabel) changes.scheduleLabel = d.scheduleLabel;
  if (d.menuUrl) changes.menuUrl = d.menuUrl;
  if (d.instagramUrl) changes.instagramUrl = d.instagramUrl;
  if (d.summary) changes.summary = d.summary;
  if (d.heroUrl) changes.heroUrl = d.heroUrl;

  const imageUrls = parseImageUrlsHiddenField(typeof formData.get("imageUrlsJson") === "string" ? (formData.get("imageUrlsJson") as string) : "");

  if (Object.keys(changes).length === 0 && imageUrls.length === 0) {
    return { ok: false, message: "Indica al menos un cambio o sube una imagen." };
  }

  await prisma.restaurantChangeRequest.create({
    data: {
      restaurantId: own.restaurantId,
      userId: session.user.id,
      changes: changes as Prisma.InputJsonValue,
      imageUrls: imageUrls.length > 0 ? (imageUrls as Prisma.InputJsonValue) : undefined,
      status: "pending",
    },
  });

  revalidatePath("/admin/cambios");
  revalidatePath(`/dashboard/restaurants/${slug}/solicitar`);
  return { ok: true };
}
