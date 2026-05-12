"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { userOwnsRestaurantSlug } from "@/lib/assert-ownership";
import { normalizeHondurasPhone } from "@/lib/formatters/phone";
import { parseScheduleManualInput } from "@/lib/formatters/schedule";
import {
  ownerChangeRequestFormSchema,
  parseImageAssetsFromHiddenJson,
} from "@/lib/validations/restaurant-change-request";

export type ChangeRequestActionState =
  | { ok: true }
  | { ok: false; message?: string };

function normalizeOptionalPhone(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  const n = normalizeHondurasPhone(raw);
  return n ?? raw.trim();
}

export async function submitOwnerInfoChangeRequest(
  slug: string,
  _prev: ChangeRequestActionState,
  formData: FormData,
): Promise<ChangeRequestActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/dashboard/restaurantes/${slug}`)}`);
  }

  const own = await userOwnsRestaurantSlug(session.user.id, slug.trim());
  if (!own) {
    return { ok: false, message: "No tienes permiso para este restaurante." };
  }

  const parsed = ownerChangeRequestFormSchema.safeParse({
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    scheduleLabel: formData.get("scheduleLabel"),
    menuUrl: formData.get("menuUrl"),
    instagramUrl: formData.get("instagramUrl"),
    summary: formData.get("summary"),
    ownerMessage: formData.get("ownerMessage"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const d = parsed.data;
  const changes: Record<string, unknown> = {};

  const phone = normalizeOptionalPhone(d.phone);
  const whatsapp = normalizeOptionalPhone(d.whatsapp);
  if (phone) changes.phone = phone;
  if (whatsapp) changes.whatsapp = whatsapp;
  if (d.menuUrl) changes.menuUrl = d.menuUrl;
  if (d.instagramUrl) changes.instagramUrl = d.instagramUrl;
  if (d.summary) changes.summary = d.summary;

  if (d.scheduleLabel?.trim()) {
    const sched = parseScheduleManualInput(d.scheduleLabel.trim());
    changes.scheduleLabel = sched.scheduleLabel;
    if (sched.structured?.length) {
      changes.scheduleStructured = sched.structured;
    }
  }

  if (d.ownerMessage?.trim()) {
    changes.ownerMessage = d.ownerMessage.trim();
  }

  if (Object.keys(changes).length === 0) {
    return {
      ok: false,
      message: "Indica al menos un cambio o usa “Gestionar fotos” para imágenes.",
    };
  }

  await prisma.restaurantChangeRequest.create({
    data: {
      restaurantId: own.restaurantId,
      userId: session.user.id,
      changes: changes as Prisma.InputJsonValue,
      status: "pending",
    },
  });

  revalidatePath("/admin/cambios");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/restaurantes/${slug}`);
  return { ok: true };
}

export async function submitOwnerPhotosChangeRequest(
  slug: string,
  _prev: ChangeRequestActionState,
  formData: FormData,
): Promise<ChangeRequestActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/dashboard/restaurantes/${slug}/fotos`)}`);
  }

  const own = await userOwnsRestaurantSlug(session.user.id, slug.trim());
  if (!own) {
    return { ok: false, message: "No tienes permiso para este restaurante." };
  }

  const imageAssets = parseImageAssetsFromHiddenJson(
    typeof formData.get("imageUrlsJson") === "string" ? (formData.get("imageUrlsJson") as string) : "",
  );

  if (imageAssets.length === 0) {
    return { ok: false, message: "Sube al menos una imagen." };
  }

  await prisma.restaurantChangeRequest.create({
    data: {
      restaurantId: own.restaurantId,
      userId: session.user.id,
      changes: {} as Prisma.InputJsonValue,
      imageUrls: imageAssets as Prisma.InputJsonValue,
      status: "pending",
    },
  });

  revalidatePath("/admin/cambios");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/restaurantes/${slug}/fotos`);
  return { ok: true };
}
