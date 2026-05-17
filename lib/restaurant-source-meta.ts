import type { Restaurant as DbRestaurant } from "@prisma/client";
import type { RestaurantSourceMeta } from "@/types/restaurant";

const PLACEHOLDER_HERO = "/restaurants/placeholders/hero-placeholder.svg";

/** Fila publicada en Neon: metadatos para no reinyectar archivos TS ni disco. */
export function buildNeonRestaurantSourceMeta(row: DbRestaurant): RestaurantSourceMeta {
  return {
    kind: "neon",
    heroUrlSet: Boolean(row.heroUrl?.trim()),
    galleryAuthoritative: true,
    summarySet: row.summary !== null,
    addressSet: row.address !== null,
    phoneSet: row.phone !== null,
    whatsappSet: row.whatsapp !== null,
    menuUrlSet: row.menuUrl !== null,
    instagramUrlSet: row.instagramUrl !== null,
    scheduleLabelSet: row.scheduleLabel !== null,
    scheduleStructuredSet: row.scheduleStructured !== null,
    servicesAuthoritative: true,
  };
}

export function isNeonRestaurant(restaurant: { sourceMeta?: RestaurantSourceMeta }): boolean {
  return restaurant.sourceMeta?.kind === "neon";
}

export function isPlaceholderHeroUrl(url: string | undefined): boolean {
  if (!url?.trim()) return true;
  return url.trim() === PLACEHOLDER_HERO;
}
