import { RESTAURANT_CATEGORIES, type RestaurantCategory } from "../../types/restaurant";
import type {
  IntakeInput,
  IntakeReport,
  MapsConfidence,
  MapsSourcePriority,
  NameNormalization,
  NormalizedDraft,
  SourceCandidates,
} from "./types";

function clean(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(input: string): string {
  return clean(input)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

const COMMON_WORDS = [
  "restaurante",
  "restaurant",
  "cafe",
  "coffee",
  "cafeteria",
  "bistro",
  "grill",
  "bar",
  "pizza",
  "burger",
  "kitchen",
  "house",
  "steak",
  "tacos",
  "tipico",
  "tipica",
  "comedor",
  "pastela",
  "savoy",
  "bouquet",
];

function splitConcatenatedName(raw: string): string {
  const lowered = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!lowered || raw.includes(" ")) {
    return raw;
  }

  const words: string[] = [];
  let i = 0;
  while (i < lowered.length) {
    let best = "";
    for (const token of COMMON_WORDS) {
      if (lowered.startsWith(token, i) && token.length > best.length) {
        best = token;
      }
    }
    if (best) {
      words.push(best);
      i += best.length;
      continue;
    }
    let j = i + 1;
    while (j < lowered.length) {
      const maybeToken = COMMON_WORDS.some((token) => lowered.startsWith(token, j));
      if (maybeToken) break;
      j += 1;
    }
    words.push(lowered.slice(i, j));
    i = j;
  }

  return words.join(" ");
}

function toTitleCase(input: string): string {
  const lowerJoiners = new Set(["de", "del", "la", "las", "el", "los", "y", "en", "al"]);
  return input
    .replace(/\s*&\s*/g, " & ")
    .split(" ")
    .filter(Boolean)
    .map((word, idx) => {
      const raw = word.trim();
      const lowered = raw.toLowerCase();
      if (lowerJoiners.has(lowered) && idx > 0) return lowered;
      if (/^[A-Z0-9&]{2,4}$/.test(raw) && /[0-9]/.test(raw)) return raw.toUpperCase();
      return lowered[0]?.toUpperCase() + lowered.slice(1);
    })
    .join(" ");
}

export function displayNameFromSocialHandle(handle: string): string {
  const h = clean(handle.replace(/^@+/, "").replace(/_/g, " "));
  return toTitleCase(h);
}

export function normalizeNameInput(rawName: string): NameNormalization {
  const original = clean(rawName);
  const deSpaced = original.includes(" ") ? original : splitConcatenatedName(original);
  const searchName = clean(deSpaced);
  const displayName = toTitleCase(searchName);
  const slugBase = slugify(searchName);
  const displayWithAmpersand = displayName.replace(/\bCoffee Bistro\b/i, "Coffee & Bistro");
  const searchWithAmpersand = searchName.replace(/\bcoffee bistro\b/i, "coffee & bistro");

  const searchVariants = Array.from(
    new Set(
      [
        original,
        searchName,
        displayName,
        `${searchName} Siguatepeque`,
        `${displayName} Siguatepeque`,
        displayWithAmpersand !== displayName ? displayWithAmpersand : null,
        searchWithAmpersand !== searchName ? searchWithAmpersand : null,
        displayWithAmpersand !== displayName
          ? `${displayWithAmpersand} Siguatepeque`
          : null,
        searchWithAmpersand !== searchName
          ? `${searchWithAmpersand} Siguatepeque`
          : null,
      ].filter((v): v is string => Boolean(v)),
    ),
  );

  return { original, searchName, displayName, slugBase, searchVariants };
}

function safeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return undefined;
    }
    return parsed.toString();
  } catch {
    return undefined;
  }
}

function inferCategoryFromSignals(
  requested: RestaurantCategory,
  categoryProvided: boolean | undefined,
  signalsRaw: string[],
): { category: RestaurantCategory; reason: string } {
  if (categoryProvided) {
    return { category: requested, reason: "Se respetó --category explícito." };
  }

  const signals = signalsRaw.join(" ").toLowerCase();
  const scoringRules: Array<{ category: RestaurantCategory; words: RegExp; weight: number; label: string }> = [
    { category: "cafe", words: /\b(coffee|caf[eé]|cafe|espresso|latte|capuccino|bistro|cafeter[ií]a)\b/i, weight: 3, label: "café/bistro" },
    { category: "parrilla", words: /\b(parrilla|grill|asados?|bbq|barbacoa)\b/i, weight: 3, label: "parrilla/asados" },
    { category: "desayuno", words: /\b(desayuno|breakfast|brunch|pancakes?)\b/i, weight: 3, label: "desayuno/brunch" },
    { category: "comida-tipica", words: /\b(t[ií]pico|tipico|catracho|comida\s+t[ií]pica|antojitos)\b/i, weight: 3, label: "comida típica" },
    { category: "mariscos", words: /\b(mariscos?|seafood|ceviche)\b/i, weight: 3, label: "mariscos" },
    { category: "romantico", words: /\b(rom[aá]ntic|pareja|date\s*night|intimo)\b/i, weight: 2, label: "ambiente romántico" },
    { category: "familiar", words: /\b(familiar|family|amplio|niños|ninos)\b/i, weight: 2, label: "ambiente familiar" },
  ];
  const scores = new Map<RestaurantCategory, number>();
  const reasons: string[] = [];
  for (const rule of scoringRules) {
    if (rule.words.test(signals)) {
      scores.set(rule.category, (scores.get(rule.category) ?? 0) + rule.weight);
      reasons.push(rule.label);
    }
  }
  const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0 && sorted[0][1] >= 3) {
    return {
      category: sorted[0][0],
      reason: `Categoría inferida por señales: ${reasons.join(", ")}.`,
    };
  }
  if (RESTAURANT_CATEGORIES.includes(requested)) {
    return { category: requested, reason: "Sin señales claras; se mantiene categoría por defecto." };
  }
  return { category: "familiar", reason: "Sin señales claras; se usa fallback familiar." };
}

function buildEditorialSummary(
  name: string,
  category: RestaurantCategory,
  summaryDraft: string,
  hasPhone: boolean,
  hasHours: boolean,
): string {
  if (summaryDraft.length >= 24) {
    return clean(summaryDraft)
      .replace(/\b\d+(?:[.,]\d+)?\s*[kKmM]?\s*seguidores\b.*$/i, "")
      .replace(/\b\d+\s*seguidos\b.*$/i, "")
      .replace(/\b\d+\s*publicaciones\b.*$/i, "")
      .replace(/\s*\-\s*ver fotos y videos.*$/i, "")
      .trim();
  }
  const toneByCategory: Record<RestaurantCategory, string> = {
    desayuno: "opción práctica para empezar el día",
    cafe: "opción agradable para café y conversación tranquila",
    "comida-tipica": "parada local para comida tradicional",
    familiar: "opción cómoda para comer en plan familiar",
    romantico: "espacio tranquilo para una salida más calmada",
    parrilla: "alternativa con perfil de parrilla",
    mariscos: "alternativa casual para antojos de mariscos",
  };
  const dataState = hasPhone || hasHours ? "con datos de contacto u horario parcialmente verificados" : "con datos clave aún por confirmar";
  return clean(`${name} en Siguatepeque, ${toneByCategory[category]}; ${dataState}.`);
}

export function normalizeIntake(
  input: IntakeInput,
  nameNorm: NameNormalization,
  candidates: SourceCandidates,
): { draft: NormalizedDraft; report: IntakeReport } {
  const name = nameNorm.displayName;
  const slug = slugify(nameNorm.slugBase);
  const mapsUrl = safeUrl(candidates.mapsUrl);
  const instagramUrl = safeUrl(candidates.instagramUrl);
  const address = candidates.address ? clean(candidates.address) : "Por confirmar";
  const coordinates = candidates.coordinates ?? { lat: 0, lng: 0 };
  const phone = candidates.phone ? clean(candidates.phone) : "Por confirmar";
  const whatsapp = candidates.whatsappHint ? clean(candidates.whatsappHint) : phone;
  const hours = candidates.hours ? clean(candidates.hours) : "Horario por confirmar.";
  const summaryDraft = candidates.summaryDraft?.trim() ?? "";
  const categoryPick = inferCategoryFromSignals(input.category, input.categoryProvided, [
    nameNorm.displayName,
    nameNorm.searchName,
    candidates.preferredName ?? "",
    candidates.instagramHandle ?? "",
    summaryDraft,
  ]);
  const summary = buildEditorialSummary(
    name,
    categoryPick.category,
    summaryDraft,
    phone !== "Por confirmar",
    hours !== "Horario por confirmar.",
  );

  const mapsPri: MapsSourcePriority | undefined = candidates.mapsSourcePriority;
  const mapsConf: MapsConfidence | undefined = candidates.mapsConfidence;
  const mapsNote =
    mapsUrl && mapsPri && mapsConf
      ? ` Maps[${mapsPri}, confianza ${mapsConf}]: ${mapsUrl}`
      : mapsUrl && mapsPri
        ? ` Maps[${mapsPri}]: ${mapsUrl}`
        : "";

  const draft: NormalizedDraft = {
    name,
    slug,
    category: categoryPick.category,
    mapsUrl,
    instagramUrl,
    address,
    coordinates,
    phone,
    whatsapp,
    hours,
    summary,
    hero: "/restaurants/placeholders/hero-placeholder.svg",
    notes: `Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar.${mapsNote}`,
    references: candidates.references,
  };

  const found: string[] = [];
  const pending: string[] = [];
  const checks: Array<[string, boolean]> = [
    ["googleMaps", Boolean(mapsUrl)],
    ["instagram", Boolean(instagramUrl)],
    ["address", address !== "Por confirmar"],
    ["coordinates", !(coordinates.lat === 0 && coordinates.lng === 0)],
    ["phone", phone !== "Por confirmar"],
    ["hours", hours !== "Horario por confirmar."],
    ["summary", summaryDraft.length >= 8],
  ];
  checks.forEach(([label, ok]) => (ok ? found.push(label) : pending.push(label)));

  const score = found.length / checks.length;
  let confidence: IntakeReport["confidence"] = score >= 0.7 ? "alta" : score >= 0.4 ? "media" : "baja";

  if (candidates.intakeMode === "search_only") {
    if (confidence === "alta") confidence = "media";
    else if (confidence === "media") confidence = "baja";
  }

  const intakeProvenance: IntakeReport["intakeProvenance"] = {
    intakeMode: candidates.intakeMode,
    maps: {
      origin: candidates.provenance.maps.origin,
      dataFrom: [...candidates.provenance.maps.dataFrom],
    },
    instagram: {
      origin: candidates.provenance.instagram.origin,
      dataFrom: [...candidates.provenance.instagram.dataFrom],
    },
    sourceNotes: [...candidates.sourceNotes],
  };

  return {
    draft,
    report: {
      found,
      pending,
      confidence,
      searchName: nameNorm.searchName,
      displayName: nameNorm.displayName,
      category: categoryPick.category,
      categoryReason: candidates.inferredCategoryReason ?? categoryPick.reason,
      mapsChoiceReason: candidates.mapsChoiceReason,
      instagramChoiceReason: candidates.instagramChoiceReason,
      mapsCandidates: candidates.debug.mapsQueries,
      instagramCandidates: candidates.debug.instagramQueries,
      mapsScoredTop: candidates.mapsScoredTop,
      instagramScoredTop: candidates.instagramScoredTop,
      mapsScoreThreshold: candidates.mapsScoreThreshold,
      instagramScoreThreshold: candidates.instagramScoreThreshold,
      linkPipeline: candidates.debug.linkPipeline,
      intakeProvenance,
      mapsSourcePriority: candidates.mapsSourcePriority,
      mapsConfidence: candidates.mapsConfidence,
      coordinatesSource: candidates.coordinatesSource,
      heroImageCandidateUrl: candidates.heroImageCandidateUrl,
      heroImageCandidateSource: candidates.heroImageCandidateSource,
      nameSource: candidates.preferredNameSource,
    },
  };
}
