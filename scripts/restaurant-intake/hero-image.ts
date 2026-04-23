import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_RESTAURANTS_DIR = path.join(ROOT, "public", "restaurants");

type DownloadedImage = {
  url: string;
  publicPath: string;
};

type CandidateWithSource = { url: string; source: string };

type HeroDownloadResult = {
  downloaded: boolean;
  heroPublicPath?: string;
  galleryPublicPaths: string[];
  candidatesFound: number;
  downloadedCount: number;
  discarded: Array<{ url: string; reason: string }>;
  selectedHeroUrl?: string;
  selectedGalleryUrls: string[];
  reason: string;
};

function extensionFromContentType(contentType: string | null): "jpg" | "png" | "webp" | undefined {
  if (!contentType) return undefined;
  const v = contentType.toLowerCase();
  if (v.includes("image/jpeg") || v.includes("image/jpg")) return "jpg";
  if (v.includes("image/png")) return "png";
  if (v.includes("image/webp")) return "webp";
  return undefined;
}

function extensionFromUrl(url: string): "jpg" | "png" | "webp" | undefined {
  const u = url.toLowerCase();
  if (u.includes(".webp")) return "webp";
  if (u.includes(".png")) return "png";
  if (u.includes(".jpg") || u.includes(".jpeg")) return "jpg";
  return undefined;
}

export async function resolveHeroImageCandidate(
  slug: string,
  candidateUrls: CandidateWithSource[] | undefined,
  dryRun: boolean,
): Promise<HeroDownloadResult> {
  const sourcePriority = (source: string): number => {
    if (source.startsWith("maps:")) return 1;
    if (source.startsWith("other:")) return 2;
    if (source === "instagram:html:image") return 3;
    if (source === "instagram:og:image") return 4;
    return 5;
  };
  const seen = new Set<string>();
  const candidates = (candidateUrls ?? [])
    .filter((c) => c.url?.trim())
    .sort((a, b) => sourcePriority(a.source) - sourcePriority(b.source))
    .filter((c) => {
      const k = c.url.trim();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  if (!candidates.length) {
    return {
      downloaded: false,
      galleryPublicPaths: [],
      candidatesFound: 0,
      downloadedCount: 0,
      discarded: [],
      selectedGalleryUrls: [],
      reason: "No hubo imágenes candidatas públicas.",
    };
  }

  const discarded: Array<{ url: string; reason: string }> = [];

  const looksSmallFromUrl = (url: string): boolean => {
    const m = /(?:_|-)s?(\d{2,4})x(\d{2,4})\b/i.exec(url);
    if (!m) return false;
    const w = Number(m[1]);
    const h = Number(m[2]);
    return Number.isFinite(w) && Number.isFinite(h) && (w < 400 || h < 400);
  };

  const looksProfileLike = (url: string): boolean =>
    /t51\.82787-19|profile|avatar|pfp|\/s100x100\b|_s\d+x\d+/i.test(url);

  const downloadOne = async (
    candidateUrl: string,
    source: string,
    nameBase: string,
    hasNonIgCandidate: boolean,
  ): Promise<DownloadedImage | undefined> => {
    let parsed: URL;
    try {
      parsed = new URL(candidateUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        discarded.push({ url: candidateUrl, reason: "URL inválida o protocolo no permitido." });
        return undefined;
      }
      const host = parsed.hostname.toLowerCase();
      if (!host || host === "localhost") {
        discarded.push({ url: candidateUrl, reason: "Dominio no permitido." });
        return undefined;
      }
    } catch {
      discarded.push({ url: candidateUrl, reason: "URL inválida o mal formada." });
      return undefined;
    }
    const strictQualityMode = hasNonIgCandidate || source !== "instagram:og:image";
    if (looksSmallFromUrl(candidateUrl) && strictQualityMode) {
      discarded.push({ url: candidateUrl, reason: "Tamaño sospechoso por URL (miniatura)." });
      return undefined;
    }
    if (source === "instagram:og:image" && hasNonIgCandidate) {
      discarded.push({ url: candidateUrl, reason: "Descartada: foto de perfil IG con fuentes mejores disponibles." });
      return undefined;
    }
    if (source === "instagram:og:image" && looksProfileLike(candidateUrl) && hasNonIgCandidate) {
      discarded.push({ url: candidateUrl, reason: "Descartada: parece foto de perfil de Instagram." });
      return undefined;
    }
    try {
      const res = await fetch(parsed.toString(), { redirect: "follow", signal: AbortSignal.timeout(15000) });
      if (!res.ok) {
        discarded.push({ url: candidateUrl, reason: `Error de descarga HTTP ${res.status}.` });
        return undefined;
      }
      const contentType = res.headers.get("content-type");
      const ext = extensionFromContentType(contentType) ?? extensionFromUrl(res.url) ?? "jpg";
      if (contentType && !contentType.toLowerCase().startsWith("image/")) {
        discarded.push({ url: candidateUrl, reason: `No descargable: content-type ${contentType}.` });
        return undefined;
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      if (bytes.byteLength < 1200) {
        discarded.push({ url: candidateUrl, reason: "Tamaño sospechoso (muy pequeña)." });
        return undefined;
      }
      const publicPath = `/restaurants/${slug}/${nameBase}.${ext}`;
      if (!dryRun) {
        const targetDir = path.join(PUBLIC_RESTAURANTS_DIR, slug);
        const targetFile = path.join(targetDir, `${nameBase}.${ext}`);
        await mkdir(targetDir, { recursive: true });
        await writeFile(targetFile, bytes);
      }
      return { url: candidateUrl, publicPath };
    } catch {
      discarded.push({ url: candidateUrl, reason: "Error de descarga (timeout/red)." });
      return undefined;
    }
  };

  const downloaded: DownloadedImage[] = [];
  const usedUrls = new Set<string>();
  const hasNonIgCandidate = candidates.some((c) => !c.source.startsWith("instagram:"));
  for (const candidate of candidates) {
    if (downloaded.length >= 5) break;
    if (usedUrls.has(candidate.url)) {
      discarded.push({ url: candidate.url, reason: "Duplicada (URL repetida)." });
      continue;
    }
    const nameBase = downloaded.length === 0 ? "hero" : `gallery-${downloaded.length}`;
    const one = await downloadOne(candidate.url, candidate.source, nameBase, hasNonIgCandidate);
    if (!one) continue;
    if (usedUrls.has(one.url)) {
      discarded.push({ url: one.url, reason: "Duplicada (post-normalización)." });
      continue;
    }
    usedUrls.add(one.url);
    downloaded.push(one);
  }

  if (!downloaded.length) {
    return {
      downloaded: false,
      galleryPublicPaths: [],
      candidatesFound: candidates.length,
      downloadedCount: 0,
      discarded,
      selectedGalleryUrls: [],
      reason: "No se pudo descargar ninguna candidata usable.",
    };
  }

  const heroPublicPath = downloaded[0].publicPath;
  const galleryPublicPaths = downloaded.slice(1, 5).map((d) => d.publicPath);
  if (dryRun) {
    return {
      downloaded: false,
      heroPublicPath,
      galleryPublicPaths,
      candidatesFound: candidates.length,
      downloadedCount: downloaded.length,
      discarded,
      selectedHeroUrl: downloaded[0].url,
      selectedGalleryUrls: downloaded.slice(1, 5).map((d) => d.url),
      reason: "Dry-run: candidatas válidas detectadas (sin escritura en disco).",
    };
  }
  return {
    downloaded: true,
    heroPublicPath,
    galleryPublicPaths,
    candidatesFound: candidates.length,
    downloadedCount: downloaded.length,
    discarded,
    selectedHeroUrl: downloaded[0].url,
    selectedGalleryUrls: downloaded.slice(1, 5).map((d) => d.url),
    reason:
      downloaded.length > 1
        ? `Hero + ${downloaded.length - 1} imágenes de galería descargadas.`
        : "Solo hero descargada; no hubo más candidatas válidas.",
  };
}
