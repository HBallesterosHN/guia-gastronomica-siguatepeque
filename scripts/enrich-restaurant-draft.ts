import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { RESTAURANT_CATEGORIES, type RestaurantCategory } from "../types/restaurant";

type Args = {
  slug: string;
  dryRun: boolean;
};

const ROOT = process.cwd();
const ENTRIES_DIR = path.join(ROOT, "data", "restaurants", "entries");

const EXPERIENCE_BY_CATEGORY: Record<RestaurantCategory, string> = {
  desayuno: "desayunos tranquilos para comenzar bien el día",
  cafe: "pausas de café, reuniones cortas o tardes relajadas",
  "comida-tipica": "comida típica con sabor local para compartir",
  familiar: "salidas familiares y almuerzos sin complicaciones",
  romantico: "encuentros más tranquilos en un ambiente agradable",
  parrilla: "comidas más contundentes con perfil de parrilla",
  mariscos: "antojos de mariscos en una salida casual",
};

function parseArgs(argv: string[]): Args {
  const map = new Map<string, string>();
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--dry-run") {
      dryRun = true;
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

  const slug = map.get("slug")?.trim();
  if (!slug) {
    throw new Error('Uso: --slug "mi-restaurante" [--dry-run]');
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Slug invalido: ${slug}`);
  }

  return { slug, dryRun };
}

function toSafeText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMatch(source: string, pattern: RegExp, label: string): string {
  const match = source.match(pattern);
  if (!match?.[1]) {
    throw new Error(`No se pudo extraer ${label} del archivo.`);
  }
  return toSafeText(match[1]);
}

function buildSummary(name: string, category: RestaurantCategory): string {
  const experience = EXPERIENCE_BY_CATEGORY[category];
  return `${name} en Siguatepeque, recomendado para ${experience}. Borrador enriquecido: revisar datos finales antes de publicar.`;
}

function buildReviewsBlock(slug: string): string {
  const today = new Date();
  const dates = [0, 3, 7].map((daysAgo) => {
    const copy = new Date(today);
    copy.setDate(today.getDate() - daysAgo);
    return copy.toISOString().slice(0, 10);
  });

  const reviews = [
    {
      id: `${slug}-seed-1`,
      author: "Reseña inicial",
      rating: 4,
      comment: "Primera impresión positiva; vale la pena validar menú y horarios en sitio.",
      date: dates[0],
    },
    {
      id: `${slug}-seed-2`,
      author: "Reseña inicial",
      rating: 4,
      comment: "Ambiente cómodo según señales públicas; recomendable confirmar disponibilidad en hora pico.",
      date: dates[1],
    },
    {
      id: `${slug}-seed-3`,
      author: "Reseña inicial",
      rating: 4,
      comment: "Borrador neutral mientras se agregan reseñas verificadas de clientes.",
      date: dates[2],
    },
  ];

  const lines = [
    "  reviews: [",
    ...reviews.flatMap((review) => [
      "    {",
      `      id: ${JSON.stringify(review.id)},`,
      `      author: ${JSON.stringify(review.author)},`,
      `      rating: ${review.rating},`,
      `      comment: ${JSON.stringify(review.comment)},`,
      `      date: ${JSON.stringify(review.date)},`,
      "    },",
    ]),
    "  ],",
  ];

  return lines.join("\n");
}

function enrichSource(source: string, slug: string): string {
  const name = extractMatch(source, /name:\s*"([^"]+)"/, "name");
  const rawCategory = extractMatch(source, /category:\s*"([^"]+)"/, "category");

  if (!RESTAURANT_CATEGORIES.includes(rawCategory as RestaurantCategory)) {
    throw new Error(`Categoria invalida en archivo: ${rawCategory}`);
  }
  const category = rawCategory as RestaurantCategory;
  const summary = buildSummary(name, category);
  const summaryRegex = /summary:\s*"[^"]*",/;
  const reviewsRegex = /  reviews:\s*\[[\s\S]*?\],/;

  let output = source;
  if (!summaryRegex.test(output)) {
    throw new Error("No se encontro el campo copy.summary para enriquecer.");
  }
  const currentSummary = extractMatch(source, /summary:\s*"([^"]*)",/, "summary");
  const looksPlaceholder =
    /borrador inicial|sin descripción pública clara|borrador enriquecido/i.test(currentSummary) ||
    currentSummary.length < 50;
  if (looksPlaceholder) {
    output = output.replace(summaryRegex, `summary: ${JSON.stringify(summary)},`);
  }

  if (!reviewsRegex.test(output)) {
    throw new Error("No se encontro el bloque reviews para enriquecer.");
  }
  output = output.replace(reviewsRegex, buildReviewsBlock(slug));

  return output;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  await enrichDraftBySlug(args.slug, args.dryRun);
}

export async function enrichDraftBySlug(slug: string, dryRun = false): Promise<void> {
  const targetFile = path.join(ENTRIES_DIR, `${slug}.ts`);
  const source = await readFile(targetFile, "utf8");
  const enriched = enrichSource(source, slug);

  if (dryRun) {
    console.log("DRY RUN");
    console.log(`- Archivo: data/restaurants/entries/${slug}.ts`);
    console.log("- Cambios: summary + reviews");
    console.log("- No se escribio ningun archivo.");
    return;
  }

  await writeFile(targetFile, enriched, "utf8");
  console.log("Draft enriquecido correctamente.");
  console.log(`- Archivo: data/restaurants/entries/${slug}.ts`);
  console.log("- Campos actualizados: copy.summary, reviews");
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectRun) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error(`ERROR: ${message}`);
    process.exit(1);
  });
}
