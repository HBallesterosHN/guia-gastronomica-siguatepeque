/**
 * Idempotente: crea/actualiza Guide y GuideRestaurant desde lib/guides-file-fallback.
 * Requiere DATABASE_URL y que los restaurantes existan en Neon (por slug).
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { FILE_GUIDE_DEFINITIONS } from "../lib/guides-file-fallback";

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL no está definido.");
  }

  for (const def of FILE_GUIDE_DEFINITIONS) {
    const guide = await prisma.guide.upsert({
      where: { slug: def.slug },
      create: {
        slug: def.slug,
        title: def.title,
        subtitle: def.subtitle ?? null,
        intro: def.intro,
        description: def.description,
        status: "published",
        featured: def.featured,
        coverImageUrl: def.coverImageUrl ?? null,
        seoTitle: def.seoTitle ?? null,
        seoDescription: def.seoDescription ?? null,
      },
      update: {
        title: def.title,
        subtitle: def.subtitle ?? null,
        intro: def.intro,
        description: def.description,
        featured: def.featured,
        coverImageUrl: def.coverImageUrl ?? null,
        seoTitle: def.seoTitle ?? null,
        seoDescription: def.seoDescription ?? null,
      },
    });

    const sortedEntries = [...def.entries].sort((a, b) => a.rank - b.rank);

    for (const e of sortedEntries) {
      const rest = await prisma.restaurant.findUnique({
        where: { slug: e.restaurantSlug },
        select: { id: true },
      });
      if (!rest) {
        console.warn(`[guides:migrate] Sin restaurante en DB para slug «${e.restaurantSlug}» (guía ${def.slug}).`);
        continue;
      }

      await prisma.guideRestaurant.upsert({
        where: {
          guideId_restaurantId: { guideId: guide.id, restaurantId: rest.id },
        },
        create: {
          guideId: guide.id,
          restaurantId: rest.id,
          rank: e.rank,
          label: e.label,
          note: e.note,
        },
        update: {
          rank: e.rank,
          label: e.label,
          note: e.note,
        },
      });
    }

    console.log(`[guides:migrate] OK «${def.slug}» (${sortedEntries.length} entradas en archivo).`);
  }

  console.log("[guides:migrate] Completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
