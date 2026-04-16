/**
 * Tipos de datos para restaurantes (fuente única: archivos en data/restaurants).
 * Las imágenes viven en public/restaurants/ y se referencian con rutas absolutas desde la web root (/restaurants/...).
 */

export const RESTAURANT_CATEGORIES = [
  "desayuno",
  "cafe",
  "comida-tipica",
  "familiar",
  "romantico",
  "parrilla",
  "mariscos",
] as const;

export type RestaurantCategory = (typeof RESTAURANT_CATEGORIES)[number];

export type PriceRange = "$" | "$$" | "$$$";

/** Ruta servida por Next desde /public (ej. /restaurants/mi-slug/hero.jpg) */
export type RestaurantPublicImagePath = `/${string}`;

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface RestaurantReview {
  id: string;
  author: string;
  /** 1–5 */
  rating: number;
  comment: string;
  /** Fecha ISO YYYY-MM-DD (texto, editable a mano) */
  date: string;
}

/**
 * Un restaurante completo. Pensado para editarse a mano en data/restaurants/entries/*.ts
 * sin base de datos.
 */
export interface Restaurant {
  identity: {
    name: string;
    /** Debe coincidir con la carpeta public/restaurants/{slug}/ */
    slug: string;
  };
  classification: {
    category: RestaurantCategory;
    priceRange: PriceRange;
    /** Si aparece en destacados de la home */
    featured: boolean;
  };
  copy: {
    /** Texto corto para tarjetas y meta descripción */
    summary: string;
  };
  location: {
    address: string;
    coordinates: GeoCoordinates;
  };
  contact: {
    phone: string;
    whatsapp: string;
  };
  hours: {
    /** Horario en texto libre (ej. "Lun–Dom 8:00–20:00") */
    scheduleLabel: string;
  };
  media: {
    hero: RestaurantPublicImagePath;
    /** Rutas bajo /public/restaurants/... (vacío si no hay galería) */
    gallery: RestaurantPublicImagePath[];
  };
  ratings: {
    /** Promedio 0–5 */
    average: number;
    /** Total de reseñas (puede ser mayor que reviews.length si solo muestras algunas) */
    reviewsCount: number;
  };
  services: {
    offersDelivery: boolean;
    acceptsReservations: boolean;
  };
  /** Reseñas mostradas en el perfil (subset o todas) */
  reviews: RestaurantReview[];
}
