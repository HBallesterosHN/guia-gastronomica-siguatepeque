import "server-only";

import type { Metadata } from "next";
import { getRestaurantBySlug } from "@/lib/restaurants";
import type { ResolvedGuidePage } from "@/lib/guides-data";
import { ogPublicImagePath } from "@/lib/og-metadata";
import { SITE_BRAND_NAME } from "@/lib/site-brand";

export async function buildGuidePageMetadata(resolved: ResolvedGuidePage): Promise<Metadata> {
  const canonicalPath = `/guias/${resolved.slug}`;
  const titleBase = resolved.seoTitle?.trim() || resolved.title;
  const title = `${titleBase} | ${SITE_BRAND_NAME}`;
  const description =
    resolved.seoDescription?.trim() ||
    resolved.description?.trim() ||
    resolved.intro.slice(0, 180) ||
    resolved.title;

  let images: { url: string; alt: string }[] | undefined;
  if (resolved.coverImageUrl?.trim()) {
    const u = resolved.coverImageUrl.trim();
    if (u.startsWith("https://")) {
      images = [{ url: u, alt: resolved.title }];
    } else if (u.startsWith("/")) {
      images = [{ url: ogPublicImagePath(u), alt: resolved.title }];
    }
  }
  if (!images) {
    const firstSlug = resolved.entries[0]?.restaurantSlug;
    const preview = firstSlug ? await getRestaurantBySlug(firstSlug) : undefined;
    const hero = preview?.media.hero;
    if (hero) {
      images = [{ url: ogPublicImagePath(hero), alt: preview.identity.name }];
    }
  }

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      locale: "es_HN",
      siteName: SITE_BRAND_NAME,
      title,
      description,
      url: canonicalPath,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((img) => img.url),
    },
  };
}
