import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  GUIDES_LIST_TAG,
  guideCacheTag,
  restaurantCacheTag,
  RESTAURANTS_LIST_TAG,
} from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

function revalidatePublicPath(path: string): void {
  revalidatePath(path, "layout");
  revalidatePath(path, "page");
}

/**
 * Invalida caché de rutas públicas y tags de datos tras cambios en un restaurante (admin, intake, etc.).
 */
export async function revalidateRestaurantPublicCache(input: {
  slug: string;
  previousSlug?: string | null;
  restaurantId?: string | null;
}): Promise<{ guideSlugs: string[] }> {
  const slug = input.slug.trim();
  const slugs = new Set<string>([slug]);
  const prev = input.previousSlug?.trim();
  if (prev && prev !== slug) slugs.add(prev);

  for (const s of slugs) {
    revalidateTag(restaurantCacheTag(s), "max");
    revalidatePublicPath(`/restaurantes/${s}`);
  }

  revalidateTag(RESTAURANTS_LIST_TAG, "max");
  revalidatePublicPath("/restaurantes");
  revalidatePublicPath("/");
  revalidateTag(GUIDES_LIST_TAG, "max");
  revalidatePublicPath("/guias");

  let restaurantId = input.restaurantId?.trim() || null;
  if (!restaurantId) {
    const row = await prisma.restaurant.findFirst({
      where: { slug: { in: [...slugs] } },
      select: { id: true },
    });
    restaurantId = row?.id ?? null;
  }

  const guideSlugs = new Set<string>();

  if (restaurantId) {
    const links = await prisma.guideRestaurant.findMany({
      where: { restaurantId },
      select: { guide: { select: { slug: true, status: true } } },
    });
    for (const l of links) {
      if (l.guide.status === "published") {
        guideSlugs.add(l.guide.slug);
      }
    }
  }

  for (const gSlug of guideSlugs) {
    revalidateTag(guideCacheTag(gSlug), "max");
    revalidatePublicPath(`/guias/${gSlug}`);
  }

  console.log(
    `[revalidate] restaurante ${slug}${prev && prev !== slug ? ` (antes ${prev})` : ""}: rutas /restaurantes/*, /, /guias; guías: ${guideSlugs.size > 0 ? [...guideSlugs].join(", ") : "ninguna"}`,
  );

  return { guideSlugs: [...guideSlugs] };
}

/** Invalida listado y ficha de una guía (cambios editoriales en admin). */
export function revalidateGuidePublicCache(slug: string, previousSlug?: string | null): void {
  const slugs = new Set<string>([slug.trim()]);
  const prev = previousSlug?.trim();
  if (prev && prev !== slug) slugs.add(prev);

  revalidateTag(GUIDES_LIST_TAG, "max");
  revalidatePublicPath("/guias");
  revalidatePublicPath("/");

  for (const g of slugs) {
    revalidateTag(guideCacheTag(g), "max");
    revalidatePublicPath(`/guias/${g}`);
  }
}
