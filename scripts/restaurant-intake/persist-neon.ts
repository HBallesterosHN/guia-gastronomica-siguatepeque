/**
 * Re-export hacia la implementación compartida (CLI + admin web).
 */
export {
  persistDraftToNeon,
  saveRestaurantToDatabase,
  restaurantSlugExistsInNeon,
} from "@/lib/restaurant-intake/save-restaurant-to-database";
export type {
  PersistNeonResult,
  SaveRestaurantToDatabaseParams,
} from "@/lib/restaurant-intake/save-restaurant-to-database";
