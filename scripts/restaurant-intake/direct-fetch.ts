import { DUCKDUCKGO_FETCH_HEADERS, maybeExpandShortMapsUrl } from "./link-extraction";
import { isGoogleMapsLink, isInstagramProfileUrl } from "./scoring";
import { extractPhonesFromHtml } from "./contact-extract";

/** Navegación tipo documento: reduce respuestas genéricas frente a solo Accept básico. */
const INSTAGRAM_DOCUMENT_HEADERS: Record<string, string> = {
  ...DUCKDUCKGO_FETCH_HEADERS,
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type DirectMapsHints = {
  canonicalUrl?: string;
  coords?: { lat: number; lng: number };
  coordsSource?: "maps_url_3d4d" | "maps_url_at" | "maps_query_ll" | "maps_html_heuristic";
  placeTitle?: string;
  phonesFromHtml?: string[];
  ogImage?: string;
  imageCandidates?: string[];
  fieldsFrom: string[];
  notes: string[];
};

export type DirectInstagramHints = {
  canonicalUrl?: string;
  handle?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  imageCandidates?: string[];
  externalWebsite?: string;
  suggestedDisplayName?: string;
  fieldsFrom: string[];
  notes: string[];
};

const META_CONTENT = /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i;
const META_DESC = /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i;
const META_IMAGE = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i;
const META_IMAGE_ALL = /<meta[^>]+property=["']og:image(?::\w+)?["'][^>]+content=["']([^"']+)["']/gi;
const META_CONTENT_REVERSE = /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["']/i;

function clip(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

/**
 * Coordenadas en enlaces de Google Maps.
 * Prioridad: fragmentos !3d / !4d del **marcador del lugar** (más fiable) antes que @lat,lng
 * (suele ser solo el centro de cámara / vista previa).
 */
export function parseLatLngFromGoogleMapsUrl(
  urlStr: string,
): {
  lat: number;
  lng: number;
  source: "maps_url_3d4d" | "maps_url_at" | "maps_query_ll" | "maps_html_heuristic";
} | undefined {
  const d34 = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/i.exec(urlStr);
  if (d34) {
    const lat = Number(d34[1]);
    const lng = Number(d34[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng, source: "maps_url_3d4d" };
    }
  }
  const d43 = /!4d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/i.exec(urlStr);
  if (d43) {
    const lng = Number(d43[1]);
    const lat = Number(d43[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng, source: "maps_url_3d4d" };
    }
  }
  const at = /@(-?\d+\.\d+),(-?\d+\.\d+)/.exec(urlStr);
  if (at) {
    const lat = Number(at[1]);
    const lng = Number(at[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng, source: "maps_url_at" };
  }
  try {
    const u = new URL(urlStr);
    const ll = u.searchParams.get("ll") ?? u.searchParams.get("query");
    if (ll && /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(ll.trim())) {
      const [a, b] = ll.split(",").map((x) => Number(x.trim()));
      if (Number.isFinite(a) && Number.isFinite(b)) return { lat: a, lng: b, source: "maps_query_ll" };
    }
  } catch {
    /* */
  }
  return undefined;
}

/** Nombre legible a partir del segmento `/place/.../` de un enlace Maps. */
export function guessNameFromGoogleMapsUrlPath(urlStr: string): string | undefined {
  if (!urlStr.trim()) return undefined;
  try {
    const u = new URL(urlStr.trim().startsWith("http") ? urlStr.trim() : `https://${urlStr.trim()}`);
    const m = u.pathname.match(/\/place\/([^/]+)/);
    if (!m?.[1]) return undefined;
    let raw = m[1].replace(/\+/g, " ");
    try {
      raw = decodeURIComponent(raw);
    } catch {
      /* */
    }
    const t = raw.replace(/\+/g, " ").replace(/\s+/g, " ").trim();
    if (!t || /^[0-9.,\s-]+$/.test(t)) return undefined;
    return clip(t, 100);
  } catch {
    return undefined;
  }
}

function parseOgTitle(html: string): string | undefined {
  const m = META_CONTENT.exec(html) ?? META_CONTENT_REVERSE.exec(html);
  return m?.[1] ? decodeHtmlEntities(m[1].trim()) : undefined;
}

function parseOgDescription(html: string): string | undefined {
  const m = META_DESC.exec(html);
  return m?.[1] ? decodeHtmlEntities(m[1].trim()) : undefined;
}

function parseOgImage(html: string): string | undefined {
  const m = META_IMAGE.exec(html);
  if (!m?.[1]) return undefined;
  const raw = decodeHtmlEntities(m[1].trim());
  try {
    const u = new URL(raw);
    if (!["http:", "https:"].includes(u.protocol)) return undefined;
    return u.toString();
  } catch {
    return undefined;
  }
}

function firstHttpUrl(text: string): string | undefined {
  const m = /https?:\/\/[^\s"'>)]+/i.exec(text);
  if (!m?.[0]) return undefined;
  try {
    return new URL(m[0]).toString();
  } catch {
    return undefined;
  }
}

function normalizeHttpUrl(raw: string): string | undefined {
  try {
    const u = new URL(decodeHtmlEntities(raw.trim()));
    if (!["http:", "https:"].includes(u.protocol)) return undefined;
    return u.toString();
  } catch {
    return undefined;
  }
}

function extractImageCandidates(html: string, max = 10): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (raw: string) => {
    const u = normalizeHttpUrl(raw);
    if (!u || seen.has(u)) return;
    seen.add(u);
    out.push(u);
  };
  let m: RegExpExecArray | null;
  const ogAll = new RegExp(META_IMAGE_ALL);
  while ((m = ogAll.exec(html)) !== null) push(m[1]);
  const imgSrc = /<img[^>]+src=["']([^"']+)["']/gi;
  while ((m = imgSrc.exec(html)) !== null) push(m[1]);
  return out.slice(0, max);
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

/** Intenta obtener un nombre legible desde el título og de Instagram. */
export function suggestedNameFromInstagramOgTitle(ogTitle: string): string | undefined {
  const t = ogTitle.trim();
  const m = /^(.+?)\s*\(@[^)]+\)/.exec(t);
  if (m?.[1]) return clip(m[1], 120);
  const parts = t.split(/\s*•\s*/);
  if (parts[0] && !/^instagram$/i.test(parts[0].trim())) return clip(parts[0].trim(), 120);
  return undefined;
}

/** Quita query/fragment y fuerza host instagram.com. */
export function canonicalizeInstagramProfileUrl(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  try {
    const u = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (!/^www\.instagram\.com$/i.test(u.hostname) && !/^instagram\.com$/i.test(u.hostname)) {
      return undefined;
    }
    if (!isInstagramProfileUrl(u.toString())) return undefined;
    const seg = u.pathname.split("/").filter(Boolean)[0];
    if (!seg) return undefined;
    return `https://www.instagram.com/${seg}/`;
  } catch {
    return undefined;
  }
}

export async function fetchDirectInstagramHints(rawUrl: string): Promise<DirectInstagramHints> {
  const fieldsFrom: string[] = [];
  const notes: string[] = [];
  const canonicalUrl = canonicalizeInstagramProfileUrl(rawUrl);
  if (!canonicalUrl) {
    notes.push("URL de Instagram no válida o no es un perfil (p/reel/stories/…).");
    return { fieldsFrom, notes };
  }
  fieldsFrom.push("instagram_url_cli");

  let handle: string | undefined;
  try {
    handle = new URL(canonicalUrl).pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  } catch {
    handle = undefined;
  }

  try {
    let html = "";
    for (let attempt = 0; attempt < 4; attempt++) {
      if (attempt > 0) {
        const backoff = 2000 * attempt;
        notes.push(`Esperando ${backoff}ms antes de reintentar Instagram…`);
        await sleep(backoff);
      }
      const res = await fetch(canonicalUrl, {
        headers: INSTAGRAM_DOCUMENT_HEADERS,
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });
      if (res.status === 429) {
        notes.push(`HTTP 429 (demasiadas peticiones a Instagram).`);
        continue;
      }
      if (!res.ok) {
        notes.push(`HTTP ${res.status} al obtener perfil.`);
        return { canonicalUrl, handle, fieldsFrom, notes };
      }
      html = await res.text();
      break;
    }
    if (!html) {
      notes.push("No se obtuvo HTML del perfil tras reintentos (p. ej. 429 repetido).");
      return { canonicalUrl, handle, fieldsFrom, notes };
    }
    const ogTitle = parseOgTitle(html);
    const ogDescription = parseOgDescription(html);
    const ogImage = parseOgImage(html);
    const imageCandidates = extractImageCandidates(html, 10);
    const externalWebsite = ogDescription ? firstHttpUrl(ogDescription) : undefined;
    if (ogTitle) fieldsFrom.push("instagram_html_og:title");
    if (ogDescription) fieldsFrom.push("instagram_html_og:description");
    if (ogImage) fieldsFrom.push("instagram_html_og:image");
    if (imageCandidates.length) fieldsFrom.push("instagram_html_image_candidates");
    if (externalWebsite) fieldsFrom.push("instagram_og_description_link");
    const suggested = ogTitle ? suggestedNameFromInstagramOgTitle(ogTitle) : undefined;
    const looksLikeLoginWall =
      (!ogDescription || ogDescription.length < 3) &&
      (!ogTitle || /^instagram$/i.test(ogTitle.trim()) || /^instagram\s*\(/i.test(ogTitle.trim()));
    if (!ogTitle && !ogDescription) {
      notes.push("No se encontró og:title ni og:description (login wall o markup distinto).");
    } else if (looksLikeLoginWall) {
      notes.push(
        "Instagram respondió sin bio pública en metadatos (típico: muro de inicio de sesión). El teléfono en la bio no se puede leer sin sesión.",
      );
    }
    return {
      canonicalUrl,
      handle,
      ogTitle,
      ogDescription,
      ogImage,
      imageCandidates,
      externalWebsite,
      suggestedDisplayName: suggested,
      fieldsFrom,
      notes,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    notes.push(`Error de red: ${msg}`);
    return { canonicalUrl, handle, fieldsFrom, notes };
  }
}

export async function fetchDirectMapsHints(rawUrl: string): Promise<DirectMapsHints> {
  const fieldsFrom: string[] = [];
  const notes: string[] = [];
  const expanded = await maybeExpandShortMapsUrl(rawUrl.trim());
  if (!isGoogleMapsLink(expanded)) {
    notes.push("URL no reconocida como Google Maps.");
    return { fieldsFrom, notes };
  }
  fieldsFrom.push("maps_url_cli");

  let canonicalUrl = expanded;
  let coords = parseLatLngFromGoogleMapsUrl(expanded);

  if (coords) {
    fieldsFrom.push("maps_url_lat_lng");
  }

  let placeTitle: string | undefined;
  let phonesFromHtml: string[] | undefined;
  let ogImage: string | undefined;
  let imageCandidates: string[] | undefined;
  try {
    const res = await fetch(canonicalUrl, {
      headers: DUCKDUCKGO_FETCH_HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    const finalUrl = res.url || canonicalUrl;
    if (finalUrl !== canonicalUrl) {
      canonicalUrl = finalUrl;
      fieldsFrom.push("maps_http_final_url");
    }
    const refined = parseLatLngFromGoogleMapsUrl(finalUrl) ?? parseLatLngFromGoogleMapsUrl(expanded);
    if (refined) {
      coords = refined;
      if (!fieldsFrom.includes("maps_url_lat_lng")) fieldsFrom.push("maps_url_lat_lng");
    }
    if (!res.ok) {
      notes.push(`HTTP ${res.status} al obtener página de Maps.`);
      return {
        canonicalUrl,
        coords: coords ? { lat: coords.lat, lng: coords.lng } : undefined,
        coordsSource: coords?.source,
        placeTitle,
        phonesFromHtml,
        ogImage,
        imageCandidates,
        fieldsFrom,
        notes,
      };
    }
    const html = await res.text();
    phonesFromHtml = extractPhonesFromHtml(html);
    if (phonesFromHtml.length) {
      fieldsFrom.push("maps_html_tel_candidates");
    }
    ogImage = parseOgImage(html);
    imageCandidates = extractImageCandidates(html, 8);
    if (ogImage) fieldsFrom.push("maps_html_og:image");
    if (imageCandidates.length) fieldsFrom.push("maps_html_image_candidates");
    const og = parseOgTitle(html);
    if (og) {
      const stripped = og.replace(/\s*-\s*Google\s+Maps\s*$/i, "").trim();
      if (stripped && !/^Google\s+Maps$/i.test(stripped)) {
        fieldsFrom.push("maps_html_og:title");
        placeTitle = stripped;
      }
    }
    if (!placeTitle) {
      const guessed = guessNameFromGoogleMapsUrlPath(canonicalUrl);
      if (guessed) {
        placeTitle = guessed;
        fieldsFrom.push("maps_url_path_place_guess");
      }
    }
    if (!coords) {
      const m = /"([0-9]{1,2}\.[0-9]{4,})","([\-0-9]{1,3}\.[0-9]{4,})"/.exec(html);
      if (m) {
        const lat = Number(m[1]);
        const lng = Number(m[2]);
        if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
          coords = { lat, lng, source: "maps_html_heuristic" };
          fieldsFrom.push("maps_html_embedded_pair_heuristic");
        }
      }
    }
    if (!coords) notes.push("No se pudieron leer coordenadas desde la URL ni el HTML.");
    if (!placeTitle) notes.push("No se obtuvo título del lugar desde og:title.");
    return {
      canonicalUrl,
      coords: coords ? { lat: coords.lat, lng: coords.lng } : undefined,
      coordsSource: coords?.source ?? (fieldsFrom.includes("maps_html_embedded_pair_heuristic") ? "maps_html_heuristic" : undefined),
      placeTitle,
      phonesFromHtml,
      ogImage,
      imageCandidates,
      fieldsFrom,
      notes,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    notes.push(`Error de red o timeout: ${msg}`);
  }

  return {
    canonicalUrl,
    coords: coords ? { lat: coords.lat, lng: coords.lng } : undefined,
    coordsSource: coords?.source,
    placeTitle,
    phonesFromHtml,
    ogImage,
    imageCandidates,
    fieldsFrom,
    notes,
  };
}
