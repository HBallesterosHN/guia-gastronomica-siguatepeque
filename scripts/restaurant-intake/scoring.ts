import type { NameNormalization, ScoredCandidate } from "./types";

/** Mínimo para aceptar un enlace de Google Maps como match automático. */
export const MAPS_SCORE_THRESHOLD = 8;
/** Mínimo para aceptar un perfil de Instagram como match automático. */
export const INSTAGRAM_SCORE_THRESHOLD = 6;

const KEYWORDS = [
  "cafe",
  "café",
  "coffee",
  "bistro",
  "restaurant",
  "restaurante",
  "comida",
  "grill",
  "bar",
];

function decodeLoose(s: string): string {
  try {
    return decodeURIComponent(s.replace(/\+/g, "%20"));
  } catch {
    return s.replace(/\+/g, " ");
  }
}

/** Texto en minúsculas donde buscar tokens (host + path + query decodificados). */
export function haystackFromUrl(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    const path = decodeLoose(u.pathname);
    const search = decodeLoose(u.search.slice(1));
    return `${u.hostname} ${path} ${search}`.toLowerCase();
  } catch {
    return urlStr.toLowerCase();
  }
}

function bigramSet(s: string): Set<string> {
  const out = new Set<string>();
  const t = s.replace(/[^a-z0-9]+/gi, "").toLowerCase();
  if (t.length < 2) return out;
  for (let i = 0; i < t.length - 1; i++) out.add(t.slice(i, i + 2));
  return out;
}

function jaccardBigrams(a: string, b: string): number {
  const A = bigramSet(a);
  const B = bigramSet(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union ? inter / union : 0;
}

function tokensFromSearchName(searchName: string): string[] {
  return searchName
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9áéíóúüñ]/gi, ""))
    .filter((t) => t.length >= 2);
}

function mergedAlpha(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9áéíóúüñ]/gi, "");
}

export function isGoogleMapsLink(url: string): boolean {
  return /google\.com\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(
    url,
  );
}

export function isInstagramProfileUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!/instagram\.com$/i.test(u.hostname.replace(/^www\./, ""))) return false;
    const seg = u.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    if (!seg) return false;
    const skip = new Set(["p", "reel", "reels", "stories", "explore", "accounts", "direct"]);
    return !skip.has(seg);
  } catch {
    return false;
  }
}

function instagramHandle(url: string): string | undefined {
  try {
    const u = new URL(url);
    const seg = u.pathname.split("/").filter(Boolean)[0];
    return seg?.toLowerCase();
  } catch {
    return undefined;
  }
}

export type MatchContext = {
  searchName: string;
  displayName: string;
  tokens: string[];
  mergedSearch: string;
  mergedDisplay: string;
};

export function buildMatchContext(nameNorm: NameNormalization): MatchContext {
  const tokens = tokensFromSearchName(nameNorm.searchName);
  return {
    searchName: nameNorm.searchName,
    displayName: nameNorm.displayName,
    tokens,
    mergedSearch: mergedAlpha(nameNorm.searchName),
    mergedDisplay: mergedAlpha(nameNorm.displayName),
  };
}

export function scoreMapsUrl(
  url: string,
  ctx: MatchContext,
  searchQuery?: string,
): { score: number; breakdown: string[] } {
  if (!isGoogleMapsLink(url)) {
    return { score: 0, breakdown: ["0 la URL no es de Google Maps (host o ruta)"] };
  }

  const hay = haystackFromUrl(url);
  let score = 0;
  const breakdown: string[] = [];

  score += 4;
  breakdown.push("+4 dominio/path de Google Maps");

  const q = searchQuery?.toLowerCase() ?? "";
  if (q.includes("siguatepeque")) {
    score += 1;
    breakdown.push("+1 busqueda ya acotada a Siguatepeque");
  }

  if (hay.includes("siguatepeque")) {
    score += 3;
    breakdown.push("+3 texto contiene «Siguatepeque»");
  }

  const hayAlpha = hay.replace(/[^a-z0-9áéíóúüñ]+/g, "");
  for (const tok of ctx.tokens) {
    if (tok.length < 3) continue;
    if (hay.includes(tok)) {
      score += 2;
      breakdown.push(`+2 token del nombre «${tok}» en la URL`);
    }
  }

  if (ctx.mergedSearch.length >= 4 && hayAlpha.includes(ctx.mergedSearch)) {
    score += 5;
    breakdown.push("+5 nombre compacto (sin espacios) coincide con la URL");
  }

  const sim = jaccardBigramsSafe(ctx.mergedSearch, hayAlpha);
  if (sim >= 0.15) {
    const add = Math.round(sim * 10);
    score += add;
    breakdown.push(`+${add} similitud por bigramas (${sim.toFixed(2)})`);
  }

  let kwHits = 0;
  for (const kw of KEYWORDS) {
    if (!hay.includes(kw)) continue;
    const kwRoot = kw.replace(/é/g, "e");
    const coherent =
      ctx.mergedSearch.includes(kwRoot.replace(/[^a-z0-9]/g, "")) ||
      ctx.tokens.some((t) => t.startsWith(kwRoot.slice(0, 3)) || kwRoot.startsWith(t.slice(0, 3)));
    if (coherent && kwHits < 2) {
      kwHits += 1;
      score += 1;
      breakdown.push(`+1 palabra clave «${kw}» alineada con el nombre`);
    }
  }

  return { score, breakdown };
}

function jaccardBigramsSafe(a: string, b: string): number {
  if (a.length < 2 || b.length < 2) return 0;
  return jaccardBigrams(a, b);
}

export function scoreInstagramUrl(
  url: string,
  ctx: MatchContext,
  searchQuery?: string,
): { score: number; breakdown: string[] } {
  const hay = haystackFromUrl(url);
  let score = 0;
  const breakdown: string[] = [];

  if (!/instagram\.com/i.test(url)) {
    return { score: 0, breakdown: ["0 no es instagram.com"] };
  }

  if (!isInstagramProfileUrl(url)) {
    return { score: 0, breakdown: ["0 URL no es perfil (p/reel/stories/…)"] };
  }

  score += 4;
  breakdown.push("+4 host instagram.com (perfil)");

  const q = searchQuery?.toLowerCase() ?? "";
  if (q.includes("siguatepeque")) {
    score += 1;
    breakdown.push("+1 busqueda ya acotada a Siguatepeque");
  }

  const handle = instagramHandle(url);
  if (handle) {
    for (const tok of ctx.tokens) {
      if (tok.length < 3) continue;
      if (handle.includes(tok)) {
        score += 2;
        breakdown.push(`+2 handle contiene token «${tok}»`);
      }
    }
    const sim = jaccardBigramsSafe(ctx.mergedSearch, handle);
    if (sim >= 0.2) {
      const add = Math.round(sim * 8);
      score += add;
      breakdown.push(`+${add} similitud handle vs nombre (${sim.toFixed(2)})`);
    }
  }

  if (hay.includes("siguatepeque")) {
    score += 2;
    breakdown.push("+2 menciona Siguatepeque en URL o query");
  }

  return { score, breakdown };
}

type ScoredAccum = { url: string; score: number; query: string; breakdown: string[] };

function upsertBest(map: Map<string, ScoredAccum>, url: string, query: string, score: number, breakdown: string[]) {
  const prev = map.get(url);
  if (!prev || score > prev.score) {
    map.set(url, { url, score, query, breakdown: [...breakdown] });
  }
}

/** Deduplica por URL, conserva el mejor score y la query que lo originó. */
export function accumulateScored(
  items: { url: string; query: string; score: number; breakdown: string[] }[],
): ScoredAccum[] {
  const map = new Map<string, ScoredAccum>();
  for (const it of items) {
    upsertBest(map, it.url, it.query, it.score, it.breakdown);
  }
  return [...map.values()].sort((a, b) => b.score - a.score);
}

export function topScoredCandidates(
  scored: ScoredAccum[],
  limit = 3,
): ScoredCandidate[] {
  return scored.slice(0, limit).map((s) => ({
    url: s.url,
    score: s.score,
    query: s.query,
    breakdown: s.breakdown,
  }));
}

export function reasonForPick(
  best: ScoredCandidate | undefined,
  threshold: number,
  kind: "Maps" | "Instagram",
): string {
  if (!best) return `${kind}: sin candidatos puntuados.`;
  if (best.score >= threshold) {
    return `${kind}: aceptado (score ${best.score} ≥ umbral ${threshold}).`;
  }
  return `${kind}: no aceptado (mejor score ${best.score} < umbral ${threshold}); queda por confirmar.`;
}

export function reasonForDiscard(
  c: ScoredCandidate,
  best: ScoredCandidate | undefined,
  threshold: number,
  kind: "Maps" | "Instagram",
): string {
  if (!best) return `${kind}: descartado (sin comparación).`;
  if (c.url === best.url) {
    if (c.score >= threshold) return `${kind}: elegido (mejor candidato).`;
    return `${kind}: mejor candidato pero por debajo del umbral; no se asigna URL.`;
  }
  return `${kind}: descartado (no elegido: mejor score ${best.score} vs ${c.score}).`;
}
