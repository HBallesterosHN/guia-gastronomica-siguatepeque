import type { RestaurantCategory } from "../../types/restaurant";

/**
 * Mapea `types` de Google Places a categorías del schema local.
 * `bar` / `night_club` → `familiar` (no existe categoría `bar` en el schema).
 */
export function mapGoogleTypesToCategory(types: string[] | undefined): {
  category: RestaurantCategory;
  reason: string;
} | null {
  if (!types?.length) return null;
  const set = new Set(types.map((t) => t.toLowerCase()));

  if (set.has("cafe") || set.has("coffee_shop") || set.has("bakery")) {
    return { category: "cafe", reason: "Google Places types incluye café / coffee_shop / bakery." };
  }
  if (set.has("bar") || set.has("night_club")) {
    return {
      category: "familiar",
      reason: "Google Places types incluye bar / night_club; el schema no tiene categoría bar → familiar.",
    };
  }
  if (set.has("restaurant") || set.has("meal_takeaway") || set.has("food")) {
    return { category: "familiar", reason: "Google Places types incluye restaurant / comida." };
  }
  return null;
}
