import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type OwnerChangesJson = {
  phone?: string;
  whatsapp?: string;
  scheduleLabel?: string;
  menuUrl?: string;
  instagramUrl?: string;
  summary?: string;
  heroUrl?: string;
  gallery?: string[];
};

export function parseOwnerChangesJson(raw: unknown): OwnerChangesJson {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const str = (k: string) => (typeof o[k] === "string" ? (o[k] as string).trim() : undefined);
  const out: OwnerChangesJson = {};
  const phone = str("phone");
  const whatsapp = str("whatsapp");
  const scheduleLabel = str("scheduleLabel");
  const menuUrl = str("menuUrl");
  const instagramUrl = str("instagramUrl");
  const summary = str("summary");
  const heroUrl = str("heroUrl");
  if (phone !== undefined) out.phone = phone;
  if (whatsapp !== undefined) out.whatsapp = whatsapp;
  if (scheduleLabel !== undefined) out.scheduleLabel = scheduleLabel;
  if (menuUrl !== undefined) out.menuUrl = menuUrl;
  if (instagramUrl !== undefined) out.instagramUrl = instagramUrl;
  if (summary !== undefined) out.summary = summary;
  if (heroUrl !== undefined) out.heroUrl = heroUrl;
  if (Array.isArray(o.gallery)) {
    const urls = o.gallery.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
    if (urls.length) out.gallery = urls;
  }
  return out;
}

function toGalleryArray(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
  }
  return [];
}

export function parseImageUrlsJson(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
  }
  return [];
}

/**
 * Aplica cambios editoriales aprobados sobre `Restaurant` (solo columnas conocidas).
 * `imageUrls` se fusiona con `gallery` existente (deduplicado por string).
 */
export async function applyApprovedChangesToRestaurant(
  restaurantId: string,
  changes: OwnerChangesJson,
  imageUrls: string[],
): Promise<void> {
  const current = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { gallery: true },
  });

  const data: Prisma.RestaurantUpdateInput = {};
  if (changes.phone !== undefined) data.phone = changes.phone || null;
  if (changes.whatsapp !== undefined) data.whatsapp = changes.whatsapp || null;
  if (changes.scheduleLabel !== undefined) data.scheduleLabel = changes.scheduleLabel || null;
  if (changes.menuUrl !== undefined) data.menuUrl = changes.menuUrl || null;
  if (changes.instagramUrl !== undefined) data.instagramUrl = changes.instagramUrl || null;
  if (changes.summary !== undefined) data.summary = changes.summary || null;
  if (changes.heroUrl !== undefined) data.heroUrl = changes.heroUrl || null;

  const existingGallery = toGalleryArray(current?.gallery);
  const fromChanges = changes.gallery ?? [];
  const merged = [...existingGallery, ...fromChanges, ...imageUrls];
  const dedup = [...new Set(merged.map((s) => s.trim()).filter(Boolean))];
  if (dedup.length > 0 || imageUrls.length > 0 || fromChanges.length > 0) {
    data.gallery = dedup.length > 0 ? dedup : Prisma.JsonNull;
  }

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data,
  });
}
