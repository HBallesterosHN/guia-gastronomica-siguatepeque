import { readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

type Args = {
  slug: string;
  dryRun: boolean;
};

const ROOT = process.cwd();
const entryFile = (slug: string) =>
  path.join(ROOT, "data", "restaurants", "entries", `${slug}.ts`);
const indexFile = path.join(ROOT, "data", "restaurants", "index.ts");
const publicDir = (slug: string) => path.join(ROOT, "public", "restaurants", slug);

function parseArgs(argv: string[]): Args {
  const map = new Map<string, string>();
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (!token.startsWith("--")) continue;
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      throw new Error(`Valor faltante para ${token}`);
    }
    map.set(token.slice(2), next);
    i += 1;
  }

  const slug = map.get("slug")?.trim();
  if (!slug) {
    throw new Error('Uso: npm run restaurant:delete -- --slug "mi-slug" [--dry-run]');
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Slug invalido: ${slug}`);
  }
  return { slug, dryRun };
}

async function exists(pathname: string): Promise<boolean> {
  try {
    await stat(pathname);
    return true;
  } catch {
    return false;
  }
}

function removeFromIndex(source: string, slug: string, variableName: string): string {
  const importLine = `import { ${variableName} } from "@/data/restaurants/entries/${slug}";`;
  let out = source
    .split("\n")
    .filter((line) => line.trim() !== importLine)
    .join("\n");

  const arrayMatch = out.match(/export const restaurants:\s*Restaurant\[\]\s*=\s*\[([\s\S]*?)\];/);
  if (!arrayMatch) return out;
  const items = Array.from(
    new Set((arrayMatch[1].match(/\brestaurant[A-Za-z0-9_]+\b/g) ?? []).filter(Boolean)),
  ).filter((v) => v !== variableName);
  const rebuilt = `export const restaurants: Restaurant[] = [\n${items
    .map((v) => `  ${v},`)
    .join("\n")}\n];`;
  out = out.replace(/export const restaurants:\s*Restaurant\[\]\s*=\s*\[[\s\S]*?\];/, rebuilt);
  out = out.replace(/\n{3,}/g, "\n\n");
  return out;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const targetEntry = entryFile(args.slug);
  const targetPublicDir = publicDir(args.slug);

  if (!(await exists(targetEntry))) {
    throw new Error(`No existe entry para slug "${args.slug}": data/restaurants/entries/${args.slug}.ts`);
  }

  const entrySource = await readFile(targetEntry, "utf8");
  const variableMatch = entrySource.match(/export const\s+([A-Za-z0-9_]+)\s*:/);
  if (!variableMatch?.[1]) {
    throw new Error("No se pudo detectar la variable exportada del entry.");
  }
  const variableName = variableMatch[1];

  const indexSource = await readFile(indexFile, "utf8");
  const updatedIndex = removeFromIndex(indexSource, args.slug, variableName);
  const hasAssets = await exists(targetPublicDir);

  if (args.dryRun) {
    console.log("DRY RUN");
    console.log(`- entry a eliminar: data/restaurants/entries/${args.slug}.ts`);
    console.log(`- variable a quitar de index: ${variableName}`);
    console.log(`- carpeta public: ${hasAssets ? `public/restaurants/${args.slug} (si)` : "(no existe)"}`);
    console.log("- no se escribio ningun cambio.");
    return;
  }

  await rm(targetEntry, { force: true });
  await writeFile(indexFile, updatedIndex, "utf8");
  if (hasAssets) {
    await rm(targetPublicDir, { recursive: true, force: true });
  }

  console.log("Restaurante eliminado correctamente.");
  console.log(`- entry: data/restaurants/entries/${args.slug}.ts`);
  console.log(`- index: removida variable ${variableName}`);
  console.log(`- assets: ${hasAssets ? `public/restaurants/${args.slug}` : "sin carpeta para borrar"}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Error desconocido";
  console.error(`ERROR: ${message}`);
  process.exit(1);
});
