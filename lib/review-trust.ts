import type { RestaurantReview } from "@/types/restaurant";

function normalizeLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/** Autores genéricos o marcadores que no deben mostrarse como opiniones reales. */
const BLOCKED_AUTHOR_KEYS = new Set(
  [
    "visitante local",
    "cliente frecuente",
    "cliente en linea",
    "comensal",
    "comensal local",
    "reseña inicial",
    "pendiente",
    "visitante",
  ].map(normalizeLabel),
);

/** Comentarios típicos de borrador / agente / plantilla. */
const PLACEHOLDER_COMMENT = new RegExp(
  [
    "completar\\s+reseña",
    "reseña\\s+por\\s+completar",
    "borrador",
    "\\bpendiente\\b",
    "por\\s+confirmar",
    "primera\\s+impresión\\s+positiva",
    "vale\\s+la\\s+pena\\s+validar",
    "señales\\s+públicas",
    "experiencia\\s+consistente\\s+para\\s+compartir",
    "validar\\s+menú",
    "hora\\s+pico",
  ].join("|"),
  "i",
);

function isSeedOrDraftId(id: string): boolean {
  return id.toLowerCase().includes("-seed-");
}

/**
 * Indica si una entrada en `reviews[]` puede mostrarse como opinión editorial verificada.
 * Conservador: ante duda, no se muestra.
 */
export function isTrustedEditorialReview(review: RestaurantReview): boolean {
  const authorKey = normalizeLabel(review.author ?? "");
  if (!authorKey || BLOCKED_AUTHOR_KEYS.has(authorKey)) return false;

  const comment = (review.comment ?? "").trim();
  if (comment.length < 24) return false;
  if (PLACEHOLDER_COMMENT.test(comment)) return false;

  const rating = Number(review.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return false;

  if (isSeedOrDraftId(review.id)) return false;

  return true;
}

export function getTrustedEditorialReviews(reviews: RestaurantReview[] | undefined): RestaurantReview[] {
  if (!reviews?.length) return [];
  return reviews.filter(isTrustedEditorialReview);
}
