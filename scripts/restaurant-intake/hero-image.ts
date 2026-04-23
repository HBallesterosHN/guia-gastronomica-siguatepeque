import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_RESTAURANTS_DIR = path.join(ROOT, "public", "restaurants");

type HeroDownloadResult = {
  downloaded: boolean;
  heroPublicPath?: string;
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
  candidateUrl: string | undefined,
  dryRun: boolean,
): Promise<HeroDownloadResult> {
  if (!candidateUrl) {
    return { downloaded: false, reason: "No hubo imagen candidata pública." };
  }

  let parsed: URL;
  try {
    parsed = new URL(candidateUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { downloaded: false, reason: "URL candidata no es http/https." };
    }
  } catch {
    return { downloaded: false, reason: "URL candidata inválida." };
  }

  try {
    const res = await fetch(parsed.toString(), { redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      return { downloaded: false, reason: `Descarga falló con HTTP ${res.status}.` };
    }
    const contentType = res.headers.get("content-type");
    const ext = extensionFromContentType(contentType) ?? extensionFromUrl(res.url) ?? "jpg";
    if (contentType && !contentType.toLowerCase().startsWith("image/")) {
      return { downloaded: false, reason: `URL respondió ${contentType}, no imagen.` };
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength < 1200) {
      return { downloaded: false, reason: "Imagen demasiado pequeña o inválida." };
    }
    const heroPublicPath = `/restaurants/${slug}/hero.${ext}`;
    if (dryRun) {
      return { downloaded: false, heroPublicPath, reason: "Dry-run: imagen candidata válida (no se escribió en disco)." };
    }
    const targetDir = path.join(PUBLIC_RESTAURANTS_DIR, slug);
    const targetFile = path.join(targetDir, `hero.${ext}`);
    await mkdir(targetDir, { recursive: true });
    await writeFile(targetFile, bytes);
    return { downloaded: true, heroPublicPath, reason: "Imagen hero descargada y guardada localmente." };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { downloaded: false, reason: `Error descargando imagen: ${msg}` };
  }
}
