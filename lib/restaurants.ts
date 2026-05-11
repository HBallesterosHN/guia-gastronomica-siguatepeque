/**
 * API pública de restaurantes (Neon + archivos).
 * Para intake y scripts que solo deben leer/escribir TS, usar `@/lib/restaurants-file`.
 */
export {
  getAllRestaurants,
  getRestaurantBySlug,
  getFeaturedRestaurants,
  getFeaturedRestaurantsFromFilesOnly,
  filterRestaurants,
  filterRestaurantsByCategory,
  getRestaurantInstagramUrlBySlug,
  mapPrismaRestaurantToRestaurant,
} from "@/lib/restaurants-data";

export type { RestaurantFilters } from "@/lib/restaurants-data";

export {
  getAllRestaurantsFromFiles,
  getRestaurantBySlugFromFiles,
  getFeaturedRestaurantsFromFiles,
  getRestaurantInstagramUrlFromEntryFile,
  filterRestaurantsList,
  filterRestaurantsByCategoryFromFiles,
  withDetectedGallery,
} from "@/lib/restaurants-file";
