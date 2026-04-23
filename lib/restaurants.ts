import { restaurants } from "@/data/restaurants";
import type {
  PriceRange,
  Restaurant,
  RestaurantCategory,
  RestaurantPublicImagePath,
} from "@/types/restaurant";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

const MAX_GALLERY_IMAGES = 4;
const GALLERY_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

function stripQuery(url: string): RestaurantPublicImagePath {
  const queryIndex = url.indexOf("?");
  const pathname = queryIndex === -1 ? url : url.slice(0, queryIndex);
  return pathname as RestaurantPublicImagePath;
}

function withAutoVersion(webPathWithOptionalQuery: string): RestaurantPublicImagePath {
  const webPath = stripQuery(webPathWithOptionalQuery);
  const absolutePath = path.join(process.cwd(), "public", webPath.replace(/^\//, ""));

  if (!existsSync(absolutePath)) {
    return webPath;
  }

  const version = Math.floor(statSync(absolutePath).mtimeMs).toString();
  return `${webPath}?v=${version}` as RestaurantPublicImagePath;
}

function detectGalleryFromPublic(slug: string): RestaurantPublicImagePath[] {
  const detected: RestaurantPublicImagePath[] = [];
  const publicRestaurantsDir = path.join(process.cwd(), "public", "restaurants", slug);

  for (let imageIndex = 1; imageIndex <= MAX_GALLERY_IMAGES; imageIndex += 1) {
    for (const extension of GALLERY_EXTENSIONS) {
      const fileName = `gallery-${imageIndex}.${extension}`;
      const absolutePath = path.join(publicRestaurantsDir, fileName);

      if (existsSync(absolutePath)) {
        detected.push(withAutoVersion(`/restaurants/${slug}/${fileName}`));
        break;
      }
    }
  }

  return detected;
}

function withDetectedGallery(restaurant: Restaurant): Restaurant {
  const detectedGallery = detectGalleryFromPublic(restaurant.identity.slug);
  const legacyGallery = restaurant.media.gallery ?? [];
  const fallbackFeatured = [
    ...(restaurant.media.featured ?? []),
    ...legacyGallery,
  ].map((imagePath) => withAutoVersion(imagePath));
  const fallbackPlace = (restaurant.media.place ?? []).map((imagePath) =>
    withAutoVersion(imagePath),
  );

  const detectedFeatured = detectedGallery.slice(0, 3);
  const detectedPlace = detectedGallery.slice(3);
  const featured =
    detectedGallery.length > 0
      ? detectedFeatured
      : Array.from(new Set(fallbackFeatured));
  const place =
    detectedGallery.length > 0
      ? detectedPlace
      : Array.from(new Set(fallbackPlace));

  return {
    ...restaurant,
    media: {
      ...restaurant.media,
      hero: withAutoVersion(restaurant.media.hero),
      featured,
      place,
      gallery: legacyGallery.map((imagePath) => withAutoVersion(imagePath)),
    },
  };
}

function getRestaurantsWithDetectedGallery(): Restaurant[] {
  return restaurants.map(withDetectedGallery);
}

export function getFeaturedRestaurants(limit = 3): Restaurant[] {
  return getRestaurantsWithDetectedGallery()
    .filter((restaurant) => restaurant.classification.featured)
    .slice(0, limit);
}

export function getAllRestaurants(): Restaurant[] {
  return getRestaurantsWithDetectedGallery();
}

export function getRestaurantBySlug(slug: string): Restaurant | undefined {
  return getRestaurantsWithDetectedGallery().find(
    (restaurant) => restaurant.identity.slug === slug,
  );
}

export function filterRestaurantsByCategory(
  category?: RestaurantCategory,
): Restaurant[] {
  if (!category) {
    return getRestaurantsWithDetectedGallery();
  }

  return getRestaurantsWithDetectedGallery().filter(
    (restaurant) => restaurant.classification.category === category,
  );
}

type YesNoFilter = "si" | "no";

export interface RestaurantFilters {
  category?: RestaurantCategory;
  priceRange?: PriceRange;
  delivery?: YesNoFilter;
  reservations?: YesNoFilter;
  minRating?: number;
}

export function filterRestaurants(filters: RestaurantFilters): Restaurant[] {
  return getRestaurantsWithDetectedGallery().filter((restaurant) => {
    const matchesCategory =
      !filters.category ||
      restaurant.classification.category === filters.category;
    const matchesPrice =
      !filters.priceRange ||
      restaurant.classification.priceRange === filters.priceRange;
    const matchesDelivery =
      !filters.delivery ||
      (filters.delivery === "si"
        ? restaurant.services.offersDelivery
        : !restaurant.services.offersDelivery);
    const matchesReservations =
      !filters.reservations ||
      (filters.reservations === "si"
        ? restaurant.services.acceptsReservations
        : !restaurant.services.acceptsReservations);
    const matchesMinRating =
      !filters.minRating || restaurant.ratings.average >= filters.minRating;

    return (
      matchesCategory &&
      matchesPrice &&
      matchesDelivery &&
      matchesReservations &&
      matchesMinRating
    );
  });
}
