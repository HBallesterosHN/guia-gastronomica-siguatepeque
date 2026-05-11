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

function formatProfileStatusField(
  status: NonNullable<NormalizedDraft["profileStatus"]>,
): string {
  const lastLine = status.lastReviewed
    ? `    lastReviewed: ${JSON.stringify(status.lastReviewed)},\n`
    : "";
  return `  profileStatus: {
    source: ${JSON.stringify(status.source)},
    verified: ${Boolean(status.verified)},
${lastLine}  },
`;
}

function formatMenuField(menu: NormalizedDraft["menu"]): string {
  if (!menu?.url) return "";
  const labelLine = menu.label
    ? `    label: ${JSON.stringify(menu.label)},\n`
    : "";
  return `  menu: {
    url: ${JSON.stringify(menu.url)},
${labelLine}  },
`;
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
    structured: ${JSON.stringify(draft.hoursStructured ?? [])},
  },
  media: {
    hero: ${JSON.stringify(draft.hero)},
    gallery: ${JSON.stringify(draft.gallery.slice(0, 10))},
  },
  ratings: {
    average: ${Number(draft.ratings.average) || 0},
    reviewsCount: ${Math.max(0, Math.round(Number(draft.ratings.reviewsCount) || 0))},
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
${formatMenuField(draft.menu)}${draft.profileStatus ? formatProfileStatusField(draft.profileStatus) : ""}
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

  const arrayMatch = source.match(/export const restaurants:\s*Restaurant\[\]\s*=\s*\[([\s\S]*?)\];/);
  if (!arrayMatch) {
    throw new Error("No se encontro el array restaurants en data/restaurants/index.ts");
  }

  const parsedItems = Array.from(
    new Set(
      (arrayMatch[1].match(/\brestaurant[A-Za-z0-9_]+\b/g) ?? []).filter(Boolean),
    ),
  );
  if (!parsedItems.includes(variableName)) {
    parsedItems.push(variableName);
  }
  const rebuilt = `export const restaurants: Restaurant[] = [\n${parsedItems
    .map((v) => `  ${v},`)
    .join("\n")}\n];`;

  return source.replace(/export const restaurants:\s*Restaurant\[\]\s*=\s*\[[\s\S]*?\];/, rebuilt);
}

export async function persistDraft(
  draft: NormalizedDraft,
  dryRun: boolean,
): Promise<{ slug: string; variableName: string; entryExistedBefore: boolean }> {
  const variableName = `restaurant${toPascalCase(draft.slug)}`;
  const entryFile = path.join(ENTRIES_DIR, `${draft.slug}.ts`);
  const entryExistedBefore = await fileExists(entryFile);

  if (dryRun) {
    return { slug: draft.slug, variableName, entryExistedBefore };
  }

  const entrySource = buildEntrySource(draft);
  const indexSource = await readFile(INDEX_FILE, "utf8");
  const updatedIndex = updateIndexSource(indexSource, draft.slug, variableName);

  await writeFile(entryFile, entrySource, "utf8");
  await writeFile(INDEX_FILE, updatedIndex, "utf8");

  return { slug: draft.slug, variableName, entryExistedBefore };
}
