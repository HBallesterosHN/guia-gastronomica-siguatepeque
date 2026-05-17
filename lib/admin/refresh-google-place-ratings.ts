import "server-only";

import { prisma } from "@/lib/prisma";
import type { RatingRefreshRowResult, RatingRefreshSummary } from "@/lib/admin/rating-refresh-types";
import { resolvePlaceRatings } from "@/scripts/restaurant-intake/google-places";

export type { RatingRefreshRowResult, RatingRefreshSummary } from "@/lib/admin/rating-refresh-types";

const DELAY_BETWEEN_MS = 400;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ratingsUnchanged(
  prevRating: number,
  prevReviews: number,
  nextRating: number,
  nextReviews: number,
): boolean {
  return Math.abs(prevRating - nextRating) < 0.001 && prevReviews === nextReviews;
}

export async function refreshGooglePlaceRatingsForRestaurants(options: {
  publishedOnly: boolean;
}): Promise<RatingRefreshSummary> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY no está configurada en el servidor.");
  }

  const rows = await prisma.restaurant.findMany({
    where: options.publishedOnly ? { status: "published" } : undefined,
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      address: true,
      googleMapsUrl: true,
      lat: true,
      lng: true,
      ratingAverage: true,
      reviewsCount: true,
    },
  });

  const results: RatingRefreshRowResult[] = [];
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]!;
    const base = {
      name: row.name,
      slug: row.slug,
      previousRating: row.ratingAverage,
      previousReviews: row.reviewsCount,
      newRating: null as number | null,
      newReviews: null as number | null,
    };

    if (i > 0) await sleep(DELAY_BETWEEN_MS);

    const coords =
      row.lat != null && row.lng != null && Number.isFinite(row.lat) && Number.isFinite(row.lng)
        ? { lat: row.lat, lng: row.lng }
        : undefined;

    const resolved = await resolvePlaceRatings(apiKey, {
      displayName: row.name,
      mapsUrl: row.googleMapsUrl,
      address: row.address,
      coords,
    });

    if (!resolved.ok) {
      console.warn(`[ratings-refresh] ${row.slug}: error — ${resolved.reason}`);
      errors += 1;
      results.push({
        ...base,
        status: "error",
        reason: resolved.reason,
      });
      continue;
    }

    const { rating, userRatingCount } = resolved.ratings;
    if (rating === undefined && userRatingCount === undefined) {
      console.warn(`[ratings-refresh] ${row.slug}: sin datos de rating en Places`);
      skipped += 1;
      results.push({
        ...base,
        status: "skipped",
        reason: "Google Places no devolvió rating ni cantidad de reseñas.",
      });
      continue;
    }

    const nextRating = rating ?? row.ratingAverage;
    const nextReviews = userRatingCount ?? row.reviewsCount;

    if (ratingsUnchanged(row.ratingAverage, row.reviewsCount, nextRating, nextReviews)) {
      console.log(`[ratings-refresh] ${row.slug}: sin cambios (${nextRating} / ${nextReviews})`);
      skipped += 1;
      results.push({
        ...base,
        newRating: nextRating,
        newReviews: nextReviews,
        status: "skipped",
        reason: "Sin cambios respecto a la base de datos.",
      });
      continue;
    }

    await prisma.restaurant.update({
      where: { id: row.id },
      data: {
        ratingAverage: nextRating,
        reviewsCount: nextReviews,
      },
    });

    console.log(
      `[ratings-refresh] ${row.slug}: actualizado ${row.ratingAverage}→${nextRating}, reseñas ${row.reviewsCount}→${nextReviews}`,
    );
    updated += 1;
    results.push({
      ...base,
      newRating: nextRating,
      newReviews: nextReviews,
      status: "updated",
    });
  }

  const summary: RatingRefreshSummary = {
    total: rows.length,
    updated,
    skipped,
    errors,
    rows: results,
  };

  console.log(
    `[ratings-refresh] Fin: ${summary.total} procesados, ${summary.updated} actualizados, ${summary.skipped} sin cambios/omitidos, ${summary.errors} errores`,
  );

  return summary;
}

export async function refreshGooglePlaceRatingsForSlug(
  slug: string,
): Promise<RatingRefreshRowResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY no está configurada en el servidor.");
  }

  const row = await prisma.restaurant.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      address: true,
      googleMapsUrl: true,
      lat: true,
      lng: true,
      ratingAverage: true,
      reviewsCount: true,
    },
  });

  if (!row) {
    return {
      name: slug,
      slug,
      previousRating: 0,
      previousReviews: 0,
      newRating: null,
      newReviews: null,
      status: "error",
      reason: "No existe restaurante con ese slug en Neon.",
    };
  }

  const base = {
    name: row.name,
    slug: row.slug,
    previousRating: row.ratingAverage,
    previousReviews: row.reviewsCount,
    newRating: null as number | null,
    newReviews: null as number | null,
  };

  const coords =
    row.lat != null && row.lng != null && Number.isFinite(row.lat) && Number.isFinite(row.lng)
      ? { lat: row.lat, lng: row.lng }
      : undefined;

  const resolved = await resolvePlaceRatings(apiKey, {
    displayName: row.name,
    mapsUrl: row.googleMapsUrl,
    address: row.address,
    coords,
  });

  if (!resolved.ok) {
    return { ...base, status: "error", reason: resolved.reason };
  }

  const { rating, userRatingCount } = resolved.ratings;
  if (rating === undefined && userRatingCount === undefined) {
    return {
      ...base,
      status: "skipped",
      reason: "Google Places no devolvió rating ni cantidad de reseñas.",
    };
  }

  const nextRating = rating ?? row.ratingAverage;
  const nextReviews = userRatingCount ?? row.reviewsCount;

  if (ratingsUnchanged(row.ratingAverage, row.reviewsCount, nextRating, nextReviews)) {
    return {
      ...base,
      newRating: nextRating,
      newReviews: nextReviews,
      status: "skipped",
      reason: "Sin cambios respecto a la base de datos.",
    };
  }

  await prisma.restaurant.update({
    where: { id: row.id },
    data: { ratingAverage: nextRating, reviewsCount: nextReviews },
  });

  return {
    ...base,
    newRating: nextRating,
    newReviews: nextReviews,
    status: "updated",
  };
}
