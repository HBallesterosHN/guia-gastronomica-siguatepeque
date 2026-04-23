import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NormalizedDraft } from "./types";

const ROOT = process.cwd();
const ENTRIES_DIR = path.join(ROOT, "data", "restaurants", "entries");
const INDEX_FILE = path.join(ROOT, "data", "restaurants", "index.ts");

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function toPascalCase(input: string): string {
  return input
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

function buildEntrySource(draft: NormalizedDraft): string {
  const variableName = `restaurant${toPascalCase(draft.slug)}`;
  const today = new Date().toISOString().slice(0, 10);

  return `import type { Restaurant } from "@/types/restaurant";

const slug = "${draft.slug}" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: ${JSON.stringify(draft.mapsUrl ?? "Por confirmar")}
 * Instagram: ${JSON.stringify(draft.instagramUrl ?? "Por confirmar")}
 * Referencias: ${JSON.stringify(draft.references)}
 * Notas: ${JSON.stringify(draft.notes)}
 */
export const ${variableName}: Restaurant = {
  identity: {
    name: ${JSON.stringify(draft.name)},
    slug,
  },
  classification: {
    category: "${draft.category}",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary: ${JSON.stringify(draft.summary)},
  },
  location: {
    address: ${JSON.stringify(draft.address)},
    coordinates: { lat: ${draft.coordinates.lat}, lng: ${draft.coordinates.lng} },
  },
  contact: {
    phone: ${JSON.stringify(draft.phone)},
    whatsapp: ${JSON.stringify(draft.whatsapp)},
  },
  hours: {
    scheduleLabel: ${JSON.stringify(draft.hours)},
  },
  media: {
    hero: ${JSON.stringify(draft.hero)},
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
  reviews: [
    {
      id: "${draft.slug}-1",
      author: "Pendiente",
      rating: 0,
      comment: "Completar reseña inicial.",
      date: "${today}",
    },
  ],
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

export async function persistDraft(draft: NormalizedDraft, dryRun: boolean): Promise<{ slug: string; variableName: string }> {
  const variableName = `restaurant${toPascalCase(draft.slug)}`;
  const entryFile = path.join(ENTRIES_DIR, `${draft.slug}.ts`);

  if (dryRun) {
    return { slug: draft.slug, variableName };
  }

  if (await fileExists(entryFile)) {
    throw new Error(`Ya existe un archivo para este slug: data/restaurants/entries/${draft.slug}.ts`);
  }

  const entrySource = buildEntrySource(draft);
  const indexSource = await readFile(INDEX_FILE, "utf8");
  const updatedIndex = updateIndexSource(indexSource, draft.slug, variableName);

  await writeFile(entryFile, entrySource, "utf8");
  await writeFile(INDEX_FILE, updatedIndex, "utf8");

  return { slug: draft.slug, variableName };
}
