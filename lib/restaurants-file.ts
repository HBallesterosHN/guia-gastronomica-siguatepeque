/**
 * Restaurantes solo desde `data/restaurants` (TypeScript).
 * El intake y scripts deben usar esta capa para no mezclar con Neon.
 */
import { restaurants } from "@/data/restaurants";
import type {
  PriceRange,
  Restaurant,
  RestaurantCategory,
  RestaurantPublicImagePath,
} from "@/types/restaurant";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const MAX_GALLERY_IMAGES = 10;
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

function detectNumberedImages(
  slug: string,
  prefix: "gallery",
  maxImages: number,
): RestaurantPublicImagePath[] {
  const detected: RestaurantPublicImagePath[] = [];
  const publicRestaurantsDir = path.join(process.cwd(), "public", "restaurants", slug);

  for (let imageIndex = 1; imageIndex <= maxImages; imageIndex += 1) {
    for (const extension of GALLERY_EXTENSIONS) {
      const fileName = `${prefix}-${imageIndex}.${extension}`;
      const absolutePath = path.join(publicRestaurantsDir, fileName);

      if (existsSync(absolutePath)) {
        detected.push(withAutoVersion(`/restaurants/${slug}/${fileName}`));
        break;
      }
    }
  }

  return detected;
}

function detectHeroFromPublic(slug: string): RestaurantPublicImagePath | undefined {
  const publicRestaurantsDir = path.join(process.cwd(), "public", "restaurants", slug);
  for (const extension of GALLERY_EXTENSIONS) {
    const fileName = `hero.${extension}`;
    const absolutePath = path.join(publicRestaurantsDir, fileName);
    if (existsSync(absolutePath)) {
      return withAutoVersion(`/restaurants/${slug}/${fileName}`);
    }
  }
  return undefined;
}

export function withDetectedGallery(restaurant: Restaurant): Restaurant {
  const detectedHero = detectHeroFromPublic(restaurant.identity.slug);
  const detectedGallery = detectNumberedImages(
    restaurant.identity.slug,
    "gallery",
    MAX_GALLERY_IMAGES,
  );
  const fallbackGallery = Array.from(
    new Set([
      ...(restaurant.media.gallery ?? []),
      ...(restaurant.media.featured ?? []),
      ...(restaurant.media.place ?? []),
    ]),
  )
    .map((imagePath) => withAutoVersion(imagePath))
    .slice(0, MAX_GALLERY_IMAGES);

  const gallery = detectedGallery.length > 0 ? detectedGallery : fallbackGallery;

  return {
    ...restaurant,
    media: {
      ...restaurant.media,
      hero: detectedHero ?? withAutoVersion(restaurant.media.hero),
      gallery,
      featured: (restaurant.media.featured ?? []).map((imagePath) => withAutoVersion(imagePath)),
      place: (restaurant.media.place ?? []).map((imagePath) => withAutoVersion(imagePath)),
    },
  };
}

function getRestaurantsWithDetectedGalleryFromFiles(): Restaurant[] {
  return restaurants.map(withDetectedGallery);
}

export function getAllRestaurantsFromFiles(): Restaurant[] {
  return getRestaurantsWithDetectedGalleryFromFiles();
}

export function getRestaurantBySlugFromFiles(slug: string): Restaurant | undefined {
  return getRestaurantsWithDetectedGalleryFromFiles().find(
    (restaurant) => restaurant.identity.slug === slug,
  );
}

export function getFeaturedRestaurantsFromFiles(limit = 6): Restaurant[] {
  return getRestaurantsWithDetectedGalleryFromFiles()
    .filter((restaurant) => restaurant.classification.featured)
    .slice(0, limit);
}

/** URL de Google Maps desde comentario o cuerpo del entry TS (intake). */
export function getGoogleMapsUrlFromEntryFile(slug: string): string | undefined {
  const entryFile = path.join(process.cwd(), "data", "restaurants", "entries", `${slug}.ts`);
  if (!existsSync(entryFile)) return undefined;
  try {
    const source = readFileSync(entryFile, "utf8");
    const byComment = source.match(/^\s*\*\s*Google Maps:\s*"([^"]+)"/m)?.[1]?.trim();
    if (byComment && /^https?:\/\//i.test(byComment)) return byComment;
    const byUrl = source.match(
      /https?:\/\/(?:maps\.google\.com|www\.google\.com\/maps|maps\.app\.goo\.gl)[^\s"'`]+/i,
    );
    return byUrl?.[0]?.trim();
  } catch {
    return undefined;
  }
}

export function getRestaurantInstagramUrlFromEntryFile(slug: string): string | undefined {
  const entryFile = path.join(process.cwd(), "data", "restaurants", "entries", `${slug}.ts`);
  if (!existsSync(entryFile)) return undefined;
  try {
    const source = readFileSync(entryFile, "utf8");
    const byComment = source.match(/^\s*\*\s*Instagram:\s*"([^"]+)"/m)?.[1]?.trim();
    if (byComment && /^https?:\/\/(www\.)?instagram\.com\//i.test(byComment)) {
      return byComment;
    }
    const byReference = source.match(/https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9._/-]+/i)?.[0]?.trim();
    if (byReference) return byReference;
  } catch {
    // no-op
  }
  return undefined;
}

type YesNoFilter = "si" | "no";

export interface RestaurantFilters {
  category?: RestaurantCategory;
  priceRange?: PriceRange;
  delivery?: YesNoFilter;
  reservations?: YesNoFilter;
  minRating?: number;
}

export function filterRestaurantsList(
  list: Restaurant[],
  filters: RestaurantFilters,
): Restaurant[] {
  return list.filter((restaurant) => {
    const matchesCategory =
      !filters.category || restaurant.classification.category === filters.category;
    const matchesPrice =
      !filters.priceRange || restaurant.classification.priceRange === filters.priceRange;
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

export function filterRestaurantsByCategoryFromFiles(
  category?: RestaurantCategory,
): Restaurant[] {
  if (!category) {
    return getRestaurantsWithDetectedGalleryFromFiles();
  }

  return getRestaurantsWithDetectedGalleryFromFiles().filter(
    (restaurant) => restaurant.classification.category === category,
  );
}
