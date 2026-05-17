import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { auditNeonRestaurantAfterPipeline, makeNeonRestaurantForAudit } from "./restaurant-hybrid-audit";
import { mergeRestaurantWithFileFallback } from "./restaurant-merge-file-fallback";
import { withDetectedGallery } from "./restaurants-file";
import type { Restaurant } from "@/types/restaurant";

const PLACEHOLDER = "/restaurants/placeholders/hero-placeholder.svg";

function fileRestaurant(slug: string): Restaurant {
  return {
    identity: { name: "Archivo", slug },
    classification: { category: "cafe", priceRange: "$$", featured: true },
    copy: { summary: "Resumen desde archivo TS" },
    location: { address: "Calle archivo", coordinates: { lat: 1, lng: 2 } },
    contact: { phone: "+504 9999-0000", whatsapp: "+504 9999-0000" },
    hours: {
      scheduleLabel: "Lun-Dom 8-6",
      structured: [{ day: "Lunes", open: "8:00", close: "18:00" }],
    },
    media: {
      hero: `/restaurants/${slug}/hero.jpg`,
      gallery: [`/restaurants/${slug}/gallery-1.jpg`],
      featured: [`/restaurants/${slug}/gallery-1.jpg`],
    },
    ratings: { average: 4.5, reviewsCount: 10 },
    services: { offersDelivery: true, acceptsReservations: true },
    reviews: [{ id: "1", author: "A", rating: 5, comment: "x", date: "2026-01-01" }],
  };
}

function runPublicPipeline(db: Restaurant, file: Restaurant | undefined): Restaurant {
  return withDetectedGallery(mergeRestaurantWithFileFallback(db, file));
}

describe("mergeRestaurantWithFileFallback", () => {
  it("no mezcla archivo cuando sourceMeta.kind es neon", () => {
    const db = makeNeonRestaurantForAudit("la-pastela", {
      copy: { summary: "" },
      contact: { phone: "", whatsapp: "" },
      media: { hero: PLACEHOLDER, gallery: [] },
      services: { offersDelivery: false, acceptsReservations: false },
    });
    const merged = mergeRestaurantWithFileFallback(db, fileRestaurant("la-pastela"));
    assert.equal(merged.copy.summary, "");
    assert.equal(merged.media.gallery?.length, 0);
    assert.equal(merged.services.offersDelivery, false);
    assert.equal(merged.contact.phone, "");
  });

  it("sí mezcla archivo para restaurantes solo-archivo", () => {
    const db = fileRestaurant("solo-archivo");
    delete (db as { sourceMeta?: unknown }).sourceMeta;
    const merged = mergeRestaurantWithFileFallback(
      { ...db, copy: { summary: "" }, media: { hero: PLACEHOLDER } },
      fileRestaurant("solo-archivo"),
    );
    assert.ok(merged.copy.summary.length > 0 || merged.media.gallery?.length);
  });
});

describe("withDetectedGallery + neon", () => {
  it("mantiene galería vacía y no añade featured/place", () => {
    const db = makeNeonRestaurantForAudit("test", {
      media: { hero: PLACEHOLDER, gallery: [] },
    });
    const out = runPublicPipeline(db, fileRestaurant("test"));
    assert.equal(out.media.gallery?.length, 0);
    assert.equal(out.media.featured?.length ?? 0, 0);
    assert.equal(out.media.place?.length ?? 0, 0);
    assertNeonClean(db, out);
  });

  it("no rellena resumen ni teléfono vacíos desde archivo", () => {
    const db = makeNeonRestaurantForAudit("test", {
      copy: { summary: "" },
      contact: { phone: "", whatsapp: "" },
      hours: { scheduleLabel: "" },
      media: { hero: PLACEHOLDER, gallery: [] },
    });
    const out = runPublicPipeline(db, fileRestaurant("test"));
    assert.equal(out.copy.summary, "");
    assert.equal(out.contact.phone, "");
    assertNeonClean(db, out);
  });
});

describe("auditNeonRestaurantAfterPipeline", () => {
  it("detecta galería rellenada indebidamente", () => {
    const before = makeNeonRestaurantForAudit("x", { media: { hero: PLACEHOLDER, gallery: [] } });
    const after = {
      ...before,
      media: { ...before.media, gallery: ["/restaurants/x/gallery-1.jpg"] },
    };
    const issues = auditNeonRestaurantAfterPipeline(before, after);
    assert.ok(issues.some((i) => i.code === "GALLERY_REFILLED"));
  });
});

function assertNeonClean(before: Restaurant, after: Restaurant): void {
  const issues = auditNeonRestaurantAfterPipeline(before, after);
  assert.equal(issues.length, 0, issues.map((i) => i.message).join("; "));
}
