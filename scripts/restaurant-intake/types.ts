import type { RestaurantCategory } from "../../types/restaurant";

export type IntakeInput = {
  /** Opcional si hay --maps y/o --instagram con datos suficientes para inferir el nombre. */
  name?: string;
  category: RestaurantCategory;
  categoryProvided?: boolean;
  dryRun: boolean;
  mapsUrlCli?: string;
  instagramUrlCli?: string;
};

export type IntakeMode = "search_only" | "direct_cli";

export type ChannelProvenance = {
  origin: "none" | "cli" | "search" | "nominatim" | "fallback";
  /** Origen de datos (p. ej. maps_url_cli, nominatim_reverse, ddg_scoring). */
  dataFrom: string[];
};

/** Fuente que definió la URL final de Google Maps (prioridad: cli > nominatim > ddg > fallback). */
export type MapsSourcePriority = "cli" | "nominatim" | "ddg" | "fallback" | "google_places";

export type MapsConfidence = "alta" | "media" | "baja";

export type IntakeProvenanceReport = {
  intakeMode: IntakeMode;
  maps: ChannelProvenance;
  instagram: ChannelProvenance;
  /** Notas operativas (extractos fallidos, pistas sin escribir en el draft). */
  sourceNotes: string[];
};

export type NameNormalization = {
  original: string;
  searchName: string;
  displayName: string;
  slugBase: string;
  searchVariants: string[];
};

export type DiscardedSearchLink = {
  raw: string;
  reason: string;
};

/** Una respuesta HTML de búsqueda y su extracción de enlaces (antes del scoring). */
export type SearchQueryExtraction = {
  requestUrl: string;
  status: number;
  htmlLength: number;
  signals: string[];
  /** Fragmento del HTML útil para depurar (no el documento completo). */
  htmlPreview: string;
  rawFromAnchors: string[];
  rawFromUddgFallback: string[];
  mergedRaw: string[];
  normalizedUrls: string[];
  discarded: DiscardedSearchLink[];
  domainCounts: Record<string, number>;
};

export type CandidateDebug = {
  query: string;
  /** URLs normalizadas listas para filtrar por dominio / scoring (dedupe). */
  links: string[];
  extraction: SearchQueryExtraction;
};

/** Candidato con score y desglose para reporte y umbral. */
export type ScoredCandidate = {
  url: string;
  score: number;
  query: string;
  breakdown: string[];
};

/** Estado de la tubería extracción → dominios objetivo (Maps / Instagram). */
export type LinkChannelStage = "ok" | "bot_wall" | "no_raw_hrefs" | "no_target_domains";

export type LinkPipelineReport = {
  maps: { stage: LinkChannelStage; totalRaw: number; totalNormalized: number; mapsLikeCount: number };
  instagram: {
    stage: LinkChannelStage;
    totalRaw: number;
    totalNormalized: number;
    instagramLikeCount: number;
  };
  /** Candidatos Maps con score (dedupe por URL), ordenados. Recortado en fuente si hay muchos. */
  mapsScoredPool: ScoredCandidate[];
  instagramScoredPool: ScoredCandidate[];
};

export type SourceCandidates = {
  intakeMode: IntakeMode;
  provenance: {
    maps: ChannelProvenance;
    instagram: ChannelProvenance;
  };
  sourceNotes: string[];
  /** Fuente efectiva de la URL de Maps tras el pipeline híbrido. */
  mapsSourcePriority?: MapsSourcePriority;
  mapsConfidence?: MapsConfidence;
  /** Texto para copy.summary del borrador (sin inventar más allá de fuentes). */
  summaryDraft?: string;
  /** WhatsApp distinto del teléfono principal si se detectó wa.me en bio. */
  whatsappHint?: string;
  /** Nombre comercial preferido según fuentes directas. */
  preferredName?: string;
  preferredNameSource?: "maps" | "instagram" | "input" | "inferred" | "google_places";
  /** Username de Instagram cuando se pudo leer. */
  instagramHandle?: string;
  /** Categoría inferida y explicación (si no se forzó --category). */
  inferredCategory?: RestaurantCategory;
  inferredCategoryReason?: string;
  /** Fuente exacta de coordenadas elegidas. */
  coordinatesSource?:
    | "maps_url_3d4d"
    | "maps_url_at"
    | "maps_query_ll"
    | "maps_html_heuristic"
    | "nominatim"
    | "google_places";
  /** Imagen pública candidata (si aparece en metadatos). */
  heroImageCandidateUrl?: string;
  heroImageCandidateSource?: "maps_og_image" | "instagram_og_image";
  imageCandidateUrls?: string[];
  imageCandidateOrigins?: Array<{ url: string; source: string }>;
  mapsUrl?: string;
  instagramUrl?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  phone?: string;
  hours?: string;
  hoursStructured?: Array<{ day: string; open: string; close: string }>;
  references: string[];
  mapsChoiceReason?: string;
  instagramChoiceReason?: string;
  /** Nombre oficial desde Place Details (displayName). */
  officialPlacesName?: string;
  googlePlacesTypes?: string[];
  placesResourceName?: string;
  ratingsAverage?: number;
  ratingsReviewsCount?: number;
  /** Recursos `places/.../photos/...` para Place Photos API. */
  placesPhotoResources?: string[];
  /** Top candidatos tras deduplicar y ordenar por score (típicamente 3). */
  mapsScoredTop: ScoredCandidate[];
  instagramScoredTop: ScoredCandidate[];
  mapsScoreThreshold: number;
  instagramScoreThreshold: number;
  debug: {
    mapsQueries: CandidateDebug[];
    instagramQueries: CandidateDebug[];
    linkPipeline: LinkPipelineReport;
  };
};

export type NormalizedDraft = {
  name: string;
  slug: string;
  category: RestaurantCategory;
  mapsUrl?: string;
  instagramUrl?: string;
  address: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  whatsapp: string;
  hours: string;
  hoursStructured?: Array<{ day: string; open: string; close: string }>;
  /** Resumen corto para la ficha (copy.summary). */
  summary: string;
  /** Hero local en /public (placeholder o descargado). */
  hero: string;
  /** Gallery local (0..4 rutas). */
  gallery: string[];
  notes: string;
  references: string[];
  ratings: { average: number; reviewsCount: number };
};

export type IntakeReport = {
  found: string[];
  pending: string[];
  confidence: "baja" | "media" | "alta";
  searchName: string;
  displayName: string;
  mapsChoiceReason?: string;
  instagramChoiceReason?: string;
  mapsCandidates: CandidateDebug[];
  instagramCandidates: CandidateDebug[];
  mapsScoredTop: ScoredCandidate[];
  instagramScoredTop: ScoredCandidate[];
  mapsScoreThreshold: number;
  instagramScoreThreshold: number;
  linkPipeline: LinkPipelineReport;
  intakeProvenance: IntakeProvenanceReport;
  mapsSourcePriority?: MapsSourcePriority;
  mapsConfidence?: MapsConfidence;
  category: RestaurantCategory;
  categoryReason?: string;
  coordinatesSource?: SourceCandidates["coordinatesSource"];
  heroImageCandidateUrl?: string;
  heroImageCandidateSource?: SourceCandidates["heroImageCandidateSource"];
  heroImageDownloaded?: boolean;
  heroImageLocalPath?: string;
  heroImageReason?: string;
  imageCandidatesFound?: number;
  galleryImagesDownloaded?: number;
  galleryLocalPaths?: string[];
  galleryReason?: string;
  imageCandidatesDetected?: Array<{ url: string; source: string }>;
  imageSourceCounts?: Record<string, number>;
  imageDiscarded?: Array<{ url: string; reason: string }>;
  selectedHeroUrl?: string;
  selectedGalleryUrls?: string[];
  nameSource?: SourceCandidates["preferredNameSource"];
  /** Registro operativo de Google Places (API New). */
  placesIntakeMessages?: string[];
  placesIntakeErrors?: string[];
  placesPhotoDownloadLog?: string[];
};
