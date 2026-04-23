import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ImageDownloadScope } from "./types";

const ROOT = process.cwd();
const PUBLIC_RESTAURANTS_DIR = path.join(ROOT, "public", "restaurants");

function extensionFromContentType(contentType: string | null): "jpg" | "png" | "webp" | undefined {
  if (!contentType) return undefined;
  const v = contentType.toLowerCase();
  if (v.includes("image/jpeg") || v.includes("image/jpg")) return "jpg";
  if (v.includes("image/png")) return "png";
  if (v.includes("image/webp")) return "webp";
  return undefined;
}

/** Descarga bytes a una ruta absoluta (crea directorios). */
export async function downloadImage(
  url: string,
  destAbsolutePath: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { ok: false, error: "Protocolo no permitido." };
    }
    const res = await fetch(parsed.toString(), { redirect: "follow", signal: AbortSignal.timeout(30000) });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const contentType = res.headers.get("content-type");
    const ext = extensionFromContentType(contentType);
    if (contentType && !contentType.toLowerCase().startsWith("image/") && !ext) {
      return { ok: false, error: `No es imagen: ${contentType}` };
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength < 800) {
      return { ok: false, error: "Respuesta demasiado pequeña." };
    }
    await mkdir(path.dirname(destAbsolutePath), { recursive: true });
    await writeFile(destAbsolutePath, bytes);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg.slice(0, 200) };
  }
}

export type SaveRestaurantImageItem = {
  /** URL http(s) de la imagen. */
  url: string;
  /** Nombre de archivo dentro de `public/restaurants/{slug}/` (ej. hero.jpg). */
  filename: string;
};

/**
 * Descarga varias URLs a `public/restaurants/{slug}/{filename}`.
 * Devuelve rutas públicas tipo `/restaurants/{slug}/hero.jpg`.
 */
export async function saveRestaurantImages(
  slug: string,
  items: SaveRestaurantImageItem[],
  dryRun: boolean,
): Promise<{ paths: string[]; errors: string[] }> {
  const paths: string[] = [];
  const errors: string[] = [];
  const dir = path.join(PUBLIC_RESTAURANTS_DIR, slug);

  for (const item of items) {
    const safeName = path.basename(item.filename).replace(/[^a-zA-Z0-9._-]/g, "_");
    const abs = path.join(dir, safeName);
    const publicPath = `/restaurants/${slug}/${safeName}`;
    if (dryRun) {
      paths.push(publicPath);
      continue;
    }
    const r = await downloadImage(item.url, abs);
    if (r.ok) paths.push(publicPath);
    else errors.push(`${safeName}: ${r.error}`);
  }

  return { paths, errors };
}

/** URL de medios Place Photos (New). @see https://developers.google.com/maps/documentation/places/web-service/place-photos */
export function buildPlacePhotoMediaUrl(photoResourceName: string, apiKey: string, maxH = 1600, maxW = 1600): string {
  const base = "https://places.googleapis.com/v1";
  const rel = photoResourceName.replace(/^\/+/, "");
  return `${base}/${rel}/media?maxHeightPx=${maxH}&maxWidthPx=${maxW}&key=${encodeURIComponent(apiKey)}`;
}

export type PlacePhotosDownloadResult = {
  downloaded: boolean;
  heroPublicPath?: string;
  galleryPublicPaths: string[];
  log: string[];
  errors: string[];
  selectedUrls: string[];
};

/**
 * Descarga hasta 1 hero + hasta 10 gallery desde recursos de foto de Places API.
 */
export async function saveRestaurantImagesFromPlacePhotos(
  slug: string,
  photoResourceNames: string[],
  apiKey: string,
  dryRun: boolean,
  scope: ImageDownloadScope = "all",
): Promise<PlacePhotosDownloadResult> {
  const MAX_GALLERY = 10;
  const MAX_TOTAL_IMAGES = 1 + MAX_GALLERY; // hero + gallery
  const log: string[] = [];
  const errors: string[] = [];
  const selectedUrls: string[] = [];
  const names = photoResourceNames.filter(Boolean).slice(0, MAX_TOTAL_IMAGES);

  if (!names.length) {
    log.push("Places fotos: sin recursos de foto en el detalle.");
    return { downloaded: false, galleryPublicPaths: [], log, errors, selectedUrls };
  }

  const targets: SaveRestaurantImageItem[] = [];
  let galleryCount = 0;
  names.forEach((resourceName, i) => {
    const mediaUrl = buildPlacePhotoMediaUrl(resourceName, apiKey);
    selectedUrls.push(mediaUrl);
    if (scope === "hero") {
      if (i === 0) targets.push({ url: mediaUrl, filename: "hero.jpg" });
      return;
    }

    if (scope === "gallery") {
      if (i === 0) return; // evita tocar hero en modo parcial
      if (galleryCount < MAX_GALLERY) {
        galleryCount += 1;
        targets.push({ url: mediaUrl, filename: `gallery-${galleryCount}.jpg` });
      }
      return;
    }

    if (i === 0) {
      targets.push({ url: mediaUrl, filename: "hero.jpg" });
      return;
    }

    if (galleryCount < MAX_GALLERY) {
      galleryCount += 1;
      targets.push({ url: mediaUrl, filename: `gallery-${galleryCount}.jpg` });
      return;
    }
  });

  log.push(`Places fotos: scope=${scope}; intentando ${targets.length} descarga(s).`);

  if (dryRun) {
    const paths = targets.map((t) => `/restaurants/${slug}/${t.filename}`);
    return {
      downloaded: false,
      heroPublicPath: paths[0],
      galleryPublicPaths: paths.slice(1),
      log: [...log, "Dry-run: no se escribieron bytes."],
      errors,
      selectedUrls,
    };
  }

  const { paths, errors: err } = await saveRestaurantImages(slug, targets, false);
  errors.push(...err);

  const heroPublicPath = paths.find((p) => /\/hero\.jpg$/i.test(p));
  const galleryPublicPaths = paths.filter((p) => /\/gallery-\d+\.jpg$/i.test(p)).sort();

  const downloaded = Boolean(heroPublicPath);
  if (downloaded) log.push(`Places fotos: OK hero + ${galleryPublicPaths.length} galería.`);
  else log.push("Places fotos: no se pudo descargar el hero.");

  return {
    downloaded,
    heroPublicPath,
    galleryPublicPaths,
    log,
    errors,
    selectedUrls,
  };
}
