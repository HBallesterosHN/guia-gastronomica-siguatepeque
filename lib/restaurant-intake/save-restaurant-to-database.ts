/**
 * Persistencia del intake en Neon (Prisma). Sube imágenes a Cloudinary si está configurado.
 */

import path from "node:path";
import { Prisma } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";
import { normalizeHondurasPhone } from "@/lib/formatters/phone";
import { isStructuredScheduleUsable, parseScheduleManualInput } from "@/lib/formatters/schedule";
import type { NormalizedDraft } from "@/scripts/restaurant-intake/types";
import { configureCloudinary, isAlreadyOurCloudinaryUrl, isCloudinaryConfigured } from "./cloudinary-server";

const CLOUDINARY_FOLDER = "mevoyasigua/restaurants";

export async function restaurantSlugExistsInNeon(slug: string): Promise<boolean> {
  if (!process.env.DATABASE_URL?.trim()) return false;
  const row = await prisma.restaurant.findUnique({
    where: { slug },
    select: { id: true },
  });
  return Boolean(row);
}

function isLocalPublicPath(p: string): boolean {
  return p.startsWith("/") && !p.startsWith("//");
}

function isSafeHttpsImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    if (/^(localhost|127\.0\.0\.1)$/i.test(u.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

function phoneForDb(raw: string): string | null {
  const t = raw.trim();
  if (!t || /^por\s*confirmar$/i.test(t)) return null;
  return normalizeHondurasPhone(t) ?? t;
}

async function uploadOneToCloudinary(source: string, slug: string, label: string): Promise<string> {
  if (isAlreadyOurCloudinaryUrl(source)) {
    return source;
  }
  const folder = `${CLOUDINARY_FOLDER}/${slug}`;
  configureCloudinary();
  if (source.startsWith("https://")) {
    const r = await cloudinary.uploader.upload(source, {
      folder,
      resource_type: "image",
      overwrite: false,
    });
    return r.secure_url;
  }
  if (!isLocalPublicPath(source)) {
    throw new Error(`${label}: ruta no soportada (${source}).`);
  }
  const abs = path.join(process.cwd(), "public", source.replace(/^\//, ""));
  const r = await cloudinary.uploader.upload(abs, {
    folder,
    resource_type: "image",
    overwrite: false,
  });
  return r.secure_url;
}

function assertMediaSafeWithoutCloudinary(hero: string, gallery: string[]): void {
  if (isLocalPublicPath(hero)) {
    throw new Error(
      "El hero es una ruta local (/public/…). Para guardar en DB sin Cloudinary configurado, sube imágenes con Cloudinary o usa text-only para no actualizar medios.",
    );
  }
  if (!isSafeHttpsImageUrl(hero)) {
    throw new Error(`Hero URL no válida para guardar sin Cloudinary: ${hero}`);
  }
  for (const g of gallery) {
    if (isLocalPublicPath(g)) {
      throw new Error(
        "La galería contiene rutas locales. Configura Cloudinary o usa text-only para no actualizar medios en DB.",
      );
    }
    if (!isSafeHttpsImageUrl(g)) {
      throw new Error(`Galería: URL no válida sin Cloudinary: ${g}`);
    }
  }
}

async function resolveMediaUrlsForDb(
  slug: string,
  hero: string,
  gallery: string[],
  textOnly: boolean,
  existingHero: string | null,
  existingGallery: unknown,
): Promise<{ heroUrl: string | null; gallery: string[] }> {
  if (textOnly) {
    const gh = existingHero?.trim() || null;
    const gal = Array.isArray(existingGallery)
      ? (existingGallery as unknown[]).filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      : [];
    return { heroUrl: gh, gallery: gal };
  }

  const galIn = gallery.slice(0, 10);
  if (isCloudinaryConfigured()) {
    const heroUrl = await uploadOneToCloudinary(hero, slug, "hero");
    const urls: string[] = [];
    for (let i = 0; i < galIn.length; i += 1) {
      urls.push(await uploadOneToCloudinary(galIn[i]!, slug, `gallery-${i + 1}`));
    }
    return { heroUrl, gallery: urls };
  }

  assertMediaSafeWithoutCloudinary(hero, galIn);
  return { heroUrl: hero, gallery: galIn };
}

function draftToRestaurantData(
  draft: NormalizedDraft,
  media: { heroUrl: string | null; gallery: string[] },
): Prisma.RestaurantCreateInput {
  const scheduleLabel = draft.hours?.trim() || null;
  const parsed = parseScheduleManualInput(draft.hours || "");
  const structured =
    draft.hoursStructured && isStructuredScheduleUsable(draft.hoursStructured)
      ? draft.hoursStructured
      : parsed.structured;
  const scheduleStructured = (
    isStructuredScheduleUsable(structured) ? structured : Prisma.JsonNull
  ) as Prisma.InputJsonValue;

  const galleryJson = (
    media.gallery.length > 0 ? media.gallery : Prisma.JsonNull
  ) as Prisma.InputJsonValue;

  return {
    slug: draft.slug,
    name: draft.name,
    category: draft.category,
    priceRange: "$$",
    summary: draft.summary?.trim() || null,
    address: draft.address?.trim() || null,
    lat: draft.coordinates.lat,
    lng: draft.coordinates.lng,
    phone: phoneForDb(draft.phone),
    whatsapp: phoneForDb(draft.whatsapp),
    scheduleLabel,
    scheduleStructured,
    menuUrl: draft.menu?.url?.trim() || null,
    instagramUrl: draft.instagramUrl?.trim() || null,
    googleMapsUrl: draft.mapsUrl?.trim() || null,
    ratingAverage: draft.ratings.average,
    reviewsCount: Math.max(0, Math.round(draft.ratings.reviewsCount || 0)),
    heroUrl: media.heroUrl,
    gallery: galleryJson,
    source: "auto",
    verified: false,
    status: "published",
  };
}

export type PersistNeonResult = {
  wroteDb: boolean;
  created: boolean;
  existedBefore: boolean;
};

export type SaveRestaurantToDatabaseParams = {
  draft: NormalizedDraft;
  dryRun: boolean;
  textOnly: boolean;
  force: boolean;
};

/**
 * Crea o actualiza `Restaurant` en Neon desde el borrador normalizado del intake.
 */
export async function saveRestaurantToDatabase(
  params: SaveRestaurantToDatabaseParams,
): Promise<PersistNeonResult> {
  const { draft, dryRun, textOnly, force } = params;
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL no está definido; no se puede guardar en Neon.");
  }

  const existing = await prisma.restaurant.findUnique({
    where: { slug: draft.slug },
    select: { id: true, heroUrl: true, gallery: true },
  });
  const existedBefore = Boolean(existing);

  if (existedBefore && !force && !dryRun) {
    throw new Error(
      `Ya existe un restaurante con slug "${draft.slug}" en Neon. Confirma sobrescribir para actualizar.`,
    );
  }

  if (dryRun) {
    return { wroteDb: false, created: !existedBefore, existedBefore };
  }

  let media: { heroUrl: string | null; gallery: string[] };
  if (textOnly && existedBefore) {
    media = await resolveMediaUrlsForDb(
      draft.slug,
      draft.hero,
      draft.gallery,
      true,
      existing?.heroUrl ?? null,
      existing?.gallery ?? null,
    );
  } else if (textOnly && !existedBefore) {
    media = { heroUrl: draft.hero.startsWith("https://") ? draft.hero : null, gallery: [] };
    if (draft.hero && isLocalPublicPath(draft.hero) && !isCloudinaryConfigured()) {
      throw new Error(
        "Creación en DB con text-only y sin fila previa: el hero no puede ser ruta local sin Cloudinary.",
      );
    }
  } else {
    media = await resolveMediaUrlsForDb(
      draft.slug,
      draft.hero,
      draft.gallery,
      false,
      existing?.heroUrl ?? null,
      existing?.gallery ?? null,
    );
  }

  const data = draftToRestaurantData(draft, media);

  if (existedBefore) {
    await prisma.restaurant.update({
      where: { slug: draft.slug },
      data: {
        name: data.name,
        category: data.category,
        priceRange: data.priceRange,
        summary: data.summary,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        phone: data.phone,
        whatsapp: data.whatsapp,
        scheduleLabel: data.scheduleLabel,
        scheduleStructured: data.scheduleStructured,
        menuUrl: data.menuUrl,
        instagramUrl: data.instagramUrl,
        googleMapsUrl: data.googleMapsUrl,
        ratingAverage: data.ratingAverage,
        reviewsCount: data.reviewsCount,
        heroUrl: data.heroUrl,
        gallery: data.gallery,
        source: data.source,
        verified: data.verified,
        status: data.status,
      },
    });
  } else {
    await prisma.restaurant.create({ data });
  }

  return { wroteDb: true, created: !existedBefore, existedBefore };
}

/** @deprecated Usa `saveRestaurantToDatabase`; se mantiene para el CLI. */
export const persistDraftToNeon = saveRestaurantToDatabase;
