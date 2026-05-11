import type { Metadata } from "next";
import { getRestaurantBySlug } from "@/lib/restaurants-data";
import { ogPublicImagePath } from "@/lib/og-metadata";
import { SITE_BRAND_NAME } from "@/lib/site-brand";

export async function guidePageMetadata(input: {
  canonicalPath: string;
  titleShort: string;
  description: string;
  /** Primer local listado en la guía (imagen OG si existe ficha). */
  previewSlug?: string;
}): Promise<Metadata> {
  const title = `${input.titleShort} | ${SITE_BRAND_NAME}`;
  const preview = input.previewSlug ? await getRestaurantBySlug(input.previewSlug) : undefined;
  const hero = preview?.media.hero;
  const images =
    hero != null && preview
      ? [{ url: ogPublicImagePath(hero), alt: preview.identity.name }]
      : undefined;

  return {
    title,
    description: input.description,
    alternates: { canonical: input.canonicalPath },
    openGraph: {
      type: "article",
      locale: "es_HN",
      siteName: SITE_BRAND_NAME,
      title,
      description: input.description,
      url: input.canonicalPath,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description,
      images: images?.map((img) => img.url),
    },
  };
}
