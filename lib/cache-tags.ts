/** Tags para `unstable_cache` / `revalidateTag` (capa de datos públicos). */

export const RESTAURANTS_LIST_TAG = "restaurants-list";

export function restaurantCacheTag(slug: string): string {
  return `restaurant:${slug.trim()}`;
}

export function guideCacheTag(slug: string): string {
  return `guide:${slug.trim()}`;
}

export const GUIDES_LIST_TAG = "guides-list";
