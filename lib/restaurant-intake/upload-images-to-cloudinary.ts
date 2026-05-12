import { buildPlacePhotoMediaUrl } from "./place-photo-url";
import {
  configureCloudinary,
  isCloudinaryConfigured,
  uploadHttpsImageToRestaurantFolder,
} from "./cloudinary-server";

/**
 * Sube URLs https públicas (p. ej. og:image) a Cloudinary bajo `mevoyasigua/restaurants/{slug}/`.
 */
export async function uploadImagesToCloudinary(
  slug: string,
  urls: string[],
): Promise<{ urls: string[]; errors: string[] }> {
  if (!isCloudinaryConfigured()) {
    return { urls: [], errors: ["Cloudinary no está configurado."] };
  }
  const out: string[] = [];
  const errors: string[] = [];
  for (const u of urls) {
    const t = u.trim();
    if (!t.startsWith("https://")) {
      errors.push(`No https: ${t.slice(0, 80)}`);
      continue;
    }
    try {
      out.push(await uploadHttpsImageToRestaurantFolder(slug, t));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${t.slice(0, 60)}… → ${msg.slice(0, 120)}`);
    }
  }
  return { urls: out, errors };
}

export type UploadPlacePhotosResult = {
  hero: string | null;
  gallery: string[];
  log: string[];
  errors: string[];
  selectedUrls: string[];
};

/**
 * Descarga vía URL firmada de Place Photos y re-sube a Cloudinary (sin escribir en `public/`).
 */
export async function uploadPlacePhotoMediaUrlsToCloudinary(
  slug: string,
  photoResourceNames: string[],
  apiKey: string,
): Promise<UploadPlacePhotosResult> {
  const log: string[] = [];
  const errors: string[] = [];
  const selectedUrls: string[] = [];
  if (!isCloudinaryConfigured()) {
    return {
      hero: null,
      gallery: [],
      log,
      errors: ["Cloudinary no está configurado; no se pueden subir fotos de Places."],
      selectedUrls,
    };
  }

  const MAX_GALLERY = 10;
  const MAX_TOTAL = 1 + MAX_GALLERY;
  const names = photoResourceNames.filter(Boolean).slice(0, MAX_TOTAL);

  if (!names.length) {
    log.push("Places fotos: sin recursos de foto en el detalle.");
    return { hero: null, gallery: [], log, errors, selectedUrls };
  }

  configureCloudinary();
  let hero: string | null = null;
  const gallery: string[] = [];

  for (let i = 0; i < names.length; i += 1) {
    const mediaUrl = buildPlacePhotoMediaUrl(names[i]!, apiKey);
    selectedUrls.push(mediaUrl);
    try {
      const secure = await uploadHttpsImageToRestaurantFolder(slug, mediaUrl);
      if (i === 0) hero = secure;
      else if (gallery.length < MAX_GALLERY) gallery.push(secure);
      log.push(`Places→Cloudinary OK #${i + 1}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Foto ${i + 1}: ${msg.slice(0, 200)}`);
    }
  }

  if (hero) log.push(`Hero Cloudinary: OK; galería ${gallery.length}.`);
  else log.push("Places→Cloudinary: no se obtuvo hero.");

  return { hero, gallery, log, errors, selectedUrls };
}
