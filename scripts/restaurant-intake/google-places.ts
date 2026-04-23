import { mapGoogleTypesToCategory } from "./category-mapper";
import { buildPlacePhotoMediaUrl } from "./images";
import type { NameNormalization, SourceCandidates } from "./types";

const PLACES_V1 = "https://places.googleapis.com/v1";

/** Centro aproximado Siguatepeque (sesgo de búsqueda). */
const SIGUATEPEQUE_CENTER = { latitude: 14.597, longitude: -87.836 };

export type PlaceIntakeDetails = {
  resourceName: string;
  displayName: string;
  formattedAddress: string;
  location: { lat: number; lng: number };
  phone?: string;
  weekdayDescriptions: string[];
  types: string[];
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  /** Recurso `places/.../photos/...` para Place Photos (New). */
  photoResourceNames: string[];
};

const EN_TO_ES_DAY: Record<string, string> = {
  Monday: "Lunes",
  Tuesday: "Martes",
  Wednesday: "Miercoles",
  Thursday: "Jueves",
  Friday: "Viernes",
  Saturday: "Sabado",
  Sunday: "Domingo",
};

function parseWeekdayDescriptions(
  weekdayDescriptions: string[],
): Array<{ day: string; open: string; close: string }> {
  const out: Array<{ day: string; open: string; close: string }> = [];
  for (const raw of weekdayDescriptions) {
    const line = raw.trim();
    if (!line) continue;
    const m = /^([A-Za-z]+)\s*:\s*(.+)$/.exec(line);
    if (!m) continue;
    const dayEn = m[1];
    const rest = m[2].trim();
    const day = EN_TO_ES_DAY[dayEn] ?? dayEn;

    const parts = rest.split(/(?:\s*[–-]\s*)/);
    if (parts.length >= 2) {
      out.push({ day, open: parts[0].trim(), close: parts.slice(1).join(" - ").trim() });
      continue;
    }
    const special = /^(Closed|Cerrado|Open 24 hours|Abierto 24 horas)$/i.test(rest)
      ? rest
      : rest;
    out.push({ day, open: special, close: special });
  }
  return out;
}

export type PlacesIntakeReport = {
  used: boolean;
  stage: "skipped_no_key" | "skipped_error" | "details_ok" | "search_then_details" | "not_found";
  messages: string[];
  httpErrors: string[];
  placeIdOrName?: string;
};

type LocalizedText = { text?: string };

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la = (a.lat * Math.PI) / 180;
  const lb = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

/** Intenta obtener `places/{placeId}` desde URL canónica de Maps. */
export function extractPlaceResourceNameFromMapsUrl(urlStr: string): string | undefined {
  if (!urlStr?.trim()) return undefined;
  let full = urlStr.trim();
  if (!/^https?:/i.test(full)) full = `https://${full}`;
  let decoded: string;
  try {
    decoded = decodeURIComponent(full);
  } catch {
    decoded = full;
  }
  try {
    const u = new URL(decoded);
    const pid = u.searchParams.get("place_id");
    if (pid && /^ChIJ[A-Za-z0-9_-]{10,}$/.test(pid)) {
      return pid.startsWith("places/") ? pid : `places/${pid}`;
    }
  } catch {
    /* */
  }
  const chij = /\b(ChIJ[A-Za-z0-9_-]{10,})\b/.exec(decoded);
  if (chij?.[1]) return `places/${chij[1]}`;
  const m1s = /!1s(ChIJ[A-Za-z0-9_-]{10,})/.exec(decoded);
  if (m1s?.[1]) return `places/${m1s[1]}`;
  return undefined;
}

function pickLocalized(t?: LocalizedText): string | undefined {
  const s = t?.text?.trim();
  return s || undefined;
}

function parsePlaceDetailsJson(raw: unknown): PlaceIntakeDetails | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const name = typeof o.name === "string" ? o.name : undefined;
  if (!name?.startsWith("places/")) return undefined;

  const loc = o.location as Record<string, unknown> | undefined;
  const lat = typeof loc?.latitude === "number" ? loc.latitude : Number(loc?.latitude);
  const lng = typeof loc?.longitude === "number" ? loc.longitude : Number(loc?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;

  const displayName = pickLocalized(o.displayName as LocalizedText | undefined) ?? "";
  const formattedAddress = typeof o.formattedAddress === "string" ? o.formattedAddress.trim() : "";
  if (!formattedAddress && !displayName) return undefined;

  const intl = typeof o.internationalPhoneNumber === "string" ? o.internationalPhoneNumber.trim() : "";
  const national = typeof o.nationalPhoneNumber === "string" ? o.nationalPhoneNumber.trim() : "";
  const phone = intl || national || undefined;

  const roh = o.regularOpeningHours as Record<string, unknown> | undefined;
  const coh = o.currentOpeningHours as Record<string, unknown> | undefined;
  const wdRaw = (roh?.weekdayDescriptions ?? coh?.weekdayDescriptions) as unknown;
  const weekdayDescriptions = Array.isArray(wdRaw)
    ? wdRaw.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    : [];

  const types = Array.isArray(o.types) ? o.types.filter((x): x is string => typeof x === "string") : [];

  const rating = typeof o.rating === "number" && Number.isFinite(o.rating) ? o.rating : undefined;
  const userRatingCount =
    typeof o.userRatingCount === "number" && Number.isFinite(o.userRatingCount) ? o.userRatingCount : undefined;

  const googleMapsUri = typeof o.googleMapsUri === "string" ? o.googleMapsUri.trim() : undefined;

  const photosRaw = o.photos;
  const photoResourceNames: string[] = [];
  if (Array.isArray(photosRaw)) {
    for (const p of photosRaw) {
      if (p && typeof p === "object" && typeof (p as { name?: string }).name === "string") {
        const pn = (p as { name: string }).name.trim();
        if (pn.includes("/photos/")) photoResourceNames.push(pn);
      }
    }
  }

  return {
    resourceName: name,
    displayName: displayName || formattedAddress || "Sin nombre",
    formattedAddress: formattedAddress || "Por confirmar",
    location: { lat, lng },
    phone,
    weekdayDescriptions,
    types,
    rating,
    userRatingCount,
    googleMapsUri,
    photoResourceNames,
  };
}

async function placesPostJson(
  path: string,
  body: unknown,
  apiKey: string,
  fieldMask: string,
): Promise<{ ok: true; data: unknown } | { ok: false; status: number; text: string }> {
  const url = `${PLACES_V1}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000),
  });
  const text = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, text: text.slice(0, 800) };
  }
  try {
    return { ok: true, data: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, status: res.status, text: `JSON inválido: ${text.slice(0, 200)}` };
  }
}

async function placesGetJson(
  resourcePath: string,
  apiKey: string,
  fieldMask: string,
): Promise<{ ok: true; data: unknown } | { ok: false; status: number; text: string }> {
  const url = new URL(`${PLACES_V1}/${resourcePath}`);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldMask,
    },
    signal: AbortSignal.timeout(25000),
  });
  const text = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, text: text.slice(0, 800) };
  }
  try {
    return { ok: true, data: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, status: res.status, text: `JSON inválido: ${text.slice(0, 200)}` };
  }
}

const DETAILS_MASK =
  "id,name,displayName,formattedAddress,location,nationalPhoneNumber,internationalPhoneNumber," +
  "regularOpeningHours,currentOpeningHours,rating,userRatingCount,types,googleMapsUri,photos";

/**
 * Búsqueda de texto (Places API New). Devuelve candidatos mínimos.
 * @see https://developers.google.com/maps/documentation/places/web-service/text-search
 */
export async function searchPlace(
  textQuery: string,
  apiKey: string,
): Promise<{ places: Array<{ name?: string; id?: string; location?: { latitude?: number; longitude?: number } }> }> {
  const r = await placesPostJson(
    "/places:searchText",
    {
      textQuery,
      languageCode: "es",
      locationBias: {
        circle: { center: SIGUATEPEQUE_CENTER, radius: 35000 },
      },
    },
    apiKey,
    "places.name,places.id,places.location",
  );
  if (!r.ok) {
    throw new Error(`searchText HTTP ${r.status}: ${r.text}`);
  }
  const data = r.data as { places?: unknown[] };
  const places = Array.isArray(data.places) ? data.places : [];
  return {
    places: places
      .filter((p): p is Record<string, unknown> => Boolean(p && typeof p === "object"))
      .map((p) => {
        const loc = p.location as Record<string, unknown> | undefined;
        return {
          name: typeof p.name === "string" ? p.name : undefined,
          id: typeof p.id === "string" ? p.id : undefined,
          location:
            loc && (typeof loc.latitude === "number" || typeof loc.longitude === "number")
              ? {
                  latitude: typeof loc.latitude === "number" ? loc.latitude : Number(loc.latitude),
                  longitude: typeof loc.longitude === "number" ? loc.longitude : Number(loc.longitude),
                }
              : undefined,
        };
      }),
  };
}

/**
 * Detalle de lugar por recurso `places/{placeId}` (mismo id que la API clásica).
 * @see https://developers.google.com/maps/documentation/places/web-service/place-details
 */
/** URLs de medios para cada recurso `places/.../photos/...` (Place Photos API New). */
export function getPlacePhotos(photoResourceNames: string[], apiKey: string): string[] {
  return photoResourceNames.map((name) => buildPlacePhotoMediaUrl(name, apiKey));
}

export async function getPlaceDetails(placeResourceName: string, apiKey: string): Promise<PlaceIntakeDetails | undefined> {
  const path = placeResourceName.replace(/^\/+/, "");
  const r = await placesGetJson(path, apiKey, DETAILS_MASK);
  if (!r.ok) {
    throw new Error(`placeDetails HTTP ${r.status}: ${r.text}`);
  }
  return parsePlaceDetailsJson(r.data);
}

function pickBestSearchPlace(
  places: Array<{ name?: string; id?: string; location?: { latitude?: number; longitude?: number } }>,
  bias?: { lat: number; lng: number },
): string | undefined {
  if (!places.length) return undefined;
  if (!bias || !Number.isFinite(bias.lat) || !Number.isFinite(bias.lng)) {
    return places[0].name ?? places[0].id;
  }
  let best: { name: string; d: number } | undefined;
  for (const p of places) {
    const name = p.name ?? p.id;
    if (!name) continue;
    const lat = p.location?.latitude;
    const lng = p.location?.longitude;
    if (typeof lat !== "number" || typeof lng !== "number" || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      if (!best) best = { name, d: Number.POSITIVE_INFINITY };
      continue;
    }
    const d = haversineKm(bias, { lat, lng });
    if (!best || d < best.d) best = { name, d };
  }
  if (best && best.d <= 8) return best.name;
  return places[0].name ?? places[0].id;
}

export type RunPlacesIntakeArgs = {
  apiKey: string;
  nameNorm: NameNormalization;
  mapsCanonicalUrl?: string;
  mapsCoords?: { lat: number; lng: number };
};

export type RunPlacesIntakeResult = {
  details?: PlaceIntakeDetails;
  report: PlacesIntakeReport;
};

/**
 * Resuelve el lugar: detalle directo por URL Maps si hay place_id/ChIJ, si no text search + detalle.
 */
export async function runPlacesIntake(args: RunPlacesIntakeArgs): Promise<RunPlacesIntakeResult> {
  const report: PlacesIntakeReport = {
    used: true,
    stage: "skipped_error",
    messages: [],
    httpErrors: [],
  };

  const { apiKey, nameNorm, mapsCanonicalUrl, mapsCoords } = args;

  try {
    const fromUrl = mapsCanonicalUrl ? extractPlaceResourceNameFromMapsUrl(mapsCanonicalUrl) : undefined;
    if (fromUrl) {
      report.messages.push(`Places: place_id detectado en URL Maps → ${fromUrl}`);
      const details = await getPlaceDetails(fromUrl, apiKey);
      if (details) {
        report.stage = "details_ok";
        report.placeIdOrName = details.resourceName;
        report.messages.push(`Places: detalle OK (${details.displayName}).`);
        return { details, report };
      }
      report.messages.push("Places: detalle vacío tras id en URL; se intentará búsqueda por texto.");
    }

    const textQuery = `${nameNorm.displayName} Siguatepeque Honduras`;
    report.messages.push(`Places: text search → "${textQuery}"`);
    const search = await searchPlace(textQuery, apiKey);
    const resource = pickBestSearchPlace(search.places, mapsCoords);
    if (!resource) {
      report.stage = "not_found";
      report.messages.push("Places: text search sin resultados.");
      return { report };
    }
    report.messages.push(`Places: candidato elegido → ${resource}`);
    const details = await getPlaceDetails(resource, apiKey);
    if (!details) {
      report.stage = "not_found";
      report.messages.push("Places: detalle vacío tras búsqueda.");
      return { report };
    }
    report.stage = "search_then_details";
    report.placeIdOrName = details.resourceName;
    report.messages.push(`Places: detalle OK (${details.displayName}).`);
    return { details, report };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    report.stage = "skipped_error";
    report.httpErrors.push(msg);
    report.messages.push(`Places: error (no bloquea intake): ${msg.slice(0, 400)}`);
    return { report };
  }
}

/** Prioriza datos de Places sobre scraping/HTML y Nominatim cuando hay detalle. */
export function mergePlacesIntoSourceCandidates(
  candidates: SourceCandidates,
  details: PlaceIntakeDetails | undefined,
  opts: { categoryProvided?: boolean },
): void {
  if (!details) return;

  candidates.officialPlacesName = details.displayName;
  candidates.preferredName = details.displayName;
  candidates.preferredNameSource = "google_places";
  candidates.googlePlacesTypes = details.types;
  candidates.placesResourceName = details.resourceName;
  if (typeof details.rating === "number" && Number.isFinite(details.rating)) {
    candidates.ratingsAverage = details.rating;
  }
  if (typeof details.userRatingCount === "number" && Number.isFinite(details.userRatingCount)) {
    candidates.ratingsReviewsCount = details.userRatingCount;
  }
  candidates.placesPhotoResources = details.photoResourceNames;

  candidates.address = details.formattedAddress;
  candidates.coordinates = details.location;
  candidates.coordinatesSource = "google_places";

  if (details.phone?.trim()) {
    candidates.phone = details.phone.trim();
  }

  if (details.weekdayDescriptions.length) {
    candidates.hours = details.weekdayDescriptions.join(" · ");
    const parsed = parseWeekdayDescriptions(details.weekdayDescriptions);
    if (parsed.length) {
      candidates.hoursStructured = parsed;
    }
  }

  if (details.googleMapsUri && /^https?:\/\//i.test(details.googleMapsUri)) {
    candidates.mapsUrl = details.googleMapsUri;
    candidates.mapsSourcePriority = "google_places";
    candidates.mapsConfidence = "alta";
    const prev = candidates.mapsChoiceReason?.trim();
    candidates.mapsChoiceReason = [prev, "Enlace canónico desde Google Places (googleMapsUri)."]
      .filter(Boolean)
      .join(" ");
  }

  if (!opts.categoryProvided && details.types.length) {
    const mapped = mapGoogleTypesToCategory(details.types);
    if (mapped) {
      candidates.inferredCategory = mapped.category;
      candidates.inferredCategoryReason = mapped.reason;
    }
  }

  if (!candidates.references.includes("Google Places API (New)")) {
    candidates.references.push("Google Places API (New)");
  }
  candidates.sourceNotes.push(`Google Places resource: ${details.resourceName}`);
  candidates.provenance.maps.dataFrom.push("google_places_place_details");
}
