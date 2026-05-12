import { getRestaurantBySlugFromFiles } from "@/lib/restaurants-file";
import {
  fetchDirectInstagramHints,
  fetchDirectMapsHints,
  guessNameFromGoogleMapsUrlPath,
  suggestedNameFromInstagramOgTitle,
} from "@/scripts/restaurant-intake/direct-fetch";
import { mergePlacesIntoSourceCandidates, runPlacesIntake } from "@/scripts/restaurant-intake/google-places";
import { resolveHeroImageCandidate } from "@/scripts/restaurant-intake/hero-image";
import { saveRestaurantImagesFromPlacePhotos } from "@/scripts/restaurant-intake/images";
import { displayNameFromSocialHandle, normalizeIntake, normalizeNameInput } from "@/scripts/restaurant-intake/normalize";
import { gatherSourceCandidates } from "@/scripts/restaurant-intake/sources";
import type { IntakeInput, IntakeReport, NormalizedDraft } from "@/scripts/restaurant-intake/types";
import { uploadImagesToCloudinary, uploadPlacePhotoMediaUrlsToCloudinary } from "./upload-images-to-cloudinary";

export type BuildRestaurantMediaMode = "cli-disk" | "cloudinary-direct";

export type BuildRestaurantFromSourcesOptions = {
  input: IntakeInput;
  mediaMode: BuildRestaurantMediaMode;
  /** Solo `cli-disk`: si true, no escribe imágenes en `public/` (dry-run del pipeline de fotos). */
  imageDryRun?: boolean;
};

function stripVersionFromMediaPath(pathWithVersion: string): string {
  const idx = pathWithVersion.indexOf("?");
  return idx === -1 ? pathWithVersion : pathWithVersion.slice(0, idx);
}

/**
 * Orquesta hints → fuentes → Places → normalización → imágenes (disco o Cloudinary directo).
 * No persiste archivos TS ni Neon; el caller decide persistencia.
 */
export async function buildRestaurantFromSources(
  opts: BuildRestaurantFromSourcesOptions,
): Promise<{ draft: NormalizedDraft; report: IntakeReport }> {
  const { input, mediaMode } = opts;
  const imageDryRun = Boolean(opts.imageDryRun);

  const [hintsMaps, hintsInsta] = await Promise.all([
    input.mapsUrlCli ? fetchDirectMapsHints(input.mapsUrlCli) : Promise.resolve(undefined),
    input.instagramUrlCli ? fetchDirectInstagramHints(input.instagramUrlCli) : Promise.resolve(undefined),
  ]);

  if (input.mapsUrlCli && !hintsMaps?.canonicalUrl) {
    throw new Error(`Maps no válido: ${(hintsMaps?.notes ?? []).join("; ") || "revisa el enlace"}`);
  }
  if (input.instagramUrlCli && !hintsInsta?.canonicalUrl) {
    throw new Error(`Instagram no válido: ${(hintsInsta?.notes ?? []).join("; ") || "revisa el enlace"}`);
  }

  const fromInsta =
    hintsInsta?.suggestedDisplayName ??
    (hintsInsta?.ogTitle ? suggestedNameFromInstagramOgTitle(hintsInsta.ogTitle) : undefined);

  const fromMapsPath = guessNameFromGoogleMapsUrlPath(input.mapsUrlCli ?? hintsMaps?.canonicalUrl ?? "");
  const fromMaps = hintsMaps?.placeTitle ?? fromMapsPath;

  const displayRaw =
    input.name?.trim() ||
    fromInsta ||
    fromMaps ||
    (hintsInsta?.handle ? displayNameFromSocialHandle(hintsInsta.handle) : undefined);

  if (!displayRaw) {
    throw new Error(
      "No se pudo determinar el nombre comercial. Añade nombre o usa Maps / Instagram con título o ruta /place/ legible.",
    );
  }

  const nameNorm = normalizeNameInput(displayRaw);

  const candidates = await gatherSourceCandidates(nameNorm, {
    directMapsUrl: input.mapsUrlCli,
    directInstagramUrl: input.instagramUrlCli,
    directHints: { maps: hintsMaps, instagram: hintsInsta },
  });

  let placesIntakeMessages: string[] = [];
  let placesIntakeErrors: string[] = [];
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (apiKey) {
    const pr = await runPlacesIntake({
      apiKey,
      nameNorm,
      mapsCanonicalUrl: hintsMaps?.canonicalUrl,
      mapsCoords: hintsMaps?.coords,
    });
    placesIntakeMessages = pr.report.messages;
    placesIntakeErrors = pr.report.httpErrors;
    mergePlacesIntoSourceCandidates(candidates, pr.details, { categoryProvided: input.categoryProvided });
  }

  const { draft, report } = normalizeIntake(input, nameNorm, candidates);
  if (input.slug) {
    draft.slug = input.slug;
  }

  const existingBeforePersist = getRestaurantBySlugFromFiles(draft.slug);
  if (input.textOnly && input.slug) {
    const existing = getRestaurantBySlugFromFiles(input.slug);
    if (!existing) {
      throw new Error(`No existe restaurante con slug "${input.slug}" para text-only.`);
    }
    draft.hero = stripVersionFromMediaPath(existing.media.hero);
    draft.gallery = (existing.media.gallery ?? []).map(stripVersionFromMediaPath);
  }
  if (existingBeforePersist?.menu && !draft.menu) {
    draft.menu = existingBeforePersist.menu;
  }
  if (existingBeforePersist?.profileStatus) {
    draft.profileStatus = existingBeforePersist.profileStatus;
  } else {
    draft.profileStatus = { source: "auto", verified: false };
  }
  report.placesIntakeMessages = placesIntakeMessages;
  report.placesIntakeErrors = placesIntakeErrors;

  const photoNames = candidates.placesPhotoResources ?? [];
  let placesPhotoDownloadLog: string[] = [];

  let heroResult: Awaited<ReturnType<typeof resolveHeroImageCandidate>> = {
    downloaded: false,
    galleryPublicPaths: [],
    candidatesFound: 0,
    downloadedCount: 0,
    discarded: [],
    selectedGalleryUrls: [],
    reason: "(pendiente)",
  };
  let imagesFromPlaces = false;

  if (mediaMode === "cloudinary-direct") {
    if (!input.textOnly && apiKey && photoNames.length) {
      const prc = await uploadPlacePhotoMediaUrlsToCloudinary(draft.slug, photoNames, apiKey);
      placesPhotoDownloadLog = [...prc.log, ...prc.errors.map((e) => `ERROR ${e}`)];
      if (prc.hero) {
        draft.hero = prc.hero;
        draft.gallery = prc.gallery;
        imagesFromPlaces = true;
        heroResult = {
          downloaded: true,
          galleryPublicPaths: prc.gallery,
          candidatesFound: photoNames.length,
          downloadedCount: 1 + prc.gallery.length,
          discarded: prc.errors.map((reason, i) => ({ url: `places-photo#${i + 1}`, reason })),
          selectedHeroUrl: prc.selectedUrls[0],
          selectedGalleryUrls: prc.selectedUrls.slice(1),
          reason: "Subidas vía Place Photos → Cloudinary.",
        };
      }
    }

    if (!input.textOnly && !imagesFromPlaces) {
      const origins = candidates.imageCandidateOrigins?.length
        ? candidates.imageCandidateOrigins
        : report.heroImageCandidateUrl
          ? [{ url: report.heroImageCandidateUrl, source: report.heroImageCandidateSource ?? "unknown" }]
          : [];

      const httpsUrls = origins
        .map((o) => o.url.trim())
        .filter((u) => u.startsWith("https://"))
        .slice(0, 11);

      if (httpsUrls.length) {
        const heroUrl = httpsUrls[0]!;
        const rest = httpsUrls.slice(1, 11);
        const upHero = await uploadImagesToCloudinary(draft.slug, [heroUrl]);
        const upGal =
          rest.length > 0 ? await uploadImagesToCloudinary(draft.slug, rest.slice(0, 10)) : { urls: [], errors: [] };

        if (upHero.urls[0]) {
          draft.hero = upHero.urls[0]!;
          draft.gallery = upGal.urls;
          heroResult = {
            downloaded: true,
            galleryPublicPaths: draft.gallery,
            candidatesFound: origins.length,
            downloadedCount: 1 + draft.gallery.length,
            discarded: [...upHero.errors, ...upGal.errors].map((r) => ({ url: "https", reason: r })),
            selectedHeroUrl: heroUrl,
            selectedGalleryUrls: rest,
            reason: "Candidatas https → Cloudinary (sin disco).",
          };
        } else {
          heroResult = {
            downloaded: false,
            galleryPublicPaths: [],
            candidatesFound: origins.length,
            downloadedCount: 0,
            discarded: upHero.errors.map((r) => ({ url: heroUrl, reason: r })),
            selectedGalleryUrls: [],
            reason: upHero.errors[0] ?? "No se pudo subir hero a Cloudinary.",
          };
        }
      } else {
        heroResult = await resolveHeroImageCandidate(
          draft.slug,
          origins,
          true,
          input.imagesScope,
        );
        heroResult = {
          ...heroResult,
          reason: `${heroResult.reason} (modo servidor: sin candidatas https; hero sigue placeholder).`,
        };
      }
    }
  } else if (!input.textOnly && apiKey && photoNames.length) {
    const prPhotos = await saveRestaurantImagesFromPlacePhotos(
      draft.slug,
      photoNames,
      apiKey,
      imageDryRun,
      input.imagesScope,
    );
    placesPhotoDownloadLog = [...prPhotos.log, ...prPhotos.errors.map((e) => `ERROR ${e}`)];
    heroResult = {
      downloaded: prPhotos.downloaded,
      heroPublicPath: prPhotos.heroPublicPath,
      galleryPublicPaths: prPhotos.galleryPublicPaths,
      candidatesFound: photoNames.length,
      downloadedCount: prPhotos.downloaded ? 1 + prPhotos.galleryPublicPaths.length : 0,
      discarded: prPhotos.errors.map((reason, i) => ({ url: `places-photo#${i + 1}`, reason })),
      selectedHeroUrl: prPhotos.selectedUrls[0],
      selectedGalleryUrls: prPhotos.selectedUrls.slice(1),
      reason: prPhotos.downloaded
        ? "Descargadas vía Google Place Photos (New)."
        : imageDryRun
          ? "Dry-run: rutas proyectadas para Place Photos (sin escritura)."
          : prPhotos.errors[0] ?? "Place Photos no produjo un hero descargable.",
    };
    if ((input.imagesScope === "all" || input.imagesScope === "hero") && prPhotos.heroPublicPath) {
      draft.hero = prPhotos.heroPublicPath;
    }
    if (input.imagesScope === "all" || input.imagesScope === "gallery") {
      draft.gallery = prPhotos.galleryPublicPaths;
    }

    if (
      input.imagesScope === "all" &&
      draft.gallery.length < 10 &&
      (candidates.imageCandidateOrigins?.length ?? 0) > 0
    ) {
      const missing = 10 - draft.gallery.length;
      const topUp = await resolveHeroImageCandidate(
        draft.slug,
        candidates.imageCandidateOrigins ?? [],
        imageDryRun,
        "gallery",
        draft.gallery.length + 1,
        missing,
      );
      if (topUp.galleryPublicPaths.length) {
        const merged = Array.from(new Set([...draft.gallery, ...topUp.galleryPublicPaths]));
        draft.gallery = merged.slice(0, 10);
        heroResult.discarded = [...heroResult.discarded, ...topUp.discarded];
        heroResult.selectedGalleryUrls = [...heroResult.selectedGalleryUrls, ...topUp.selectedGalleryUrls];
        heroResult.galleryPublicPaths = draft.gallery;
        heroResult.downloadedCount =
          (heroResult.heroPublicPath ? 1 : 0) + heroResult.galleryPublicPaths.length;
      }
    }
    if (input.imagesScope === "all" && draft.gallery.length < 10 && heroResult.selectedHeroUrl) {
      const missing = 10 - draft.gallery.length;
      const heroAsGallery = await resolveHeroImageCandidate(
        draft.slug,
        [{ url: heroResult.selectedHeroUrl, source: "places:hero-fallback" }],
        imageDryRun,
        "gallery",
        draft.gallery.length + 1,
        missing,
      );
      if (heroAsGallery.galleryPublicPaths.length) {
        const merged = Array.from(new Set([...draft.gallery, ...heroAsGallery.galleryPublicPaths]));
        draft.gallery = merged.slice(0, 10);
        heroResult.discarded = [...heroResult.discarded, ...heroAsGallery.discarded];
        heroResult.selectedGalleryUrls = [...heroResult.selectedGalleryUrls, ...heroAsGallery.selectedGalleryUrls];
        heroResult.galleryPublicPaths = draft.gallery;
        heroResult.downloadedCount =
          (heroResult.heroPublicPath ? 1 : 0) + heroResult.galleryPublicPaths.length;
      }
    }
    imagesFromPlaces = Boolean(
      prPhotos.galleryPublicPaths.length ||
        ((input.imagesScope === "all" || input.imagesScope === "hero") && prPhotos.heroPublicPath),
    );
  }

  if (mediaMode === "cli-disk" && !input.textOnly && !imagesFromPlaces) {
    if (apiKey && photoNames.length) {
      placesPhotoDownloadLog.push("Place Photos sin hero utilible → fallback Maps/Instagram.");
    }
    heroResult = await resolveHeroImageCandidate(
      draft.slug,
      candidates.imageCandidateOrigins ??
        (report.heroImageCandidateUrl
          ? [{ url: report.heroImageCandidateUrl, source: report.heroImageCandidateSource ?? "unknown" }]
          : []),
      imageDryRun,
      input.imagesScope,
    );
    if ((input.imagesScope === "all" || input.imagesScope === "hero") && heroResult.heroPublicPath) {
      draft.hero = heroResult.heroPublicPath;
    }
    if (input.imagesScope === "all" || input.imagesScope === "gallery") {
      draft.gallery = heroResult.galleryPublicPaths;
    } else if (input.imagesScope === "hero") {
      /* no mutar gallery */
    }
  }

  report.heroImageDownloaded = heroResult.downloaded;
  report.heroImageLocalPath = heroResult.heroPublicPath;
  report.heroImageReason = heroResult.reason;
  report.imageCandidatesFound = heroResult.candidatesFound;
  report.galleryImagesDownloaded = heroResult.galleryPublicPaths.length;
  report.galleryLocalPaths = heroResult.galleryPublicPaths;
  report.imageDiscarded = heroResult.discarded;
  report.selectedHeroUrl = heroResult.selectedHeroUrl;
  report.selectedGalleryUrls = heroResult.selectedGalleryUrls;
  report.imageCandidatesDetected = candidates.imageCandidateOrigins ?? [];
  report.imageSourceCounts = (candidates.imageCandidateOrigins ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.source] = (acc[c.source] ?? 0) + 1;
    return acc;
  }, {});
  report.galleryReason =
    heroResult.galleryPublicPaths.length > 0
      ? `Se procesaron ${heroResult.galleryPublicPaths.length} imágenes para galería.`
      : "Gallery vacía o solo URLs remotas según modo.";
  if (placesPhotoDownloadLog.length) {
    report.placesPhotoDownloadLog = placesPhotoDownloadLog;
  }
  if (input.textOnly) {
    report.heroImageReason = "Omitido por text-only.";
    report.galleryReason = "Omitido por text-only; se conserva media existente.";
  }

  return { draft, report };
}
