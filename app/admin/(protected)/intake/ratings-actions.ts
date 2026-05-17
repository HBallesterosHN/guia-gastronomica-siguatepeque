"use server";

import { refreshGooglePlaceRatingsForRestaurants, refreshGooglePlaceRatingsForSlug } from "@/lib/admin/refresh-google-place-ratings";
import { revalidateRestaurantPublicCache } from "@/lib/revalidate-public-cache";
import type { RatingRefreshRowResult, RatingRefreshSummary } from "@/lib/admin/rating-refresh-types";
import { requirePlatformAdmin } from "@/lib/require-admin";

export type RefreshAllRatingsState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "done"; summary: RatingRefreshSummary; publishedOnly: boolean };

export async function refreshAllRestaurantRatingsAction(
  _prev: RefreshAllRatingsState,
  formData: FormData,
): Promise<RefreshAllRatingsState> {
  await requirePlatformAdmin();
  const publishedOnly = String(formData.get("publishedOnly") ?? "") === "1";

  try {
    const summary = await refreshGooglePlaceRatingsForRestaurants({ publishedOnly });
    for (const row of summary.rows) {
      if (row.status === "updated") {
        await revalidateRestaurantPublicCache({ slug: row.slug });
      }
    }
    return { status: "done", summary, publishedOnly };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { status: "error", message };
  }
}

export type RefreshOneRatingResult =
  | { ok: true; row: RatingRefreshRowResult }
  | { ok: false; message: string };

export async function refreshSingleRestaurantRatingAction(slug: string): Promise<RefreshOneRatingResult> {
  await requirePlatformAdmin();
  const s = slug.trim();
  if (!s) {
    return { ok: false, message: "Slug vacío." };
  }

  try {
    const row = await refreshGooglePlaceRatingsForSlug(s);
    if (row.status === "updated") {
      await revalidateRestaurantPublicCache({ slug: s });
    }
    return { ok: true, row };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, message };
  }
}
