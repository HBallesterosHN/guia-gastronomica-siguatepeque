"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/require-admin";
import {
  createGuideSchema,
  saveGuideFullSchema,
  saveRestaurantGuideLinksSchema,
} from "@/lib/validations/admin-guide";

export type ActionResult = { ok: true } | { ok: false; message: string };

export type CreateGuideResult = { ok: true; slug: string } | { ok: false; message: string };

export async function createGuideAction(payload: unknown): Promise<CreateGuideResult> {
  await requirePlatformAdmin();
  const parsed = createGuideSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues.map((i) => i.message).join(" · ") };
  }
  const p = parsed.data;
  const clash = await prisma.guide.findUnique({ where: { slug: p.slug }, select: { id: true } });
  if (clash) {
    return { ok: false, message: `El slug «${p.slug}» ya existe. Elige otro.` };
  }
  try {
    await prisma.guide.create({
      data: {
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle,
        intro: p.intro,
        description: p.description,
        status: p.status,
        featured: p.featured,
        coverImageUrl: p.coverImageUrl,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
      },
    });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "No se pudo crear la guía." };
  }
  revalidatePath("/admin/guias");
  revalidatePath("/guias");
  revalidatePath(`/guias/${p.slug}`);
  return { ok: true, slug: p.slug };
}

export async function saveGuideFullAction(payload: unknown): Promise<ActionResult> {
  await requirePlatformAdmin();
  const parsed = saveGuideFullSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" · "),
    };
  }
  const p = parsed.data;

  const guide = await prisma.guide.findUnique({
    where: { slug: p.originalSlug },
    select: { id: true },
  });
  if (!guide) {
    return { ok: false, message: "No se encontró la guía en la base de datos." };
  }

  if (p.slug !== p.originalSlug) {
    const clash = await prisma.guide.findUnique({ where: { slug: p.slug }, select: { id: true } });
    if (clash) {
      return { ok: false, message: `El slug «${p.slug}» ya está en uso.` };
    }
  }

  const restaurantIds = [...new Set(p.entries.map((e) => e.restaurantId))];
  const restaurants = await prisma.restaurant.findMany({
    where: { id: { in: restaurantIds }, status: "published" },
    select: { id: true },
  });
  if (restaurants.length !== restaurantIds.length) {
    return { ok: false, message: "Uno o más restaurantes no existen o no están publicados." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.guide.update({
        where: { id: guide.id },
        data: {
          slug: p.slug,
          title: p.title,
          subtitle: p.subtitle,
          intro: p.intro,
          description: p.description,
          status: p.status,
          featured: p.featured,
          coverImageUrl: p.coverImageUrl,
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription,
        },
      });
      await tx.guideRestaurant.deleteMany({ where: { guideId: guide.id } });
      if (p.entries.length > 0) {
        await tx.guideRestaurant.createMany({
          data: p.entries.map((e) => ({
            guideId: guide.id,
            restaurantId: e.restaurantId,
            rank: e.rank,
            label: e.label,
            note: e.note,
          })),
        });
      }
    });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al guardar." };
  }

  revalidatePath("/admin/guias");
  revalidatePath("/guias");
  revalidatePath(`/guias/${p.originalSlug}`);
  revalidatePath(`/guias/${p.slug}`);
  revalidatePath("/");
  return { ok: true };
}

export async function saveRestaurantGuideLinksAction(payload: unknown): Promise<ActionResult> {
  await requirePlatformAdmin();
  const parsed = saveRestaurantGuideLinksSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues.map((i) => i.message).join(" · ") };
  }
  const { restaurantId, links } = parsed.data;

  const rest = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true, slug: true },
  });
  if (!rest) return { ok: false, message: "Restaurante no encontrado." };

  const selectedGuideIds = links.filter((l) => l.selected).map((l) => l.guideId);
  const guides = await prisma.guide.findMany({
    where: { id: { in: selectedGuideIds } },
    select: { id: true },
  });
  if (guides.length !== selectedGuideIds.length) {
    return { ok: false, message: "Una o más guías no existen." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.guideRestaurant.findMany({ where: { restaurantId } });
      await tx.guideRestaurant.deleteMany({ where: { restaurantId } });

      for (const l of links) {
        if (!l.selected) continue;
        const prev = before.find((b) => b.guideId === l.guideId);
        let rank = prev?.rank;
        if (rank === undefined) {
          const agg = await tx.guideRestaurant.aggregate({
            where: { guideId: l.guideId },
            _max: { rank: true },
          });
          rank = (agg._max.rank ?? -1) + 1;
        }
        await tx.guideRestaurant.create({
          data: {
            guideId: l.guideId,
            restaurantId,
            rank,
            label: l.label,
            note: l.note,
          },
        });
      }
    });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al guardar guías." };
  }

  revalidatePath("/admin/restaurantes");
  revalidatePath(`/admin/restaurantes/${encodeURIComponent(rest.slug)}/editar`);
  revalidatePath("/guias");
  for (const l of links) {
    const g = await prisma.guide.findUnique({ where: { id: l.guideId }, select: { slug: true } });
    if (g) revalidatePath(`/guias/${g.slug}`);
  }
  return { ok: true };
}
