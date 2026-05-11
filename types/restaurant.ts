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

/** Origen de la ficha y revisión editorial (extensible a perfiles reclamados sin backend aún). */
export type RestaurantProfileSource = "auto" | "manual" | "owner_submitted";

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
    /** Horario estructurado para UI legible por día. */
    structured?: Array<{
      day: string;
      open: string;
      close: string;
    }>;
  };
  media: {
    hero: RestaurantPublicImagePath;
    /** Galería general (hasta 10 fotos). */
    gallery?: RestaurantPublicImagePath[];
    /**
     * Compatibilidad con entradas intermedias.
     * @deprecated Preferir `gallery`.
     */
    featured?: RestaurantPublicImagePath[];
    /**
     * Compatibilidad con entradas intermedias.
     * @deprecated Preferir `gallery`.
     */
    place?: RestaurantPublicImagePath[];
  };
  ratings: {
    /** Promedio 0–5 */
    average: number;
    /** Total de valoraciones en fuentes públicas (p. ej. Google), no comentarios de esta guía. */
    reviewsCount: number;
  };
  services: {
    offersDelivery: boolean;
    acceptsReservations: boolean;
  };
  /**
   * Enlace opcional a menú hospedado fuera del sitio (Linktree, ola.click, PDF, catálogo WhatsApp, etc.).
   */
  menu?: {
    url: string;
    label?: string;
  };
  /**
   * Estado editorial del perfil (p. ej. intake automático vs revisión humana).
   * Opcional en entradas antiguas; el intake nuevo lo rellena con valores por defecto.
   */
  profileStatus?: {
    source: RestaurantProfileSource;
    verified: boolean;
    /** Fecha ISO YYYY-MM-DD (texto) de última revisión editorial. */
    lastReviewed?: string;
  };
  /**
   * Opiniones editoriales verificadas (opcional). Dejar vacío si no hay comentarios reales;
   * la UI no muestra plantillas ni texto generado.
   */
  reviews: RestaurantReview[];
}
