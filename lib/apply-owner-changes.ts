import "server-only";

import { Prisma } from "@prisma/client";
import type { ChangeRequestImageAsset, OwnerChangesJson } from "@/lib/change-request-types";
import { normalizeHondurasPhone } from "@/lib/formatters/phone";
import { isStructuredScheduleUsable } from "@/lib/formatters/schedule";
import { prisma } from "@/lib/prisma";

export { parseImageAssetsJson, parseOwnerChangesJson } from "@/lib/change-request-types";

function toGalleryArray(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value
      .map((u) => {
        if (typeof u === "string") return u.trim();
        if (u && typeof u === "object" && typeof (u as { url?: string }).url === "string") {
          return (u as { url: string }).url.trim();
        }
        return "";
      })
      .filter(Boolean);
  }
  return [];
}

function normalizeContactForDb(value: string | undefined): string | null {
  if (value === undefined) return null;
  const t = value.trim();
  if (!t) return null;
  const n = normalizeHondurasPhone(t);
  return n ?? t;
}

/**
 * Aplica cambios editoriales aprobados sobre `Restaurant`.
 */
export async function applyApprovedChangesToRestaurant(
  restaurantId: string,
  changes: OwnerChangesJson,
  images: ChangeRequestImageAsset[],
): Promise<void> {
  const current = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { gallery: true },
  });

  const data: Prisma.RestaurantUpdateInput = {};

  if (changes.phone !== undefined) {
    data.phone = normalizeContactForDb(changes.phone);
  }
  if (changes.whatsapp !== undefined) {
    data.whatsapp = normalizeContactForDb(changes.whatsapp);
  }
  if (changes.menuUrl !== undefined) data.menuUrl = changes.menuUrl?.trim() || null;
  if (changes.instagramUrl !== undefined) data.instagramUrl = changes.instagramUrl?.trim() || null;
  if (changes.summary !== undefined) data.summary = changes.summary?.trim() || null;

  if (changes.scheduleLabel !== undefined) {
    data.scheduleLabel = changes.scheduleLabel?.trim() || null;
    if (isStructuredScheduleUsable(changes.scheduleStructured)) {
      data.scheduleStructured = changes.scheduleStructured;
    } else {
      data.scheduleStructured = Prisma.JsonNull;
    }
  } else if (changes.scheduleStructured !== undefined) {
    if (isStructuredScheduleUsable(changes.scheduleStructured)) {
      data.scheduleStructured = changes.scheduleStructured;
    } else {
      data.scheduleStructured = Prisma.JsonNull;
    }
  }

  const heroFromImages = images.find((i) => i.type === "hero");
  if (heroFromImages?.url) {
    data.heroUrl = heroFromImages.url;
  } else if (changes.heroUrl !== undefined) {
    data.heroUrl = changes.heroUrl?.trim() || null;
  }

  const galleryUrlsFromImages = images
    .filter((i) => i.type === "gallery" && i.url)
    .map((i) => i.url);
  const existingGallery = toGalleryArray(current?.gallery);
  const fromChanges = changes.gallery ?? [];
  const merged = [...existingGallery, ...fromChanges, ...galleryUrlsFromImages];
  const dedup = [...new Set(merged.map((s) => s.trim()).filter(Boolean))];
  if (dedup.length > 0 || galleryUrlsFromImages.length > 0 || fromChanges.length > 0) {
    data.gallery = dedup.length > 0 ? dedup : Prisma.JsonNull;
  }

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data,
  });
}
