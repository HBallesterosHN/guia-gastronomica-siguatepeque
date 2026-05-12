/**
 * Capa híbrida: restaurantes publicados en Neon + fallback en `data/restaurants`.
 * Si un slug existe en ambos, gana la fila de la base de datos.
 */
import type { Restaurant as DbRestaurant } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatHondurasPhone } from "@/lib/formatters/phone";
import { isStructuredScheduleUsable, type StructuredHourRow } from "@/lib/formatters/schedule";
import {
  filterRestaurantsList,
  getAllRestaurantsFromFiles,
  getFeaturedRestaurantsFromFiles,
  getRestaurantBySlugFromFiles,
  getRestaurantInstagramUrlFromEntryFile,
  withDetectedGallery,
} from "@/lib/restaurants-file";
import type { RestaurantFilters } from "@/lib/restaurants-file";
import {
  RESTAURANT_CATEGORIES,
  type PriceRange,
  type Restaurant,
  type RestaurantCategory,
  type RestaurantProfileSource,
  type RestaurantPublicImagePath,
} from "@/types/restaurant";

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function parseCategory(raw: string): RestaurantCategory {
  return RESTAURANT_CATEGORIES.includes(raw as RestaurantCategory)
    ? (raw as RestaurantCategory)
    : "familiar";
}

function parsePriceRange(raw: string): PriceRange {
  return raw === "$" || raw === "$$" || raw === "$$$" ? raw : "$$";
}

function parseProfileSource(raw: string): RestaurantProfileSource {
  if (raw === "manual" || raw === "owner_submitted") return raw;
  return "auto";
}

export function mapPrismaRestaurantToRestaurant(row: DbRestaurant): Restaurant {
  const slug = row.slug;
  const category = parseCategory(row.category);
  const priceRange = parsePriceRange(row.priceRange);

  const rowExt = row as DbRestaurant & { scheduleStructured?: unknown };
  let structuredFromDb: StructuredHourRow[] | undefined;
  if (Array.isArray(rowExt.scheduleStructured)) {
    const rows: StructuredHourRow[] = [];
    for (const item of rowExt.scheduleStructured) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const r = item as Record<string, unknown>;
      const day = typeof r.day === "string" ? r.day.trim() : "";
      const open = typeof r.open === "string" ? r.open.trim() : "";
      const close = typeof r.close === "string" ? r.close.trim() : "";
      if (day && open && close) rows.push({ day, open, close });
    }
    if (isStructuredScheduleUsable(rows)) structuredFromDb = rows;
  }

  let galleryPaths: RestaurantPublicImagePath[] = [];
  if (row.gallery != null && Array.isArray(row.gallery)) {
    galleryPaths = row.gallery
      .filter(
        (u): u is string =>
          typeof u === "string" && (u.startsWith("/") || u.startsWith("https://")),
      )
      .map((u) => u as RestaurantPublicImagePath);
  }

  const heroRaw = row.heroUrl?.trim() ?? "";
  const hero = (
    heroRaw.startsWith("/") || heroRaw.startsWith("https://")
      ? heroRaw
      : "/restaurants/placeholders/hero-placeholder.svg"
  ) as RestaurantPublicImagePath;

  const phoneRaw = row.phone?.trim() || "Por confirmar";
  const waRaw = row.whatsapp?.trim() || row.phone?.trim() || "Por confirmar";
  const phoneDisplay = formatHondurasPhone(phoneRaw);
  const waDisplay = formatHondurasPhone(waRaw);

  const scheduleLabelDb = row.scheduleLabel?.trim() || "Horario por confirmar.";

  return {
    identity: { name: row.name, slug },
    classification: {
      category,
      priceRange,
      featured: false,
    },
    copy: {
      summary: row.summary?.trim() || `${row.name} en Siguatepeque.`,
    },
    location: {
      address: row.address?.trim() || "Por confirmar",
      coordinates: {
        lat: row.lat ?? 0,
        lng: row.lng ?? 0,
      },
    },
    contact: {
      phone: phoneDisplay,
      whatsapp: waDisplay,
    },
    hours: {
      scheduleLabel: scheduleLabelDb,
      ...(structuredFromDb ? { structured: structuredFromDb } : {}),
    },
    media: {
      hero,
      gallery: galleryPaths.length > 0 ? galleryPaths : undefined,
    },
    ratings: {
      average: row.ratingAverage,
      reviewsCount: row.reviewsCount,
    },
    services: {
      offersDelivery: false,
      acceptsReservations: false,
    },
    menu: row.menuUrl?.trim() ? { url: row.menuUrl.trim() } : undefined,
    profileStatus: {
      source: parseProfileSource(row.source),
      verified: row.verified,
    },
    reviews: [],
  };
}

async function fetchPublishedRestaurantsFromDb(): Promise<Restaurant[]> {
  if (!hasDatabaseUrl()) return [];
  try {
    const rows = await prisma.restaurant.findMany({
      where: { status: "published" },
      orderBy: { name: "asc" },
    });
    return rows.map((row) => withDetectedGallery(mapPrismaRestaurantToRestaurant(row)));
  } catch (err) {
    console.error("[restaurants-data] Neon/Prisma: no se pudieron leer restaurantes; solo archivos.", err);
    return [];
  }
}

export async function getAllRestaurants(): Promise<Restaurant[]> {
  const fromFiles = getAllRestaurantsFromFiles();
  const fromDb = await fetchPublishedRestaurantsFromDb();
  const bySlug = new Map<string, Restaurant>();

  for (const r of fromFiles) {
    bySlug.set(r.identity.slug, r);
  }
  for (const r of fromDb) {
    bySlug.set(r.identity.slug, r);
  }

  return [...bySlug.values()];
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | undefined> {
  if (hasDatabaseUrl()) {
    try {
      const row = await prisma.restaurant.findFirst({
        where: { slug, status: "published" },
      });
      if (row) {
        return withDetectedGallery(mapPrismaRestaurantToRestaurant(row));
      }
    } catch (err) {
      console.error("[restaurants-data] getRestaurantBySlug DB error; se intenta archivo.", err);
    }
  }
  return getRestaurantBySlugFromFiles(slug);
}

/** Destacados: mismas reglas que en archivos (`featured: true`), sobre lista ya fusionada. */
export async function getFeaturedRestaurants(limit = 6): Promise<Restaurant[]> {
  const merged = await getAllRestaurants();
  return merged.filter((r) => r.classification.featured).slice(0, limit);
}

/**
 * Lista destacada solo desde archivos (p. ej. metadatos OG sin tocar DB en build sin `DATABASE_URL`).
 */
export function getFeaturedRestaurantsFromFilesOnly(limit = 6): Restaurant[] {
  return getFeaturedRestaurantsFromFiles(limit);
}

export async function filterRestaurants(filters: RestaurantFilters): Promise<Restaurant[]> {
  const merged = await getAllRestaurants();
  return filterRestaurantsList(merged, filters);
}

export async function filterRestaurantsByCategory(
  category?: RestaurantCategory,
): Promise<Restaurant[]> {
  const merged = await getAllRestaurants();
  if (!category) return merged;
  return merged.filter((r) => r.classification.category === category);
}

export async function getRestaurantInstagramUrlBySlug(slug: string): Promise<string | undefined> {
  if (hasDatabaseUrl()) {
    try {
      const row = await prisma.restaurant.findFirst({
        where: { slug, status: "published" },
        select: { instagramUrl: true },
      });
      const u = row?.instagramUrl?.trim();
      if (u && /^https?:\/\/(www\.)?instagram\.com\//i.test(u)) {
        return u;
      }
    } catch {
      // seguir con archivo
    }
  }
  return getRestaurantInstagramUrlFromEntryFile(slug);
}

export type { RestaurantFilters } from "@/lib/restaurants-file";
