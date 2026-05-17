/**
 * Helpers de QA para el pipeline híbrido Neon + archivos.
 * Sin dependencias de servidor; usable en tests y scripts.
 */
import type { Restaurant, RestaurantSourceMeta } from "@/types/restaurant";

export type HybridAuditIssue = {
  code: string;
  message: string;
  field?: string;
};

const PLACEHOLDER_HERO = "/restaurants/placeholders/hero-placeholder.svg";

function baseRestaurant(slug: string, overrides?: Partial<Restaurant>): Restaurant {
  return {
    identity: { name: "Test", slug },
    classification: { category: "familiar", priceRange: "$$", featured: false },
    copy: { summary: "" },
    location: { address: "", coordinates: { lat: 0, lng: 0 } },
    contact: { phone: "", whatsapp: "" },
    hours: { scheduleLabel: "" },
    media: { hero: PLACEHOLDER_HERO, gallery: [] },
    ratings: { average: 0, reviewsCount: 0 },
    services: { offersDelivery: false, acceptsReservations: false },
    reviews: [],
    ...overrides,
  };
}

/** Detecta si un restaurante Neon parece haber sido recontaminado por datos de archivo. */
export function auditNeonRestaurantAfterPipeline(
  before: Restaurant,
  after: Restaurant,
): HybridAuditIssue[] {
  const issues: HybridAuditIssue[] = [];
  if (before.sourceMeta?.kind !== "neon") return issues;

  if (!after.sourceMeta || after.sourceMeta.kind !== "neon") {
    issues.push({
      code: "SOURCE_META_LOST",
      message: "Se perdió sourceMeta.kind=neon tras el pipeline.",
    });
  }

  if (Array.isArray(before.media.gallery) && before.media.gallery.length === 0) {
    const afterLen = after.media.gallery?.length ?? 0;
    if (afterLen > 0) {
      issues.push({
        code: "GALLERY_REFILLED",
        field: "gallery",
        message: `Galería vacía en Neon pero el pipeline devolvió ${afterLen} imagen(es).`,
      });
    }
  }

  if (before.copy.summary === "" && after.copy.summary.trim().length > 0) {
    issues.push({
      code: "SUMMARY_REFILLED",
      field: "summary",
      message: "Resumen vacío en Neon rellenado desde archivo u otro fallback.",
    });
  }

  if (before.contact.phone === "" && after.contact.phone.trim().length > 0) {
    issues.push({
      code: "PHONE_REFILLED",
      field: "phone",
      message: "Teléfono vacío en Neon rellenado desde archivo.",
    });
  }

  if (before.contact.whatsapp === "" && after.contact.whatsapp.trim().length > 0) {
    issues.push({
      code: "WHATSAPP_REFILLED",
      field: "whatsapp",
      message: "WhatsApp vacío en Neon rellenado desde archivo.",
    });
  }

  if (before.hours.scheduleLabel === "" && after.hours.scheduleLabel.trim().length > 0) {
    issues.push({
      code: "SCHEDULE_REFILLED",
      field: "scheduleLabel",
      message: "Horario vacío en Neon rellenado desde archivo.",
    });
  }

  if (
    !before.services.offersDelivery &&
    !before.services.acceptsReservations &&
    (after.services.offersDelivery || after.services.acceptsReservations)
  ) {
    issues.push({
      code: "SERVICES_OR_MERGE",
      field: "services",
      message: "Servicios en false en Neon pero true tras merge con archivo.",
    });
  }

  if (before.sourceMeta && !before.sourceMeta.heroUrlSet) {
    const afterHero = after.media.hero.split("?")[0] ?? after.media.hero;
    if (afterHero !== PLACEHOLDER_HERO && !afterHero.startsWith("https://")) {
      issues.push({
        code: "HERO_DISK_OR_FILE",
        field: "heroUrl",
        message: "heroUrl null en Neon pero el hero público no es el placeholder esperado.",
      });
    }
  }

  return issues;
}

export function assertNeonPipelineClean(
  before: Restaurant,
  after: Restaurant,
): void {
  const issues = auditNeonRestaurantAfterPipeline(before, after);
  if (issues.length > 0) {
    const detail = issues.map((i) => `${i.code}: ${i.message}`).join("\n");
    throw new Error(`Pipeline híbrido recontaminó datos Neon:\n${detail}`);
  }
}

export function makeNeonRestaurantForAudit(
  slug: string,
  patch: Partial<Restaurant> & { sourceMeta?: RestaurantSourceMeta },
): Restaurant {
  return baseRestaurant(slug, {
    sourceMeta: {
      kind: "neon",
      heroUrlSet: false,
      galleryAuthoritative: true,
      summarySet: true,
      addressSet: true,
      phoneSet: true,
      whatsappSet: true,
      menuUrlSet: false,
      instagramUrlSet: false,
      scheduleLabelSet: true,
      scheduleStructuredSet: false,
      servicesAuthoritative: true,
    },
    ...patch,
  });
}
