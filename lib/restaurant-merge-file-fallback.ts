import "server-only";

import type { Restaurant } from "@/types/restaurant";
import { isStructuredScheduleUsable } from "@/lib/formatters/schedule";

const PLACEHOLDER_HERO = "/restaurants/placeholders/hero-placeholder.svg";

function isPlaceholderHero(url: string | undefined): boolean {
  if (!url?.trim()) return true;
  return url.trim() === PLACEHOLDER_HERO;
}

/**
 * DB gana como base, pero rellena huecos que Prisma no persiste o que quedaron vacíos tras migraciones / aprobaciones.
 */
export function mergeRestaurantWithFileFallback(db: Restaurant, file: Restaurant | undefined): Restaurant {
  if (!file) return db;

  const dbStructOk = isStructuredScheduleUsable(db.hours.structured);
  const fileStructOk = isStructuredScheduleUsable(file.hours.structured);

  let hours = { ...db.hours };
  if (!dbStructOk && fileStructOk) {
    hours = { ...db.hours, structured: file.hours.structured };
  }

  let media = { ...db.media };
  if (isPlaceholderHero(db.media.hero) && !isPlaceholderHero(file.media.hero)) {
    media = { ...media, hero: file.media.hero };
  }
  /** Galería definida en Neon (incluso `[]` tras borrar en admin): no mezclar con TS ni carpetas en public/. */
  const dbGalleryAuthoritative = Array.isArray(db.media.gallery);
  if (!dbGalleryAuthoritative && file.media.gallery && file.media.gallery.length > 0) {
    media = { ...media, gallery: file.media.gallery };
  } else if (
    !dbGalleryAuthoritative &&
    (file.media.featured?.length || file.media.place?.length)
  ) {
    media = {
      ...media,
      ...(file.media.featured?.length ? { featured: file.media.featured } : {}),
      ...(file.media.place?.length ? { place: file.media.place } : {}),
    };
  }

  const services: Restaurant["services"] = {
    offersDelivery: db.services.offersDelivery || file.services.offersDelivery,
    acceptsReservations: db.services.acceptsReservations || file.services.acceptsReservations,
  };

  const reviews = (db.reviews?.length ?? 0) > 0 ? db.reviews : (file.reviews ?? []);

  const profileStatus = {
    source: db.profileStatus?.source ?? file.profileStatus?.source ?? "auto",
    verified: Boolean(db.profileStatus?.verified || file.profileStatus?.verified),
    lastReviewed: db.profileStatus?.lastReviewed ?? file.profileStatus?.lastReviewed,
  };

  return {
    ...db,
    classification: {
      ...db.classification,
      featured: db.classification.featured,
    },
    hours,
    media,
    services,
    reviews,
    profileStatus,
  };
}
