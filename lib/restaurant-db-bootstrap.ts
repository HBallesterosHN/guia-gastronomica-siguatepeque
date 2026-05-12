import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isStructuredScheduleUsable, parseScheduleManualInput } from "@/lib/formatters/schedule";
import {
  getRestaurantBySlugFromFiles,
  getRestaurantInstagramUrlFromEntryFile,
} from "@/lib/restaurants-file";
import type { Restaurant } from "@/types/restaurant";

export function mapFileRestaurantToPrismaCreate(file: Restaurant): Prisma.RestaurantCreateInput {
  const galleryPaths =
    file.media.gallery?.filter((p) => typeof p === "string" && (p.startsWith("/") || p.startsWith("https://"))) ??
    [];
  const instagramFromFile = getRestaurantInstagramUrlFromEntryFile(file.identity.slug);

  const parsed = parseScheduleManualInput(file.hours.scheduleLabel || "");
  const structured =
    file.hours.structured && isStructuredScheduleUsable(file.hours.structured)
      ? file.hours.structured
      : parsed.structured;
  const scheduleStructured = isStructuredScheduleUsable(structured)
    ? { scheduleStructured: structured }
    : {};

  return {
    slug: file.identity.slug,
    name: file.identity.name,
    category: file.classification.category,
    priceRange: file.classification.priceRange,
    summary: file.copy.summary,
    address: file.location.address,
    lat: file.location.coordinates.lat,
    lng: file.location.coordinates.lng,
    phone: file.contact.phone,
    whatsapp: file.contact.whatsapp,
    scheduleLabel: file.hours.scheduleLabel,
    ...scheduleStructured,
    menuUrl: file.menu?.url?.trim() || null,
    instagramUrl: instagramFromFile?.trim() || null,
    googleMapsUrl: null,
    ratingAverage: file.ratings.average,
    reviewsCount: file.ratings.reviewsCount,
    heroUrl: file.media.hero,
    ...(galleryPaths.length > 0 ? { gallery: galleryPaths } : {}),
    source: "owner_submitted",
    verified: file.profileStatus?.verified ?? false,
    status: "published",
  };
}

/**
 * Devuelve el `id` en Neon del restaurante con ese slug, creando la fila desde archivos si no existe.
 */
export async function ensureRestaurantInDbBySlug(slug: string): Promise<{ id: string } | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;

  const existing = await prisma.restaurant.findUnique({ where: { slug: trimmed } });
  if (existing) return { id: existing.id };

  const file = getRestaurantBySlugFromFiles(trimmed);
  if (!file) return null;

  const created = await prisma.restaurant.create({
    data: mapFileRestaurantToPrismaCreate(file),
  });
  return { id: created.id };
}
