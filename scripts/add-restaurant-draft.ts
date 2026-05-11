import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { RESTAURANT_CATEGORIES, type RestaurantCategory } from "../types/restaurant";
import { enrichDraftBySlug } from "./enrich-restaurant-draft";

type Args = {
  name: string;
  maps: string;
  instagram: string;
  notes?: string;
  phone?: string;
  whatsapp?: string;
  hours?: string;
  address?: string;
  category: RestaurantCategory;
  dryRun: boolean;
  autoEnrich: boolean;
};

const ROOT = process.cwd();
const ENTRIES_DIR = path.join(ROOT, "data", "restaurants", "entries");
const INDEX_FILE = path.join(ROOT, "data", "restaurants", "index.ts");
const PLACEHOLDER_DIR = path.join(ROOT, "public", "restaurants", "placeholders");
const PLACEHOLDER_FILE = path.join(PLACEHOLDER_DIR, "hero-placeholder.svg");

function parseArgs(argv: string[]): Args {
  const map = new Map<string, string>();
  let dryRun = false;
  let autoEnrich = true;

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (token === "--no-enrich") {
      autoEnrich = false;
      continue;
    }
    if (!token.startsWith("--")) {
      continue;
    }
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      throw new Error(`Valor faltante para ${token}`);
    }
    map.set(token.slice(2), next);
    i += 1;
  }

  const name = map.get("name");
  const maps = map.get("maps");
  const instagram = map.get("instagram");
  const notes = map.get("notes");
  const phone = map.get("phone");
  const whatsapp = map.get("whatsapp");
  const hours = map.get("hours");
  const address = map.get("address");
  const rawCategory = map.get("category") ?? "familiar";

  if (!name || !maps || !instagram) {
    throw new Error(
      "Uso: --name \"Nombre\" --maps \"https://...\" --instagram \"https://...\" [--notes \"...\"] [--phone \"...\"] [--whatsapp \"...\"] [--hours \"...\"] [--address \"...\"] [--category familiar] [--dry-run]",
    );
  }

  if (!RESTAURANT_CATEGORIES.includes(rawCategory as RestaurantCategory)) {
    throw new Error(
      `Categoria invalida: "${rawCategory}". Usa una de: ${RESTAURANT_CATEGORIES.join(", ")}`,
    );
  }

  return {
    name: name.trim(),
    maps: maps.trim(),
    instagram: instagram.trim(),
    notes: notes?.trim(),
    phone: phone?.trim(),
    whatsapp: whatsapp?.trim(),
    hours: hours?.trim(),
    address: address?.trim(),
    category: rawCategory as RestaurantCategory,
    dryRun,
    autoEnrich,
  };
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function toPascalCase(input: string): string {
  return input
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

function sanitizeCommentText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\*\//g, "* /")
    .replace(/[`$\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function asTsStringLiteral(value: string): string {
  return JSON.stringify(value);
}

function normalizeUrl(raw: string, label: string): string {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`${label} invalido. Debe ser una URL completa.`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`${label} invalido. Debe usar http o https.`);
  }
  return parsed.toString();
}

function extractCoordinates(mapsUrl: string): { lat: number; lng: number } | null {
  const dMatch = mapsUrl.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (dMatch) {
    return { lat: Number(dMatch[1]), lng: Number(dMatch[2]) };
  }

  const atMatch = mapsUrl.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) {
    return { lat: Number(atMatch[1]), lng: Number(atMatch[2]) };
  }

  try {
    const parsed = new URL(mapsUrl);
    const q = parsed.searchParams.get("q") ?? parsed.searchParams.get("query");
    if (q) {
      const qMatch = q.match(/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
      if (qMatch) {
        return { lat: Number(qMatch[1]), lng: Number(qMatch[2]) };
      }
    }
  } catch {
    return null;
  }

  return null;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensurePlaceholderImage(): Promise<void> {
  if (await fileExists(PLACEHOLDER_FILE)) {
    return;
  }

  await mkdir(PLACEHOLDER_DIR, { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-label="Imagen pendiente">
  <rect width="1200" height="800" fill="#e4e4e7"/>
  <rect x="80" y="80" width="1040" height="640" rx="24" fill="#d4d4d8"/>
  <text x="600" y="390" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" fill="#52525b">
    Imagen pendiente
  </text>
  <text x="600" y="445" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#71717a">
    Reemplazar en /public/restaurants/{slug}/hero.jpg
  </text>
</svg>
`;
  await writeFile(PLACEHOLDER_FILE, svg, "utf8");
}

function buildEntrySource(args: Args, slug: string, variableName: string): string {
  const cleanMaps = normalizeUrl(args.maps, "Google Maps");
  const extractedCoordinates = extractCoordinates(cleanMaps);
  const coordinates = extractedCoordinates ?? { lat: 0, lng: 0 };
  const coordinatesStatus = extractedCoordinates
    ? "Extraidas automaticamente desde Google Maps."
    : "Por confirmar (no fue posible extraer coordenadas del enlace).";
  const today = new Date().toISOString().slice(0, 10);
  const cleanName = sanitizeCommentText(args.name);
  const cleanNotes = sanitizeCommentText(args.notes ?? "Sin notas adicionales.");
  const cleanInstagram = normalizeUrl(args.instagram, "Instagram");
  const cleanPhone = sanitizeCommentText(args.phone ?? "Por confirmar");
  const cleanWhatsApp = sanitizeCommentText(args.whatsapp ?? "Por confirmar");
  const cleanHours = sanitizeCommentText(args.hours ?? "Horario por confirmar.");
  const cleanAddress = sanitizeCommentText(args.address ?? "Por confirmar");
  const safeNotesComment = sanitizeCommentText(cleanNotes);

  return `import type { Restaurant } from "@/types/restaurant";

const slug = "${slug}" as const;

/**
 * BORRADOR GENERADO AUTOMATICAMENTE.
 * Google Maps: ${asTsStringLiteral(cleanMaps)}
 * Instagram: ${asTsStringLiteral(cleanInstagram)}
 * Coordenadas: ${asTsStringLiteral(coordinatesStatus)}
 * Notas: ${asTsStringLiteral(safeNotesComment)}
 */
export const ${variableName}: Restaurant = {
  identity: {
    name: ${asTsStringLiteral(cleanName)},
    slug,
  },
  classification: {
    category: "${args.category}",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary:
      "Restaurante en Siguatepeque con información base cargada.",
  },
  location: {
    address: ${asTsStringLiteral(cleanAddress)},
    coordinates: { lat: ${coordinates.lat}, lng: ${coordinates.lng} },
  },
  contact: {
    phone: ${asTsStringLiteral(cleanPhone)},
    whatsapp: ${asTsStringLiteral(cleanWhatsApp)},
  },
  hours: {
    scheduleLabel: ${asTsStringLiteral(cleanHours)},
  },
  media: {
    hero: "/restaurants/placeholders/hero-placeholder.svg",
    gallery: [],
  },
  ratings: {
    average: 0,
    reviewsCount: 0,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [],
};
`;
}

function updateIndexSource(source: string, slug: string, variableName: string): string {
  const importLine = `import { ${variableName} } from "@/data/restaurants/entries/${slug}";`;
  if (!source.includes(importLine)) {
    const lines = source.split("\n");
    const typeImportIndex = lines.findIndex((line) => line.includes("import type { Restaurant }"));
    if (typeImportIndex === -1) {
      throw new Error("No se encontro import de tipo Restaurant en data/restaurants/index.ts");
    }
    lines.splice(typeImportIndex, 0, importLine);
    source = lines.join("\n");
  }

  if (source.includes(`  ${variableName},`)) {
    return source;
  }

  const arrayClose = "\n];";
  const idx = source.lastIndexOf(arrayClose);
  if (idx === -1) {
    throw new Error("No se encontro el cierre del array restaurants en data/restaurants/index.ts");
  }

  return `${source.slice(0, idx)}  ${variableName},${source.slice(idx)}`;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const slug = slugify(args.name);
  if (!slug) {
    throw new Error("No se pudo generar slug valido a partir del nombre.");
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Slug invalido generado: ${slug}`);
  }

  const variableName = `restaurant${toPascalCase(slug)}`;
  const entryFile = path.join(ENTRIES_DIR, `${slug}.ts`);
  if (await fileExists(entryFile)) {
    throw new Error(`Ya existe un archivo para este slug: data/restaurants/entries/${slug}.ts`);
  }

  const entrySource = buildEntrySource(args, slug, variableName);
  const indexSource = await readFile(INDEX_FILE, "utf8");
  const updatedIndex = updateIndexSource(indexSource, slug, variableName);

  if (args.dryRun) {
    console.log("DRY RUN");
    console.log(`- slug: ${slug}`);
    console.log(`- entry file: data/restaurants/entries/${slug}.ts`);
    console.log(`- index updated with: ${variableName}`);
    console.log(`- enrich: ${args.autoEnrich ? "si (planificado)" : "no"}`);
    console.log("- No se escribio ningun archivo.");
    return;
  }

  await ensurePlaceholderImage();
  await writeFile(entryFile, entrySource, "utf8");
  await writeFile(INDEX_FILE, updatedIndex, "utf8");

  if (args.autoEnrich) {
    await enrichDraftBySlug(slug, false);
  }

  console.log("Restaurante draft agregado.");
  console.log(`- Archivo: data/restaurants/entries/${slug}.ts`);
  console.log(`- Variable: ${variableName}`);
  console.log("- Placeholder: /public/restaurants/placeholders/hero-placeholder.svg");
  console.log(`- Enriquecimiento: ${args.autoEnrich ? "aplicado" : "omitido"}`);
  console.log("Siguiente paso: revisar el draft y ajustar texto, contacto e imagen real.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Error desconocido";
  console.error(`ERROR: ${message}`);
  process.exit(1);
});
