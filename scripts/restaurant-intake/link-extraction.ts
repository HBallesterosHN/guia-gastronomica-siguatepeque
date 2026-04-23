/**
 * DuckDuckGo HTML → hrefs crudos → URLs normalizadas (sin scoring).
 */

import { isGoogleMapsLink } from "./scoring";
import type { DiscardedSearchLink, LinkChannelStage, SearchQueryExtraction } from "./types";

const DDG_HTML_ENDPOINT = "https://html.duckduckgo.com/html/";

/** UA tipo navegador: reduce bloqueos frente a un UA de bot explícito. */
export const DUCKDUCKGO_FETCH_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-HN,es;q=0.9,en-US;q=0.8,en;q=0.7",
};

function looksLikeDdgBotWall(html: string): boolean {
  return (
    /anomaly-modal|Unfortunately,\s*bots use DuckDuckGo/i.test(html) ||
    /challenge-form|id="challenge-form"/i.test(html)
  );
}

function clip(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function htmlPreview(html: string): string {
  if (looksLikeDdgBotWall(html)) {
    const idx = html.search(/anomaly-modal__title|Unfortunately,\s*bots/i);
    if (idx >= 0) {
      return clip(html.slice(Math.max(0, idx - 60), idx + 520), 1200);
    }
  }
  const idx = html.search(/result__a|result-link|web-result|links_main/i);
  if (idx >= 0) {
    return clip(html.slice(Math.max(0, idx - 120), idx + 800), 1200);
  }
  return clip(html.slice(0, 2000), 1200);
}

function signalsFromHtml(html: string): string[] {
  const s: string[] = [];
  if (looksLikeDdgBotWall(html)) s.push("ddg_bot_wall_or_challenge");
  if (/result__a/i.test(html)) s.push("has_result__a");
  if (/result-link/i.test(html)) s.push("has_result-link");
  if (/web-result/i.test(html)) s.push("has_web-result");
  if (/class="[^"]*result__a/i.test(html)) s.push("class_result__a_literal");
  if (/<a[^>]+href=/i.test(html)) s.push("has_some_anchor_href");
  return s;
}

/** Extrae href de un fragmento de tag <a ...> (orden de atributos libre). */
function hrefFromAnchorOpen(tagInner: string): string | undefined {
  const m = /\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(tagInner);
  if (!m) return undefined;
  return (m[2] ?? m[3] ?? m[4] ?? "").trim();
}

function classFromAnchorOpen(tagInner: string): string | undefined {
  const m = /\bclass\s*=\s*("([^"]*)"|'([^']*)')/i.exec(tagInner);
  if (!m) return undefined;
  return (m[2] ?? m[3] ?? "").trim();
}

/** Anclas de resultados: clase típica DDG HTML / lite. */
function isLikelyResultAnchor(className: string | undefined): boolean {
  if (!className) return false;
  return /result__a|result-link|web-result__title|result__url/i.test(className);
}

/**
 * Recorre aperturas <a ...> y toma href cuando la clase parece resultado.
 */
function extractHrefsFromResultAnchors(html: string): string[] {
  const out: string[] = [];
  const re = /<a\b([^>]*)>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const inner = m[1];
    const cls = classFromAnchorOpen(inner);
    if (!isLikelyResultAnchor(cls)) continue;
    const href = hrefFromAnchorOpen(inner);
    if (href) out.push(href);
  }
  return out;
}

/**
 * Rescate: cualquier uddg= codificado en el HTML (redirección DDG embebida).
 */
function extractHrefsFromUddgParams(html: string): string[] {
  const out: string[] = [];
  const re = /uddg=([^&"'<>]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      out.push(decodeURIComponent(m[1].replace(/\+/g, "%20")));
    } catch {
      out.push(m[1]);
    }
  }
  return out;
}

function decodeDuckDuckGoHref(href: string): string {
  try {
    let h = href.trim();
    if (h.startsWith("//")) {
      return `https:${h}`;
    }
    if (h.startsWith("/l/?") || h.startsWith("/l?")) {
      const base = "https://duckduckgo.com";
      const url = new URL(h.startsWith("/") ? `${base}${h}` : `${base}/${h}`);
      const uddg = url.searchParams.get("uddg");
      if (uddg) return decodeURIComponent(uddg.replace(/\+/g, "%20"));
      return url.toString();
    }
    if (/^https?:\/\/duckduckgo\.com\/l\/\?/i.test(h)) {
      const url = new URL(h);
      const uddg = url.searchParams.get("uddg");
      if (uddg) return decodeURIComponent(uddg.replace(/\+/g, "%20"));
    }
    return h;
  } catch {
    return href;
  }
}

/** Desenvuelve redirects conocidos de Google y similares. */
export function unwrapKnownRedirectTargets(urlStr: string): string {
  let s = urlStr.trim();
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "google.com" || host.endsWith(".google.com")) {
      if (u.pathname === "/url") {
        const q = u.searchParams.get("q") ?? u.searchParams.get("url");
        if (q && /^https?:\/\//i.test(q)) {
          try {
            return decodeURIComponent(q);
          } catch {
            return q;
          }
        }
      }
    }

    if (host === "goo.gl" || host === "maps.app.goo.gl" || host === "g.co") {
      return s;
    }
  } catch {
    return s;
  }
  return s;
}

function toAbsoluteHttp(urlStr: string): string | undefined {
  const t = urlStr.trim();
  if (!t) return undefined;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("//")) return `https:${t}`;
  return undefined;
}

export type NormalizeOutcome =
  | { ok: true; url: string }
  | { ok: false; reason: string; raw: string };

/**
 * Cadena: decode DDG → unwrap Google /url → absolutizar → URL válida.
 */
export function normalizeSearchResultHref(raw: string): NormalizeOutcome {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, raw: raw, reason: "vacío" };

  let step = decodeDuckDuckGoHref(trimmed);
  step = unwrapKnownRedirectTargets(step);

  const abs = toAbsoluteHttp(step);
  if (!abs) {
    return {
      ok: false,
      raw: trimmed,
      reason: `no es http(s) absoluto tras normalizar (valor: ${clip(step, 120)})`,
    };
  }

  try {
    const parsed = new URL(abs);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { ok: false, raw: trimmed, reason: "protocolo no http(s)" };
    }
    return { ok: true, url: parsed.toString() };
  } catch {
    return { ok: false, raw: trimmed, reason: "URL.parse falló" };
  }
}

function countDomains(urls: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const u of urls) {
    try {
      const h = new URL(u).hostname.replace(/^www\./, "").toLowerCase();
      counts[h] = (counts[h] ?? 0) + 1;
    } catch {
      counts["(invalid)"] = (counts["(invalid)"] ?? 0) + 1;
    }
  }
  return counts;
}

function dedupePreserveOrder(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

export async function duckDuckGoHtmlSearch(query: string): Promise<{
  extraction: SearchQueryExtraction;
  normalizedLinks: string[];
}> {
  const url = `${DDG_HTML_ENDPOINT}?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: DUCKDUCKGO_FETCH_HEADERS, redirect: "follow" });
  const html = await res.text();

  const rawFromAnchors = extractHrefsFromResultAnchors(html);
  const rawFromUddg = extractHrefsFromUddgParams(html);
  const mergedRaw = dedupePreserveOrder([...rawFromAnchors, ...rawFromUddg]);

  const discarded: DiscardedSearchLink[] = [];
  const normalizedUrls: string[] = [];

  for (const raw of mergedRaw) {
    const outcome = normalizeSearchResultHref(raw);
    if (outcome.ok) {
      normalizedUrls.push(outcome.url);
    } else {
      discarded.push({ raw: clip(raw, 500), reason: outcome.reason });
    }
  }

  const normalizedDeduped = dedupePreserveOrder(normalizedUrls);
  const domainCounts = countDomains(normalizedDeduped);

  const extraction: SearchQueryExtraction = {
    requestUrl: url,
    status: res.status,
    htmlLength: html.length,
    signals: signalsFromHtml(html),
    htmlPreview: htmlPreview(html),
    rawFromAnchors,
    rawFromUddgFallback: rawFromUddg,
    mergedRaw,
    normalizedUrls: normalizedDeduped,
    discarded,
    domainCounts,
  };

  return { extraction, normalizedLinks: normalizedDeduped };
}

export function classifyUrlKind(url: string): "maps" | "instagram" | "other" {
  if (isGoogleMapsLink(url)) return "maps";
  try {
    const h = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (h === "instagram.com" || h.endsWith(".instagram.com")) return "instagram";
  } catch {
    /* ignore */
  }
  return "other";
}

export function summarizeChannel(
  extractions: SearchQueryExtraction[],
  kind: "maps" | "instagram",
): { status: LinkChannelStage; totalRaw: number; totalNormalized: number; targetCount: number } {
  const bot = extractions.some((e) => e.signals.includes("ddg_bot_wall_or_challenge"));
  const totalRaw = extractions.reduce((n, e) => n + e.mergedRaw.length, 0);
  const totalNormalized = extractions.reduce((n, e) => n + e.normalizedUrls.length, 0);
  const allNorm = extractions.flatMap((e) => e.normalizedUrls);
  const targetCount = allNorm.filter((u) => classifyUrlKind(u) === kind).length;

  if (bot) return { status: "bot_wall", totalRaw, totalNormalized, targetCount };
  if (totalRaw === 0) return { status: "no_raw_hrefs", totalRaw, totalNormalized, targetCount };
  if (targetCount === 0) return { status: "no_target_domains", totalRaw, totalNormalized, targetCount };
  return { status: "ok", totalRaw, totalNormalized, targetCount };
}

/**
 * UA minimal para acortadores maps.app.goo.gl: con Chrome (DUCKDUCKGO_FETCH_HEADERS) Google
 * suele devolver 200 + SPA sin redirect; con curl devuelve 302 al canonical google.com/maps/…
 */
const MAPS_SHORT_LINK_RESOLVER_UA = "curl/8.7.1";

function isGoogleMapsCanonicalUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    const h = u.hostname.replace(/^www\./, "").toLowerCase();
    return h === "google.com" && /\/maps\b/i.test(u.pathname);
  } catch {
    return false;
  }
}

/** Sigue cadena 301/302 sin ejecutar JS (solo headers Location). */
async function followHttpRedirectChain(startUrl: string, method: "HEAD" | "GET"): Promise<string> {
  let current = startUrl.trim();
  const headers = { "User-Agent": MAPS_SHORT_LINK_RESOLVER_UA };
  for (let hop = 0; hop < 12; hop++) {
    const res = await fetch(current, {
      method,
      redirect: "manual",
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return current;
      current = new URL(loc, current).href;
      continue;
    }
    if (method === "GET" && res.body && typeof res.body.cancel === "function") {
      try {
        await res.body.cancel();
      } catch {
        /* */
      }
    }
    return current;
  }
  return current;
}

/**
 * Sigue redirects HTTP para acortadores de Maps (HEAD, luego GET si hace falta).
 */
export async function maybeExpandShortMapsUrl(url: string): Promise<string> {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return url;
  }
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  const mapsPath = /\/maps/i.test(u.pathname);
  if (host !== "maps.app.goo.gl" && !(host === "goo.gl" && mapsPath)) {
    return url;
  }

  try {
    let resolved = await followHttpRedirectChain(url, "HEAD");
    if (!isGoogleMapsCanonicalUrl(resolved)) {
      resolved = await followHttpRedirectChain(url, "GET");
    }
    if (isGoogleMapsCanonicalUrl(resolved)) return resolved;
  } catch {
    /* volver al original */
  }
  return url;
}
