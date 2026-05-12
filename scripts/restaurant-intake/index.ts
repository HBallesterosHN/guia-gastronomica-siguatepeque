import process from "node:process";
import dotenv from "dotenv";
import { RESTAURANT_CATEGORIES, type RestaurantCategory } from "../../types/restaurant";
import { getRestaurantBySlugFromFiles } from "../../lib/restaurants-file";
import { buildRestaurantFromSources } from "../../lib/restaurant-intake/build-restaurant-from-sources";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
import { enrichDraftBySlug } from "../enrich-restaurant-draft";
import { persistDraft } from "./persist";
import { persistDraftToNeon, restaurantSlugExistsInNeon } from "./persist-neon";
import { isGoogleMapsLink, reasonForDiscard } from "./scoring";
import type {
  CandidateDebug,
  ChannelProvenance,
  ImageDownloadScope,
  IntakeInput,
  IntakeReport,
  ScoredCandidate,
} from "./types";

function stripVerboseSearchFlag(argv: string[]): { argv: string[]; verboseSearch: boolean } {
  const verboseSearch = argv.includes("--verbose-search");
  return { argv: argv.filter((t) => t !== "--verbose-search"), verboseSearch };
}

function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

function printIntakeProvenance(p: IntakeReport["intakeProvenance"]): void {
  console.log("- procedencia de fuentes (post-intake):");
  console.log(`  modo: ${p.intakeMode} (search_only = solo nombre/búsqueda DDG; direct_cli = hubo --maps y/o --instagram)`);
  console.log(
    `  Maps: origen=${p.maps.origin} (cli=--maps; nominatim=coords OSM; fallback=búsqueda api=1; search=DDG+scoring; none=sin intento)`,
  );
  console.log(`    datos usados: ${p.maps.dataFrom.join(", ") || "(ninguno registrado)"}`);
  console.log(
    `  Instagram: origen=${p.instagram.origin} (cli = entrada --instagram; search = DuckDuckGo+scoring; none = sin intento útil)`,
  );
  console.log(`    datos usados: ${p.instagram.dataFrom.join(", ") || "(ninguno registrado)"}`);
  if (p.sourceNotes.length) {
    console.log("  notas / extractos no volcados al draft:");
    p.sourceNotes.forEach((n) => console.log(`    · ${clip(n, 500)}`));
  }
}

function printScoredBlock(
  label: string,
  items: ScoredCandidate[],
  queries: CandidateDebug[],
  best: ScoredCandidate | undefined,
  threshold: number,
  kind: "Maps" | "Instagram",
  pool: ScoredCandidate[],
  stage: IntakeReport["linkPipeline"]["maps"]["stage"] | IntakeReport["linkPipeline"]["instagram"]["stage"],
  origin: ChannelProvenance["origin"],
): void {
  console.log(`- ${label} (umbral ${threshold}):`);
  if (kind === "Maps" && origin === "cli") {
    console.log("  (scoring omitido: URL directa CLI)");
    return;
  }
  if (kind === "Maps" && origin === "nominatim") {
    console.log("  (scoring omitido: URL de Maps desde Nominatim; DuckDuckGo no usado para este enlace)");
    return;
  }
  if (kind === "Instagram" && origin === "cli") {
    console.log("  (scoring omitido: URL directa CLI)");
    return;
  }
  if (!items.length) {
    const rawMerged = queries.reduce((n, q) => n + q.extraction.mergedRaw.length, 0);
    const norm = queries.reduce((n, q) => n + q.extraction.normalizedUrls.length, 0);
    const mapsLike = queries.flatMap((q) => q.links).filter(isGoogleMapsLink).length;
    const instaLike = queries.flatMap((q) => q.links).filter((u) => /instagram\.com/i.test(u)).length;
    const mapsLikeNorm = queries
      .flatMap((q) => q.extraction.normalizedUrls)
      .filter(isGoogleMapsLink).length;
    const instaLikeNorm = queries
      .flatMap((q) => q.extraction.normalizedUrls)
      .filter((u) => /instagram\.com/i.test(u)).length;

    const extractionFail = stage === "bot_wall" || stage === "no_raw_hrefs";
    const head = extractionFail
      ? "sin candidatos puntuados (scoring no aplicó: falló extracción de enlaces o no hubo URLs objetivo)."
      : "sin candidatos puntuados tras scoring (extracción sí produjo URLs del dominio).";

    const hint =
      kind === "Maps"
        ? `stage=${stage}; hrefs brutos=${rawMerged}; normalizados=${norm}; tipo Maps en normalizados=${mapsLikeNorm}; tipo Maps en links finales=${mapsLike}`
        : `stage=${stage}; hrefs brutos=${rawMerged}; normalizados=${norm}; tipo Instagram en normalizados=${instaLikeNorm}; tipo Instagram en links finales=${instaLike}`;

    console.log(`  (${head})`);
    console.log(`  (${hint})`);
    return;
  }
  items.forEach((c, i) => {
    console.log(`  ${i + 1}. score ${c.score} — ${c.url}`);
    console.log(`     query: ${c.query}`);
    for (const line of c.breakdown) {
      console.log(`     - ${line}`);
    }
    console.log(`     decision: ${reasonForDiscard(c, best ?? items[0], threshold, kind)}`);
  });

  if (pool.length > items.length) {
    console.log(`  (pool completo hasta ${pool.length} — más allá del top ${items.length} mostrado arriba):`);
    pool.slice(items.length).forEach((c, i) => {
      console.log(`  ${items.length + i + 1}. score ${c.score} — ${c.url}`);
      console.log(`     query: ${c.query}`);
    });
  }
}

function printQueryExtractions(title: string, queries: CandidateDebug[], verboseSearch: boolean): void {
  console.log(`- ${title} (por consulta):`);
  queries.forEach((q, i) => {
    const e = q.extraction;
    console.log(`  [${i + 1}] query: ${q.query}`);
    console.log(
      `      HTTP ${e.status} · HTML ~${e.htmlLength} chars · señales: ${e.signals.join(", ") || "(ninguna)"}`,
    );
    console.log(
      `      brutos: anclas=${e.rawFromAnchors.length}, uddg_fallback=${e.rawFromUddgFallback.length}, merged=${e.mergedRaw.length} → normalizados válidos=${e.normalizedUrls.length}`,
    );
    if (e.mergedRaw.length) {
      console.log(`      hrefs brutos (muestra):`);
      e.mergedRaw.slice(0, 6).forEach((h) => console.log(`        · ${clip(h, 200)}`));
    }
    if (e.normalizedUrls.length) {
      console.log(`      URLs normalizadas (muestra):`);
      e.normalizedUrls.slice(0, 6).forEach((h) => console.log(`        · ${clip(h, 220)}`));
    }
    if (e.discarded.length) {
      console.log(`      descartados en normalización (${e.discarded.length}, muestra):`);
      e.discarded.slice(0, 8).forEach((d) => console.log(`        · ${clip(d.raw, 160)} → ${d.reason}`));
    }
    const dom = Object.entries(e.domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([h, c]) => `${h}×${c}`)
      .join(", ");
    if (dom) console.log(`      dominios (normalizados): ${dom}`);

    const prevCap = verboseSearch ? 2800 : 420;
    console.log(`      HTML preview (${verboseSearch ? "verbose" : "compacto"}):`);
    console.log(`      ${clip(e.htmlPreview, prevCap).replace(/\n/g, " ")}`);
  });
}

function printLinkPipelineSummary(report: IntakeReport): void {
  const lp = report.linkPipeline;
  console.log("- tubería extracción → dominio (pre-scoring):");
  console.log(
    `  Maps: stage=${lp.maps.stage} · hrefs brutos=${lp.maps.totalRaw} · URLs normalizadas=${lp.maps.totalNormalized} · ` +
      `con forma Maps=${lp.maps.mapsLikeCount}`,
  );
  console.log(
    `  Instagram: stage=${lp.instagram.stage} · hrefs brutos=${lp.instagram.totalRaw} · URLs normalizadas=${lp.instagram.totalNormalized} · ` +
      `con forma Instagram=${lp.instagram.instagramLikeCount}`,
  );
}

function parseArgs(argv: string[]): IntakeInput {
  const map = new Map<string, string>();
  let dryRun = false;
  let textOnly = false;
  let forceFile = false;
  let forceDb = false;
  let targetExplicit = false;
  let target: IntakeInput["target"] = "file";

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (token === "--text-only") {
      textOnly = true;
      continue;
    }
    if (token === "--force-file") {
      forceFile = true;
      continue;
    }
    if (token === "--force") {
      forceDb = true;
      continue;
    }
    if (token === "--target") {
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        throw new Error("Valor faltante para --target (usa file o db).");
      }
      if (next !== "file" && next !== "db") {
        throw new Error(`--target inválido: "${next}". Usa file o db.`);
      }
      target = next;
      targetExplicit = true;
      i += 1;
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

  const name = map.get("name")?.trim() || undefined;
  const mapsUrlCli = map.get("maps")?.trim() || undefined;
  const instagramUrlCli = map.get("instagram")?.trim() || undefined;
  const menuUrlCli = map.get("menu")?.trim() || undefined;
  const menuLabelCli = map.get("menu-label")?.trim() || undefined;
  const categoryToken = map.get("category")?.trim();
  const imagesScopeRaw = map.get("images-scope")?.trim().toLowerCase() as
    | ImageDownloadScope
    | "featured"
    | "place"
    | undefined;
  const slug = map.get("slug")?.trim() || undefined;
  const legacyScope = imagesScopeRaw === "featured" || imagesScopeRaw === "place";
  const imagesScope: ImageDownloadScope = legacyScope ? "gallery" : imagesScopeRaw ?? "all";
  const rawCategory = (categoryToken ?? "familiar") as RestaurantCategory;
  const categoryProvided = Boolean(categoryToken);

  if (!name && !mapsUrlCli && !instagramUrlCli) {
    throw new Error(
      'Indica al menos uno entre --name, --maps y --instagram (los tres son opcionales salvo que debas elegir al menos una fuente). ' +
        'Ej.: solo nombre: --name "Restaurante". Solo Instagram: --instagram "https://...". Solo Maps: --maps "https://...". ' +
        "Combinar: npm run restaurant:intake -- --name \"...\" [--maps URL] [--instagram URL] [--menu URL] [--menu-label Texto] [--slug mi-restaurante] [--category familiar] [--images-scope all|hero|gallery] [--target file|db] [--force-file] [--force] [--text-only] [--dry-run] [--verbose-search]",
    );
  }
  if (target === "db" && !process.env.DATABASE_URL?.trim()) {
    throw new Error("--target db requiere DATABASE_URL en .env / .env.local.");
  }
  if (!RESTAURANT_CATEGORIES.includes(rawCategory)) {
    throw new Error(`Categoria invalida: ${rawCategory}. Usa: ${RESTAURANT_CATEGORIES.join(", ")}`);
  }
  if (!["all", "hero", "gallery"].includes(imagesScope)) {
    throw new Error('Valor inválido para --images-scope. Usa: "all", "hero" o "gallery".');
  }
  if (imagesScope !== "all" && !slug) {
    throw new Error(
      'Cuando --images-scope es "hero" o "gallery" debes enviar --slug para actualizar un restaurante existente.',
    );
  }
  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Slug inválido: ${slug}. Usa minúsculas, números y guiones.`);
  }
  if (menuLabelCli && !menuUrlCli) {
    throw new Error("Si usas --menu-label debes enviar también --menu con la URL.");
  }
  if (textOnly && !slug) {
    throw new Error('Cuando usas --text-only debes enviar --slug para actualizar un restaurante existente.');
  }
  if (textOnly && imagesScope !== "all") {
    throw new Error('Con --text-only usa --images-scope all (el texto ignora scopes parciales de imágenes).');
  }

  return {
    target,
    targetExplicit,
    forceFile,
    forceDb,
    name,
    category: rawCategory,
    categoryProvided,
    dryRun,
    textOnly,
    imagesScope,
    slug,
    mapsUrlCli,
    instagramUrlCli,
    menuUrlCli,
    menuLabelCli,
  };
}

async function main(): Promise<void> {
  const { argv, verboseSearch } = stripVerboseSearchFlag(process.argv.slice(2));
  const input = parseArgs(argv);

  if (input.target === "db" && input.imagesScope !== "all") {
    throw new Error(
      'Con --target db no se soporta --images-scope "hero" ni "gallery" (solo flujo completo o --text-only). Para imágenes solo en disco usa --target file.',
    );
  }

  console.log("restaurant:intake");
  console.log(`- --target: ${input.target}${input.targetExplicit ? "" : " (default file)"}`);
  if (input.name?.trim()) console.log(`- --name explícito: ${input.name.trim()}`);
  if (input.mapsUrlCli) console.log(`- --maps: ${input.mapsUrlCli}`);
  if (input.instagramUrlCli) console.log(`- --instagram: ${input.instagramUrlCli}`);
  if (input.menuUrlCli) console.log(`- --menu: ${input.menuUrlCli}`);
  if (input.menuLabelCli) console.log(`- --menu-label: ${input.menuLabelCli}`);
  if (input.slug) console.log(`- --slug destino: ${input.slug}`);
  console.log(`- images scope: ${input.imagesScope}`);
  if (input.textOnly) console.log("- modo: text-only (sin descarga/escritura de imágenes)");
  if (verboseSearch) {
    console.log("- flag: --verbose-search (HTML preview largo por consulta)");
  }

  const { draft, report } = await buildRestaurantFromSources({
    input,
    mediaMode: "cli-disk",
    imageDryRun: input.dryRun,
  });

  console.log(`- nombre busqueda: ${report.searchName}`);
  console.log(`- nombre comercial: ${report.displayName}`);
  console.log(`- slug definitivo: ${draft.slug}`);
  const lp = report.linkPipeline;
  console.log(
    `  resumen DDG (si aplica): Maps [${lp.maps.stage}] brutos=${lp.maps.totalRaw} norm=${lp.maps.totalNormalized} mapsLike=${lp.maps.mapsLikeCount} | ` +
      `Instagram [${lp.instagram.stage}] brutos=${lp.instagram.totalRaw} norm=${lp.instagram.totalNormalized} instaLike=${lp.instagram.instagramLikeCount}`,
  );
  if (report.placesIntakeMessages?.length) {
    console.log("- Google Places (log):");
    report.placesIntakeMessages.forEach((m) => console.log(`  ${m}`));
  } else if (!process.env.GOOGLE_MAPS_API_KEY?.trim()) {
    console.log("- etapa 1.5: Google Places API omitida (sin GOOGLE_MAPS_API_KEY en .env.local / .env)");
  }
  report.placesIntakeErrors?.forEach((m) => console.log(`  (error) ${m}`));
  if (report.placesPhotoDownloadLog?.length) {
    console.log("- Google Place Photos (log):");
    report.placesPhotoDownloadLog.forEach((m) => console.log(`  ${m}`));
  }
  console.log("- etapa 2: normalizacion (completada en pipeline)");
  if (!input.textOnly) {
    console.log(`- etapa 2.1 imágenes: ${report.heroImageReason ?? "(sin detalle)"}`);
  } else {
    console.log("- etapa 2.1 imágenes: omitido (--text-only)");
  }

  const existingBeforePersist = getRestaurantBySlugFromFiles(draft.slug);

  const dbHasSlug =
    Boolean(process.env.DATABASE_URL?.trim()) && (await restaurantSlugExistsInNeon(draft.slug));

  if (!input.targetExplicit && input.target === "file") {
    console.warn(
      "────────────────────────────────────────────────────────────────────────────\n" +
        "AVISO: Modo file (default; no pasaste --target). Se escribirá en data/restaurants y public/restaurants.\n" +
        "Si este slug ya está en Neon, la web puede seguir mostrando la DB (tiene prioridad sobre el archivo).\n" +
        "Para volcar el intake a Neon: --target db  |  Para forzar solo archivos: --force-file\n" +
        "────────────────────────────────────────────────────────────────────────────",
    );
  }

  const imagesOnlyMode = input.imagesScope !== "all";
  let persisted: Awaited<ReturnType<typeof persistDraft>> = {
    slug: draft.slug,
    variableName: "(sin persistencia)",
    entryExistedBefore: false,
  };
  let neonPersist: Awaited<ReturnType<typeof persistDraftToNeon>> | undefined;

  if (input.target === "file" && !input.dryRun && !imagesOnlyMode) {
    if (dbHasSlug && !input.forceFile) {
      throw new Error(
        "Este restaurante existe en DB (Neon). Actualizar solo el archivo NO cambia lo que ve la web en producción. Usa --target db (y --force si la fila ya existe) o --force-file si quieres sobrescribir el entry TS a propósito.",
      );
    }
  }
  if (input.target === "file" && input.dryRun && !imagesOnlyMode && dbHasSlug && !input.forceFile) {
    console.warn(
      "AVISO: con --dry-run no se aborta; en ejecución real fallaría sin --force-file porque el slug ya existe en Neon.",
    );
  }

  if (imagesOnlyMode) {
    console.log("- etapa 3: persistencia draft omitida (modo solo imágenes)");
    console.log(
      `  scope=${input.imagesScope}; se actualizaron archivos de /public/restaurants/${draft.slug}/ sin tocar data/restaurants/entries.`,
    );
  } else if (input.target === "file") {
    console.log("- etapa 3: persistencia draft (archivos)");
    persisted = await persistDraft(draft, input.dryRun);
    if (input.dryRun) {
      console.log(
        "  (--dry-run: no se creó ningún archivo ni se modificó data/restaurants/index.ts; solo simulación.)",
      );
      console.log(
        `  Rutas que se usarían sin --dry-run: data/restaurants/entries/${persisted.slug}.ts + entrada en data/restaurants/index.ts` +
          (persisted.entryExistedBefore ? " (el entry ya existe → se sobrescribiría)." : " (entry nuevo)."),
      );
    } else if (persisted.entryExistedBefore) {
      console.log(
        `  OK: actualizado data/restaurants/entries/${persisted.slug}.ts y sincronizado data/restaurants/index.ts (${persisted.variableName}).`,
      );
    } else {
      console.log(
        `  OK: creado data/restaurants/entries/${persisted.slug}.ts y actualizado data/restaurants/index.ts (${persisted.variableName}).`,
      );
    }
  } else {
    console.log("- etapa 3: persistencia en archivos omitida (--target db)");
    persisted = {
      slug: draft.slug,
      variableName: "(target-db)",
      entryExistedBefore: Boolean(existingBeforePersist),
    };
    console.log("- etapa 3b: Neon (Prisma)");
    neonPersist = await persistDraftToNeon({
      draft,
      dryRun: input.dryRun,
      textOnly: input.textOnly,
      force: input.forceDb,
    });
    if (!input.dryRun && neonPersist.wroteDb) {
      console.log(
        neonPersist.created
          ? `  OK: creado restaurante "${draft.slug}" en Neon.`
          : `  OK: actualizado restaurante "${draft.slug}" en Neon.`,
      );
    }
  }

  if (!imagesOnlyMode && input.target === "file" && !input.dryRun) {
    console.log("- etapa 4: enriquecimiento");
    await enrichDraftBySlug(draft.slug, false);
  } else if (!imagesOnlyMode && input.target === "file" && input.dryRun) {
    console.log("- etapa 4: enriquecimiento omitido (--dry-run)");
  } else if (!imagesOnlyMode && input.target === "db") {
    console.log("- etapa 4: enriquecimiento omitido (--target db; no aplica a entries TS)");
  }

  console.log("");
  console.log("REPORTE FINAL");
  console.log(`- --target: ${input.target}${input.targetExplicit ? "" : " (implícito: file)"}`);
  const fileTsWritten = input.target === "file" && !imagesOnlyMode && !input.dryRun;
  const fileTsDryRun = input.target === "file" && !imagesOnlyMode && input.dryRun;
  const dbWritten = Boolean(neonPersist?.wroteDb);
  console.log(
    `- escribió data/restaurants (entries + index): ${
      fileTsWritten ? "sí" : fileTsDryRun ? "no (dry-run)" : input.target === "db" ? "no (--target db)" : imagesOnlyMode ? "no (solo imágenes en /public)" : "no"
    }`,
  );
  console.log(
    `- escribió Neon (Prisma): ${
      input.target !== "db" || imagesOnlyMode ? "no" : input.dryRun ? "no (dry-run)" : dbWritten ? "sí" : "no"
    }`,
  );
  console.log(
    `- prioridad en la web para slug "${draft.slug}": con DATABASE_URL, la fila Neon publicada gana sobre el archivo (${
      Boolean(process.env.DATABASE_URL?.trim()) && (dbHasSlug || Boolean(neonPersist?.wroteDb))
        ? "hay o quedará fila en Neon tras esta ejecución"
        : "no hay DATABASE_URL o no hay fila"
    }).`,
  );
  console.log(
    "- próximos pasos: si quieres producción alineada con el intake y usaste --target file, vuelve a ejecutar con --target db (y --force si ya existe). Revisa Vercel/revalidación según tu despliegue.",
  );
  console.log(`- slug: ${persisted.slug}`);
  console.log(`- variable: ${persisted.variableName}`);
  console.log(`- confianza: ${report.confidence}`);
  if (report.intakeProvenance.intakeMode === "search_only") {
    console.log(
      "  (solo --name sin --maps/--instagram: confianza penalizada frente al modo con enlaces directos)",
    );
  }
  console.log(`- nombre busqueda usado: ${report.searchName}`);
  console.log(`- nombre final elegido: ${report.displayName}`);
  if (report.nameSource) console.log(`- fuente de nombre comercial: ${report.nameSource}`);
  console.log(`- categoría final: ${report.category}`);
  if (report.categoryReason) console.log(`- categoría razonada: ${report.categoryReason}`);
  console.log(`- encontrados: ${report.found.join(", ") || "ninguno"}`);
  console.log(`- por confirmar: ${report.pending.join(", ") || "ninguno"}`);
  console.log(`- maps elegido: ${draft.mapsUrl ?? "no encontrado"}`);
  if (report.mapsSourcePriority) {
    const priNote =
      report.mapsSourcePriority === "google_places"
        ? "google_places (Place Details / googleMapsUri)"
        : `${report.mapsSourcePriority} (cli > nominatim > ddg > fallback)`;
    console.log(`- maps fuente (prioridad): ${priNote}`);
  }
  if (report.mapsConfidence) {
    console.log(`- maps confianza: ${report.mapsConfidence}`);
  }
  console.log(`- maps razon: ${report.mapsChoiceReason ?? "sin match razonable"}`);
  if (report.coordinatesSource) {
    console.log(`- coordenadas tomadas de: ${report.coordinatesSource} (${draft.coordinates.lat}, ${draft.coordinates.lng})`);
  }
  console.log(`- instagram elegido: ${draft.instagramUrl ?? "no encontrado"}`);
  console.log(`- instagram razon: ${report.instagramChoiceReason ?? "sin match razonable"}`);
  console.log(`- ratings: promedio ${draft.ratings.average}, reseñas ${draft.ratings.reviewsCount}`);
  console.log(`- menú externo: ${draft.menu?.url ?? "(ninguno)"}${draft.menu?.label ? ` (${draft.menu.label})` : ""}`);
  if (report.placesIntakeMessages?.length) {
    console.log("- Google Places (log):");
    report.placesIntakeMessages.forEach((m) => console.log(`    ${m}`));
  }
  if (report.placesIntakeErrors?.length) {
    console.log("- Google Places (errores):");
    report.placesIntakeErrors.forEach((m) => console.log(`    ${m}`));
  }
  if (report.placesPhotoDownloadLog?.length) {
    console.log("- Google Place Photos (log):");
    report.placesPhotoDownloadLog.forEach((m) => console.log(`    ${m}`));
  }
  console.log(
    `- campos llenados desde Maps: ${[
      draft.mapsUrl ? "mapsUrl" : "",
      draft.address !== "Por confirmar" ? "address" : "",
      !(draft.coordinates.lat === 0 && draft.coordinates.lng === 0) ? "coordinates" : "",
    ]
      .filter(Boolean)
      .join(", ") || "ninguno"}`,
  );
  console.log(
    `- campos llenados desde Instagram: ${[
      draft.instagramUrl ? "instagramUrl" : "",
      draft.whatsapp !== "Por confirmar" ? "whatsapp" : "",
      draft.summary ? "summarySignals" : "",
    ]
      .filter(Boolean)
      .join(", ") || "ninguno"}`,
  );
  if (report.heroImageCandidateUrl) {
    console.log(
      `- imagen candidata pública: ${report.heroImageCandidateUrl} (source=${report.heroImageCandidateSource ?? "desconocida"})`,
    );
    console.log(`- imagen hero descarga: ${report.heroImageDownloaded ? "OK" : "no descargada"}`);
    console.log(`- imagen hero ruta local: ${report.heroImageLocalPath ?? "(sin ruta local)"}`);
    console.log(`- imagen hero detalle: ${report.heroImageReason ?? "(sin detalle)"}`);
    console.log(`- imágenes candidatas detectadas: ${report.imageCandidatesFound ?? 0}`);
    if (report.imageCandidatesDetected?.length) {
      console.log(`- candidatas por fuente: ${Object.entries(report.imageSourceCounts ?? {}).map(([k, v]) => `${k}=${v}`).join(", ") || "(sin fuentes)"}`);
      console.log("- URLs candidatas detectadas:");
      report.imageCandidatesDetected.forEach((c, i) => {
        console.log(`  ${i + 1}. [${c.source}] ${c.url}`);
      });
    }
    console.log(`- imágenes de galería descargadas: ${report.galleryImagesDownloaded ?? 0}`);
    console.log(`- URL seleccionada hero: ${report.selectedHeroUrl ?? "(ninguna)"}`);
    console.log(`- URLs seleccionadas gallery: ${(report.selectedGalleryUrls ?? []).join(", ") || "(ninguna)"}`);
    console.log(`- rutas gallery usadas: ${(report.galleryLocalPaths ?? []).join(", ") || "(ninguna)"}`);
    console.log(`- gallery detalle: ${report.galleryReason ?? "(sin detalle)"}`);
    if (!report.heroImageLocalPath && !report.galleryLocalPaths?.length) {
      console.log("- placeholder aplicado: sí (calidad/fuentes insuficientes para imágenes del negocio)");
    }
    if (report.imageDiscarded?.length) {
      console.log("- imágenes descartadas:");
      report.imageDiscarded.forEach((d, i) => {
        console.log(`  ${i + 1}. ${d.url} -> ${d.reason}`);
      });
    }
  }
  printIntakeProvenance(report.intakeProvenance);
  console.log(`- consultas maps: ${report.mapsCandidates.length}`);
  console.log(`- consultas instagram: ${report.instagramCandidates.length}`);
  printLinkPipelineSummary(report);
  printQueryExtractions("depuración búsqueda Maps", report.mapsCandidates, verboseSearch);
  printQueryExtractions("depuración búsqueda Instagram", report.instagramCandidates, verboseSearch);
  printScoredBlock(
    "top 3 maps (score)",
    report.mapsScoredTop,
    report.mapsCandidates,
    report.mapsScoredTop[0],
    report.mapsScoreThreshold,
    "Maps",
    report.linkPipeline.mapsScoredPool,
    report.linkPipeline.maps.stage,
    report.intakeProvenance.maps.origin,
  );
  printScoredBlock(
    "top 3 instagram (score)",
    report.instagramScoredTop,
    report.instagramCandidates,
    report.instagramScoredTop[0],
    report.instagramScoreThreshold,
    "Instagram",
    report.linkPipeline.instagramScoredPool,
    report.linkPipeline.instagram.stage,
    report.intakeProvenance.instagram.origin,
  );
  console.log(
    `- modo: ${input.dryRun ? "dry-run (sin escritura en disco; quita --dry-run para generar entries + index)" : "escritura real"}`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Error desconocido";
  console.error(`ERROR: ${message}`);
  process.exit(1);
});
