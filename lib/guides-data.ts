/**
 * Guías públicas: Neon (Guide + GuideRestaurant) con prioridad sobre definiciones en código.
 */
import "server-only";

import type { Guide, GuideRestaurant } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  FILE_GUIDE_DEFINITIONS,
  getFileGuideBySlug,
  type FileGuideDefinition,
} from "@/lib/guides-file-fallback";

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export type GuideListItem = {
  slug: string;
  title: string;
  description: string;
  featured: boolean;
  updatedAt: Date;
  source: "db" | "file";
  restaurantCount: number;
};

export type GuideDetailEntry = {
  rank: number;
  restaurantSlug: string;
  label?: string | null;
  note?: string | null;
  emoji?: string;
  headline?: string | null;
};

export type ResolvedGuidePage = {
  slug: string;
  title: string;
  subtitle?: string | null;
  intro: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  coverImageUrl?: string | null;
  featured: boolean;
  source: "db" | "file";
  entries: GuideDetailEntry[];
};

export type HomeFeaturedGuide = {
  title: string;
  description: string;
  href: string;
};

function mapFileToListItem(g: FileGuideDefinition): GuideListItem {
  return {
    slug: g.slug,
    title: g.title,
    description: g.description,
    featured: g.featured,
    updatedAt: new Date(0),
    source: "file",
    restaurantCount: g.entries.length,
  };
}

function mapDbGuideToListItem(
  g: Guide & { _count?: { guideRestaurants: number } },
  count: number,
): GuideListItem {
  return {
    slug: g.slug,
    title: g.title,
    description:
      g.description?.trim() ||
      g.subtitle?.trim() ||
      (g.intro?.trim() ? g.intro.trim().slice(0, 200) : "") ||
      "",
    featured: g.featured,
    updatedAt: g.updatedAt,
    source: "db",
    restaurantCount: count,
  };
}

function mapFileToResolved(g: FileGuideDefinition): ResolvedGuidePage {
  return {
    slug: g.slug,
    title: g.title,
    subtitle: g.subtitle ?? null,
    intro: g.intro,
    description: g.description,
    seoTitle: g.seoTitle ?? null,
    seoDescription: g.seoDescription ?? null,
    coverImageUrl: g.coverImageUrl ?? null,
    featured: g.featured,
    source: "file",
    entries: g.entries.map((e) => ({
      rank: e.rank,
      restaurantSlug: e.restaurantSlug,
      label: e.label,
      note: e.note,
      emoji: e.emoji,
      headline: e.headline ?? null,
    })),
  };
}

function mapDbToResolved(
  g: Guide & {
    guideRestaurants: (GuideRestaurant & { restaurant: { slug: string; name: string } })[];
  },
): ResolvedGuidePage {
  const entries = [...g.guideRestaurants]
    .sort((a, b) => a.rank - b.rank || a.createdAt.getTime() - b.createdAt.getTime())
    .map((gr) => ({
      rank: gr.rank,
      restaurantSlug: gr.restaurant.slug,
      label: gr.label,
      note: gr.note,
      emoji: undefined as string | undefined,
      headline: null as string | null,
    }));
  return {
    slug: g.slug,
    title: g.title,
    subtitle: g.subtitle,
    intro: g.intro?.trim() || "",
    description: g.description,
    seoTitle: g.seoTitle,
    seoDescription: g.seoDescription,
    coverImageUrl: g.coverImageUrl,
    featured: g.featured,
    source: "db",
    entries,
  };
}

/** Une listas: si hay guía en DB con el mismo slug, gana DB (solo published con al menos un restaurante en listado). */
export async function mergeDbGuidesWithFileGuides(): Promise<GuideListItem[]> {
  const bySlug = new Map<string, GuideListItem>();

  if (hasDatabaseUrl()) {
    try {
      const rows = await prisma.guide.findMany({
        where: { status: "published" },
        include: {
          _count: { select: { guideRestaurants: true } },
        },
      });
      for (const g of rows) {
        const n = g._count.guideRestaurants;
        if (n === 0) continue;
        bySlug.set(g.slug, mapDbGuideToListItem(g, n));
      }
    } catch (e) {
      console.error("[guides-data] Error leyendo guías en DB:", e);
    }
  }

  for (const f of FILE_GUIDE_DEFINITIONS) {
    if (!bySlug.has(f.slug)) {
      bySlug.set(f.slug, mapFileToListItem(f));
    }
  }

  const list = [...bySlug.values()];
  list.sort((a, b) => {
    const fa = a.featured ? 1 : 0;
    const fb = b.featured ? 1 : 0;
    if (fa !== fb) return fb - fa;
    const ta = a.updatedAt.getTime();
    const tb = b.updatedAt.getTime();
    if (ta !== tb) return tb - ta;
    return a.title.localeCompare(b.title, "es");
  });
  return list;
}

export async function getAllGuides(): Promise<GuideListItem[]> {
  return mergeDbGuidesWithFileGuides();
}

export async function getPublishedGuides(): Promise<GuideListItem[]> {
  return mergeDbGuidesWithFileGuides();
}

export async function getFeaturedGuides(limit = 6): Promise<GuideListItem[]> {
  const merged = await mergeDbGuidesWithFileGuides();
  const featured = merged.filter((g) => g.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  const rest = merged.filter((g) => !g.featured);
  return [...featured, ...rest].slice(0, limit);
}

export async function getHomeFeaturedGuides(limit = 6): Promise<HomeFeaturedGuide[]> {
  const items = await getFeaturedGuides(limit);
  return items.map((g) => ({
    title: g.title,
    description: g.description,
    href: `/guias/${encodeURIComponent(g.slug)}`,
  }));
}

export async function getPublishedGuideSlugs(): Promise<string[]> {
  const list = await mergeDbGuidesWithFileGuides();
  return list.map((g) => g.slug);
}

/**
 * Ficha pública: DB published gana sobre archivo. Borrador u oculta en DB no hace fallback a archivo.
 */
export async function getGuideBySlug(slug: string): Promise<ResolvedGuidePage | null> {
  if (hasDatabaseUrl()) {
    try {
      const row = await prisma.guide.findUnique({
        where: { slug },
        include: {
          guideRestaurants: {
            include: { restaurant: { select: { slug: true, name: true } } },
          },
        },
      });
      if (row) {
        if (row.status !== "published") return null;
        return mapDbToResolved(row);
      }
    } catch (e) {
      console.error("[guides-data] getGuideBySlug DB:", e);
    }
  }

  const file = getFileGuideBySlug(slug);
  if (file) return mapFileToResolved(file);
  return null;
}

export async function getOtherPublishedGuideSummaries(
  excludeSlug: string,
): Promise<{ slug: string; title: string }[]> {
  const all = await mergeDbGuidesWithFileGuides();
  return all.filter((g) => g.slug !== excludeSlug).map((g) => ({ slug: g.slug, title: g.title }));
}

/** Admin: todas las filas Guide en DB (cualquier status). */
export async function getAllGuidesFromDatabase(): Promise<
  (Guide & { _count: { guideRestaurants: number } })[]
> {
  if (!hasDatabaseUrl()) return [];
  return prisma.guide.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { guideRestaurants: true } } },
  });
}

export type GuideRestaurantAdminRow = GuideRestaurant & {
  restaurant: {
    id: string;
    slug: string;
    name: string;
    category: string;
    summary: string | null;
    ratingAverage: number;
    reviewsCount: number;
    scheduleLabel: string | null;
    address: string | null;
    menuUrl: string | null;
    instagramUrl: string | null;
  };
};

export async function getGuideBySlugForAdmin(
  slug: string,
): Promise<(Guide & { guideRestaurants: GuideRestaurantAdminRow[] }) | null> {
  if (!hasDatabaseUrl()) return null;
  return prisma.guide.findUnique({
    where: { slug },
    include: {
      guideRestaurants: {
        orderBy: [{ rank: "asc" }, { createdAt: "asc" }],
        include: {
          restaurant: {
            select: {
              id: true,
              slug: true,
              name: true,
              category: true,
              summary: true,
              ratingAverage: true,
              reviewsCount: true,
              scheduleLabel: true,
              address: true,
              menuUrl: true,
              instagramUrl: true,
            },
          },
        },
      },
    },
  });
}

export async function listPublishedRestaurantsForPicker(): Promise<
  {
    id: string;
    slug: string;
    name: string;
    category: string;
    summary: string | null;
    ratingAverage: number;
    reviewsCount: number;
    scheduleLabel: string | null;
    address: string | null;
    menuUrl: string | null;
    instagramUrl: string | null;
  }[]
> {
  if (!hasDatabaseUrl()) return [];
  return prisma.restaurant.findMany({
    where: { status: "published" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      summary: true,
      ratingAverage: true,
      reviewsCount: true,
      scheduleLabel: true,
      address: true,
      menuUrl: true,
      instagramUrl: true,
    },
  });
}

export async function getGuideMembershipsForRestaurant(
  restaurantId: string,
): Promise<{ guideId: string; slug: string; title: string; label: string | null; note: string | null }[]> {
  if (!hasDatabaseUrl()) return [];
  const links = await prisma.guideRestaurant.findMany({
    where: { restaurantId },
    include: { guide: { select: { slug: true, title: true } } },
  });
  return links.map((l) => ({
    guideId: l.guideId,
    slug: l.guide.slug,
    title: l.guide.title,
    label: l.label,
    note: l.note,
  }));
}

export async function listAllGuidesForRestaurantEditor(): Promise<
  { id: string; slug: string; title: string; status: string }[]
> {
  if (!hasDatabaseUrl()) return [];
  return prisma.guide.findMany({
    orderBy: { title: "asc" },
    select: { id: true, slug: true, title: true, status: true },
  });
}

/** Mapeo explícito de fila Prisma (+ relaciones) al modelo de ficha pública. */
export function mapDbGuideToGuide(
  row: Guide & {
    guideRestaurants: (GuideRestaurant & { restaurant: { slug: string; name: string } })[];
  },
): ResolvedGuidePage {
  return mapDbToResolved(row);
}
