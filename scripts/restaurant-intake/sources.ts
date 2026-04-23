import type {
  CandidateDebug,
  ChannelProvenance,
  LinkPipelineReport,
  MapsConfidence,
  MapsSourcePriority,
  NameNormalization,
  SourceCandidates,
} from "./types";
import type { DirectInstagramHints, DirectMapsHints } from "./direct-fetch";
import { fetchDirectInstagramHints, fetchDirectMapsHints } from "./direct-fetch";
import {
  duckDuckGoHtmlSearch,
  maybeExpandShortMapsUrl,
  summarizeChannel,
} from "./link-extraction";
import {
  INSTAGRAM_SCORE_THRESHOLD,
  MAPS_SCORE_THRESHOLD,
  accumulateScored,
  buildMatchContext,
  isGoogleMapsLink,
  reasonForPick,
  scoreInstagramUrl,
  scoreMapsUrl,
  topScoredCandidates,
} from "./scoring";
import {
  extractPhonesFromPlainText,
  extractWhatsappFromText,
  normalizeHondurasPhone,
  pickFirstPhone,
  summarizeForDraft,
} from "./contact-extract";

export type GatherSourceOptions = {
  directMapsUrl?: string;
  directInstagramUrl?: string;
  directHints?: {
    maps?: DirectMapsHints;
    instagram?: DirectInstagramHints;
  };
};

async function safeDuckSearch(query: string): Promise<{ extraction: CandidateDebug["extraction"]; links: string[] }> {
  try {
    const { extraction, normalizedLinks } = await duckDuckGoHtmlSearch(query);
    return { extraction, links: normalizedLinks };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      links: [],
      extraction: {
        requestUrl: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
        status: 0,
        htmlLength: 0,
        signals: ["fetch_threw"],
        htmlPreview: msg.slice(0, 800),
        rawFromAnchors: [],
        rawFromUddgFallback: [],
        mergedRaw: [],
        normalizedUrls: [],
        discarded: [{ raw: "(fetch)", reason: msg.slice(0, 240) }],
        domainCounts: {},
      },
    };
  }
}

function humanMapsExtractionBlockReason(stage: LinkPipelineReport["maps"]["stage"]): string {
  switch (stage) {
    case "bot_wall":
      return "DuckDuckGo devolvió bot_wall / sin SERP (no se usa como única fuente de Maps).";
    case "no_raw_hrefs":
      return "DuckDuckGo sin hrefs parseables.";
    case "no_target_domains":
      return "DuckDuckGo sin URLs de Maps en resultados.";
    default:
      return "";
  }
}

function humanInstagramExtractionBlockReason(stage: LinkPipelineReport["instagram"]["stage"]): string {
  switch (stage) {
    case "bot_wall":
      return "Falló extracción de enlaces: DuckDuckGo devolvió página de desafío/bot (sin SERP parseable).";
    case "no_raw_hrefs":
      return "Falló extracción de enlaces: no se capturaron hrefs brutos del HTML (SERP vacío o markup distinto al esperado).";
    case "no_target_domains":
      return "Extracción de enlaces OK, pero ningún resultado normalizado es instagram.com; scoring omitido.";
    default:
      return "";
  }
}

async function searchNominatim(name: string): Promise<Partial<SourceCandidates>> {
  const query = `${name}, Siguatepeque, Honduras`;
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&extratags=1&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "restaurant-intake-bot/1.0 (+local-script)",
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Nominatim respondio ${res.status}`);
  }
  const data = (await res.json()) as Array<{
    display_name?: string;
    lat?: string;
    lon?: string;
    extratags?: Record<string, string>;
  }>;
  if (!data.length) {
    return {};
  }

  const first = data[0];
  const lat = first.lat ? Number(first.lat) : NaN;
  const lng = first.lon ? Number(first.lon) : NaN;
  const phone = first.extratags?.phone;
  const hours = first.extratags?.opening_hours;

  return {
    address: first.display_name,
    coordinates: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined,
    phone: phone?.trim(),
    hours: hours?.trim(),
  };
}

async function reverseNominatim(lat: number, lng: number): Promise<Partial<SourceCandidates>> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}&format=jsonv2&extratags=1`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "restaurant-intake-bot/1.0 (+local-script)",
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    return {};
  }
  const data = (await res.json()) as {
    display_name?: string;
    extratags?: Record<string, string>;
  };
  const phone = data.extratags?.phone;
  const hours = data.extratags?.opening_hours;
  return {
    address: data.display_name?.trim(),
    phone: phone?.trim(),
    hours: hours?.trim(),
  };
}

/** Búsqueda genérica en Google Maps (sin depender de DuckDuckGo). */
export function buildFallbackMapsSearchUrl(displayName: string): string {
  const q = `${displayName.trim()} Siguatepeque Honduras`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function mapsUrlFromNominatimCoords(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(String(lat))},${encodeURIComponent(String(lng))}`;
}

function extraMapsQueries(nameNorm: NameNormalization): string[] {
  const q: string[] = [
    `"${nameNorm.displayName}" Siguatepeque site:google.com/maps`,
    `${nameNorm.searchName} Siguatepeque site:google.com/maps`,
  ];
  const amp = nameNorm.displayName.replace(/\bCoffee Bistro\b/i, "Coffee & Bistro");
  if (amp !== nameNorm.displayName) {
    q.push(`"${amp}" Siguatepeque site:google.com/maps`);
  }
  return q;
}

function extraInstagramQueries(nameNorm: NameNormalization): string[] {
  return [
    `${nameNorm.searchName} Siguatepeque site:instagram.com`,
    `"${nameNorm.displayName}" site:instagram.com`,
  ];
}

const SCORE_POOL_LIMIT = 18;

function sanitizeInstagramDescription(raw: string | undefined): string {
  if (!raw) return "";
  const t = raw
    .replace(/\b\d+(?:[.,]\d+)?\s*[kKmM]?\s*seguidores\b/gi, "")
    .replace(/\b\d+\s*seguidos\b/gi, "")
    .replace(/\b\d+\s*publicaciones\b/gi, "")
    .replace(/\s*-\s*Ver fotos y videos de Instagram de\s*/gi, " ")
    .replace(/\(@[a-z0-9._]+\)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length < 12) return "";
  return t;
}

function dedupeUrls(urls: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of urls) {
    const u = raw?.trim();
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

function pushImageOrigin(
  bucket: Array<{ url: string; source: string }>,
  seen: Set<string>,
  url: string | undefined,
  source: string,
): void {
  if (!url?.trim()) return;
  const u = url.trim();
  if (seen.has(`${u}::${source}`)) return;
  seen.add(`${u}::${source}`);
  bucket.push({ url: u, source });
}

function directCliExtraction(url: string): CandidateDebug["extraction"] {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    /* */
  }
  return {
    requestUrl: url,
    status: 200,
    htmlLength: 0,
    signals: ["cli_direct_skip_ddg"],
    htmlPreview: "Entrada CLI: no se consultó DuckDuckGo para esta URL.",
    rawFromAnchors: [url],
    rawFromUddgFallback: [],
    mergedRaw: [url],
    normalizedUrls: [url],
    discarded: [],
    domainCounts: host ? { [host]: 1 } : {},
  };
}

function syntheticMapsExtraction(url: string, signal: string, preview: string): CandidateDebug["extraction"] {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    /* */
  }
  return {
    requestUrl: url,
    status: 200,
    htmlLength: 0,
    signals: [signal],
    htmlPreview: preview,
    rawFromAnchors: [],
    rawFromUddgFallback: [],
    mergedRaw: [url],
    normalizedUrls: [url],
    discarded: [],
    domainCounts: host ? { [host]: 1 } : {},
  };
}

async function buildExpandedMapsUrls(urls: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const unique = [...new Set(urls)].filter((u) => isGoogleMapsLink(u));
  for (const u of unique) {
    map.set(u, await maybeExpandShortMapsUrl(u));
  }
  return map;
}

function cliMapsConfidence(mapsH: DirectMapsHints): MapsConfidence {
  if (mapsH.coords) return "alta";
  if (mapsH.canonicalUrl) return "media";
  return "baja";
}

export async function gatherSourceCandidates(
  nameNorm: NameNormalization,
  opts: GatherSourceOptions = {},
): Promise<SourceCandidates> {
  const references: string[] = [];
  const sourceNotes: string[] = [];
  const provenance: { maps: ChannelProvenance; instagram: ChannelProvenance } = {
    maps: { origin: "none", dataFrom: [] },
    instagram: { origin: "none", dataFrom: [] },
  };

  const mapsCli = opts.directMapsUrl?.trim();
  const instaCli = opts.directInstagramUrl?.trim();
  const intakeMode = mapsCli || instaCli ? ("direct_cli" as const) : ("search_only" as const);
  const fullDirectMode = Boolean(mapsCli && instaCli);

  let mapsH: DirectMapsHints | undefined = opts.directHints?.maps;
  let instaH: DirectInstagramHints | undefined = opts.directHints?.instagram;
  if (mapsCli && !mapsH) mapsH = await fetchDirectMapsHints(mapsCli);
  if (instaCli && !instaH) instaH = await fetchDirectInstagramHints(instaCli);

  if (mapsCli && !mapsH?.canonicalUrl) {
    throw new Error(`--maps no válido: ${(mapsH?.notes ?? []).join("; ") || "sin URL canónica"}`);
  }
  if (instaCli && !instaH?.canonicalUrl) {
    throw new Error(`--instagram no válido: ${(instaH?.notes ?? []).join("; ") || "sin URL canónica"}`);
  }

  if (mapsH?.notes?.length) sourceNotes.push(`Maps (CLI): ${mapsH.notes.join("; ")}`);
  if (instaH?.notes?.length) sourceNotes.push(`Instagram (CLI): ${instaH.notes.join("; ")}`);
  if (mapsH?.placeTitle && !mapsH.coords) {
    sourceNotes.push(`Maps: título público (referencia): ${mapsH.placeTitle}`);
  }
  if (instaH?.ogDescription) {
    sourceNotes.push(`Instagram: descripción og (referencia): ${instaH.ogDescription.slice(0, 160)}${instaH.ogDescription.length > 160 ? "…" : ""}`);
  }

  let earlyNom: Partial<SourceCandidates> = {};
  if (!fullDirectMode) {
    const nomEarly = await Promise.allSettled([searchNominatim(nameNorm.searchName)]);
    if (nomEarly[0].status === "fulfilled") {
      const v = nomEarly[0].value;
      if (v.address || v.coordinates || v.phone || v.hours) {
        earlyNom = v;
        references.push("https://nominatim.openstreetmap.org/search");
        provenance.maps.dataFrom.push("nominatim_forward_early");
      }
    }
  }

  const mapsFromCli = Boolean(mapsCli && mapsH?.canonicalUrl);
  const skipDdgMapsBecauseNominatimCoords =
    !mapsFromCli && Boolean(earlyNom.coordinates);

  const mapsQueries: CandidateDebug[] = [];
  const instagramQueries: CandidateDebug[] = [];

  if (mapsFromCli && mapsH?.canonicalUrl) {
    provenance.maps.origin = "cli";
    provenance.maps.dataFrom.push(...mapsH.fieldsFrom);
    mapsQueries.push({
      query: "--maps (entrada directa; sin búsqueda DuckDuckGo)",
      links: [mapsH.canonicalUrl],
      extraction: directCliExtraction(mapsH.canonicalUrl),
    });
  } else if (skipDdgMapsBecauseNominatimCoords && earlyNom.coordinates) {
    const nu = mapsUrlFromNominatimCoords(earlyNom.coordinates.lat, earlyNom.coordinates.lng);
    provenance.maps.origin = "nominatim";
    provenance.maps.dataFrom.push("nominatim_forward_maps_link", "skip_ddg_maps");
    mapsQueries.push({
      query: "Nominatim → Google Maps por coordenadas (DuckDuckGo omitido para Maps)",
      links: [nu],
      extraction: syntheticMapsExtraction(
        nu,
        "nominatim_maps_skip_ddg",
        "Coordenadas del forward geocode Nominatim; no se consultó DuckDuckGo para Maps.",
      ),
    });
    sourceNotes.push(
      "Maps: enlace generado desde coordenadas Nominatim; búsqueda DuckDuckGo de Maps omitida (prioridad Nominatim).",
    );
  } else {
    for (const variant of nameNorm.searchVariants) {
      const mapsQuery = `${variant} Google Maps`;
      const mapsResult = await safeDuckSearch(mapsQuery);
      mapsQueries.push({ query: mapsQuery, links: mapsResult.links, extraction: mapsResult.extraction });
    }
    for (const mapsQuery of extraMapsQueries(nameNorm)) {
      const r = await safeDuckSearch(mapsQuery);
      mapsQueries.push({ query: mapsQuery, links: r.links, extraction: r.extraction });
    }
    provenance.maps.dataFrom.push("duckduckgo_maps_attempted");
  }

  if (instaCli && instaH?.canonicalUrl) {
    provenance.instagram.origin = "cli";
    provenance.instagram.dataFrom.push(...instaH.fieldsFrom);
    instagramQueries.push({
      query: "--instagram (entrada directa; sin búsqueda DuckDuckGo)",
      links: [instaH.canonicalUrl],
      extraction: directCliExtraction(instaH.canonicalUrl),
    });
  } else {
    for (const variant of nameNorm.searchVariants) {
      const instaQuery = `${variant} Instagram`;
      const instaResult = await safeDuckSearch(instaQuery);
      instagramQueries.push({ query: instaQuery, links: instaResult.links, extraction: instaResult.extraction });
    }
    for (const instaQuery of extraInstagramQueries(nameNorm)) {
      const r = await safeDuckSearch(instaQuery);
      instagramQueries.push({ query: instaQuery, links: r.links, extraction: r.extraction });
    }
  }

  const mapsExtractions = mapsQueries.map((q) => q.extraction);
  const instaExtractions = instagramQueries.map((q) => q.extraction);
  const mapsChannel = summarizeChannel(mapsExtractions, "maps");
  const instaChannel = summarizeChannel(instaExtractions, "instagram");

  const matchCtx = buildMatchContext(nameNorm);

  let mapsScoredRaw: { url: string; query: string; score: number; breakdown: string[] }[] = [];
  let instagramScoredRaw: { url: string; query: string; score: number; breakdown: string[] }[] = [];

  const instaFromCli = Boolean(instaCli && instaH?.canonicalUrl);

  if (!mapsFromCli && !skipDdgMapsBecauseNominatimCoords && mapsChannel.status === "ok") {
    const allMapsLinks = mapsQueries.flatMap((q) => q.links).filter((u) => isGoogleMapsLink(u));
    const expanded = await buildExpandedMapsUrls(allMapsLinks);

    for (const entry of mapsQueries) {
      for (const link of entry.links) {
        if (!isGoogleMapsLink(link)) continue;
        const finalUrl = expanded.get(link) ?? link;
        const { score, breakdown } = scoreMapsUrl(finalUrl, matchCtx, entry.query);
        mapsScoredRaw.push({ url: finalUrl, query: entry.query, score, breakdown });
      }
    }
  }

  if (!instaFromCli && instaChannel.status === "ok") {
    for (const entry of instagramQueries) {
      for (const link of entry.links) {
        if (!/instagram\.com/i.test(link)) continue;
        const { score, breakdown } = scoreInstagramUrl(link, matchCtx, entry.query);
        instagramScoredRaw.push({ url: link, query: entry.query, score, breakdown });
      }
    }
  }

  const mapsRanked = accumulateScored(mapsScoredRaw);
  const instagramRanked = accumulateScored(instagramScoredRaw);

  const mapsScoredTop = topScoredCandidates(mapsRanked, 3);
  const instagramScoredTop = topScoredCandidates(instagramRanked, 3);
  const bestMaps = mapsRanked[0];
  const bestInstagram = instagramRanked[0];

  const mapsScoredPool = mapsRanked.slice(0, SCORE_POOL_LIMIT).map((s) => ({
    url: s.url,
    score: s.score,
    query: s.query,
    breakdown: s.breakdown,
  }));
  const instagramScoredPool = instagramRanked.slice(0, SCORE_POOL_LIMIT).map((s) => ({
    url: s.url,
    score: s.score,
    query: s.query,
    breakdown: s.breakdown,
  }));

  const linkPipeline: LinkPipelineReport = {
    maps: {
      stage: mapsChannel.status,
      totalRaw: mapsChannel.totalRaw,
      totalNormalized: mapsChannel.totalNormalized,
      mapsLikeCount: mapsChannel.targetCount,
    },
    instagram: {
      stage: instaChannel.status,
      totalRaw: instaChannel.totalRaw,
      totalNormalized: instaChannel.totalNormalized,
      instagramLikeCount: instaChannel.targetCount,
    },
    mapsScoredPool,
    instagramScoredPool,
  };

  const candidates: SourceCandidates = {
    intakeMode,
    provenance,
    sourceNotes,
    references,
    mapsScoredTop,
    instagramScoredTop,
    mapsScoreThreshold: MAPS_SCORE_THRESHOLD,
    instagramScoreThreshold: INSTAGRAM_SCORE_THRESHOLD,
    debug: { mapsQueries, instagramQueries, linkPipeline },
  };

  const mapsBlockMsg = humanMapsExtractionBlockReason(mapsChannel.status);
  const instaBlockMsg = humanInstagramExtractionBlockReason(instaChannel.status);

  let mapsSourcePriority: MapsSourcePriority | undefined;
  let mapsConfidence: MapsConfidence | undefined;

  if (mapsFromCli && mapsH?.canonicalUrl) {
    candidates.mapsUrl = mapsH.canonicalUrl;
    references.push(mapsH.canonicalUrl);
    mapsSourcePriority = "cli";
    mapsConfidence = cliMapsConfidence(mapsH);
    const bits = [
      "Maps: fuente confiable (CLI --maps).",
      mapsH.fieldsFrom.length ? `Inferido: ${mapsH.fieldsFrom.join(", ")}.` : "",
      mapsH.coords ? `Coordenadas en URL o resueltas: ${mapsH.coords.lat}, ${mapsH.coords.lng}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
    candidates.mapsChoiceReason = bits;
  } else if (skipDdgMapsBecauseNominatimCoords && earlyNom.coordinates) {
    const nu = mapsUrlFromNominatimCoords(earlyNom.coordinates.lat, earlyNom.coordinates.lng);
    candidates.mapsUrl = nu;
    references.push(nu);
    mapsSourcePriority = "nominatim";
    mapsConfidence = earlyNom.address ? "alta" : "media";
    candidates.mapsChoiceReason =
      "Maps: enlace por coordenadas Nominatim (prioridad sobre DuckDuckGo; DDG omitido para Maps).";
  } else if (mapsChannel.status === "ok" && bestMaps && bestMaps.score >= MAPS_SCORE_THRESHOLD) {
    provenance.maps.origin = "search";
    provenance.maps.dataFrom.push("duckduckgo_html", "scoring_maps");
    candidates.mapsUrl = bestMaps.url;
    mapsSourcePriority = "ddg";
    mapsConfidence = bestMaps.score >= 12 ? "alta" : "media";
    candidates.mapsChoiceReason = `${reasonForPick(mapsScoredTop[0], MAPS_SCORE_THRESHOLD, "Maps")} Detalle: ${bestMaps.breakdown.join("; ")}`;
    references.push(bestMaps.url);
  } else {
    const fb = buildFallbackMapsSearchUrl(nameNorm.displayName);
    candidates.mapsUrl = fb;
    references.push(fb);
    mapsSourcePriority = "fallback";
    mapsConfidence = "baja";
    provenance.maps.origin = "fallback";
    provenance.maps.dataFrom.push("google_maps_search_api_fallback");
    const ddgNote = mapsBlockMsg ? `${mapsBlockMsg} ` : "";
    candidates.mapsChoiceReason = `${ddgNote}Maps: enlace de respaldo (búsqueda api=1 por nombre+ciudad). ${
      bestMaps ? `Mejor candidato DDG score ${bestMaps.score} < umbral ${MAPS_SCORE_THRESHOLD}.` : ""
    }`.trim();
    if (!mapsFromCli && mapsChannel.status !== "ok") {
      provenance.maps.dataFrom.push("duckduckgo_maps_failed_or_sparse");
    }
  }

  candidates.mapsSourcePriority = mapsSourcePriority;
  candidates.mapsConfidence = mapsConfidence;

  if (instaFromCli && instaH?.canonicalUrl) {
    candidates.instagramUrl = instaH.canonicalUrl;
    candidates.instagramHandle = instaH.handle;
    references.push(instaH.canonicalUrl);
    const bits = [
      "Instagram: enlace directo (--instagram).",
      instaH.fieldsFrom.length ? `Datos inferidos: ${instaH.fieldsFrom.join(", ")}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
    candidates.instagramChoiceReason = bits;
  } else if (instaChannel.status === "ok") {
    provenance.instagram.origin = "search";
    provenance.instagram.dataFrom.push("duckduckgo_html", "scoring_instagram");
    if (bestInstagram && bestInstagram.score >= INSTAGRAM_SCORE_THRESHOLD) {
      candidates.instagramUrl = bestInstagram.url;
      candidates.instagramChoiceReason = `${reasonForPick(instagramScoredTop[0], INSTAGRAM_SCORE_THRESHOLD, "Instagram")} Detalle: ${bestInstagram.breakdown.join("; ")}`;
      references.push(bestInstagram.url);
    } else {
      candidates.instagramChoiceReason = reasonForPick(
        instagramScoredTop[0],
        INSTAGRAM_SCORE_THRESHOLD,
        "Instagram",
      );
    }
  } else {
    candidates.instagramChoiceReason = instaBlockMsg;
    if (!instaFromCli) {
      provenance.instagram.origin = "search";
      provenance.instagram.dataFrom.push("duckduckgo_intento");
    }
  }

  let address: string | undefined = earlyNom.address;
  let coordinates: { lat: number; lng: number } | undefined = earlyNom.coordinates;
  let phone: string | undefined = earlyNom.phone;
  let hours: string | undefined = earlyNom.hours;
  if (earlyNom.coordinates) candidates.coordinatesSource = "nominatim";

  if (mapsH?.coords) {
    coordinates = mapsH.coords;
    if (mapsH.coordsSource) candidates.coordinatesSource = mapsH.coordsSource;
    provenance.maps.dataFrom.push("coordinates_maps_cli");
    const rev = await reverseNominatim(mapsH.coords.lat, mapsH.coords.lng);
    if (rev.address) {
      address = rev.address;
      provenance.maps.dataFrom.push("nominatim_reverse");
    }
    if (rev.phone) phone = rev.phone;
    if (rev.hours) hours = rev.hours;
    if (rev.address || rev.phone || rev.hours) {
      references.push("https://nominatim.openstreetmap.org/reverse");
    }
  }

  const instaBio = sanitizeInstagramDescription(instaH?.ogDescription?.trim());
  const instaPhones = extractPhonesFromPlainText(instaBio);
  const mapsPhones = mapsH?.phonesFromHtml ?? [];
  const waFromInsta = extractWhatsappFromText(instaBio);

  const mergedPhone = pickFirstPhone([phone, ...mapsPhones, ...instaPhones, waFromInsta]);
  if (mergedPhone) {
    phone = mergedPhone;
    if (mapsPhones.some((p) => normalizeHondurasPhone(p) === normalizeHondurasPhone(mergedPhone))) {
      provenance.maps.dataFrom.push("maps_html_phone");
    }
    if (instaPhones.some((p) => normalizeHondurasPhone(p) === normalizeHondurasPhone(mergedPhone))) {
      provenance.instagram.dataFrom.push("instagram_plaintext_phone");
    }
    if (waFromInsta && normalizeHondurasPhone(waFromInsta) === normalizeHondurasPhone(mergedPhone)) {
      provenance.instagram.dataFrom.push("instagram_wa_same_as_phone");
    }
  }

  const whatsappDistinct =
    waFromInsta && mergedPhone && normalizeHondurasPhone(waFromInsta) !== normalizeHondurasPhone(mergedPhone)
      ? waFromInsta
      : undefined;
  if (whatsappDistinct) {
    candidates.whatsappHint = whatsappDistinct;
    provenance.instagram.dataFrom.push("instagram_wa_distinct");
  }

  const summaryDraft = summarizeForDraft([mapsH?.placeTitle, instaBio || undefined]);
  if (summaryDraft) candidates.summaryDraft = summaryDraft;

  const preferredName =
    instaH?.suggestedDisplayName?.trim() ||
    mapsH?.placeTitle?.trim() ||
    nameNorm.displayName;
  candidates.preferredName = preferredName;
  candidates.preferredNameSource = instaH?.suggestedDisplayName
    ? "instagram"
    : mapsH?.placeTitle
      ? "maps"
      : "inferred";
  if (mapsH?.ogImage) {
    candidates.heroImageCandidateUrl = mapsH.ogImage;
    candidates.heroImageCandidateSource = "maps_og_image";
  }
  if (!candidates.heroImageCandidateUrl && instaH?.ogImage) {
    candidates.heroImageCandidateUrl = instaH.ogImage;
    candidates.heroImageCandidateSource = "instagram_og_image";
  }
  const imageCandidates = dedupeUrls([
    ...(mapsH?.imageCandidates ?? []),
    candidates.heroImageCandidateUrl ?? "",
    ...(instaH?.imageCandidates ?? []),
  ]);
  if (imageCandidates.length) {
    candidates.imageCandidateUrls = imageCandidates;
  }
  const imageCandidateOrigins: Array<{ url: string; source: string }> = [];
  const seenOrigins = new Set<string>();
  pushImageOrigin(imageCandidateOrigins, seenOrigins, mapsH?.ogImage, "maps:og:image");
  for (const u of mapsH?.imageCandidates ?? []) {
    const src = u === mapsH?.ogImage ? "maps:og:image" : "maps:html:image";
    pushImageOrigin(imageCandidateOrigins, seenOrigins, u, src);
  }
  pushImageOrigin(imageCandidateOrigins, seenOrigins, instaH?.ogImage, "instagram:og:image");
  for (const u of instaH?.imageCandidates ?? []) {
    const src = u === instaH?.ogImage ? "instagram:og:image" : "instagram:html:image";
    pushImageOrigin(imageCandidateOrigins, seenOrigins, u, src);
  }
  if (imageCandidateOrigins.length) {
    candidates.imageCandidateOrigins = imageCandidateOrigins;
  }

  if (!phone && (mapsFromCli || instaFromCli)) {
    sourceNotes.push(
      "Teléfono/WhatsApp: no se encontró en el HTML estático de Google Maps, en la bio legible de Instagram (a menudo bloqueada sin sesión o con límite 429), ni en etiquetas OSM para este punto.",
    );
  }
  if (!hours && (mapsFromCli || instaFromCli)) {
    sourceNotes.push(
      "Horario: Google Maps no incluye el texto de horario en la respuesta HTML que el script puede leer; OpenStreetMap rara vez devuelve opening_hours en el resultado inverso de esta ubicación.",
    );
  }

  if (address) candidates.address = address;
  if (coordinates) candidates.coordinates = coordinates;
  if (phone) candidates.phone = phone;
  if (hours) candidates.hours = hours;

  return candidates;
}

export async function gatherPublicCandidates(nameNorm: NameNormalization): Promise<SourceCandidates> {
  return gatherSourceCandidates(nameNorm, {});
}
