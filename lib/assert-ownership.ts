import "server-only";

import { prisma } from "@/lib/prisma";

export async function userOwnsRestaurantSlug(
  userId: string,
  slug: string,
): Promise<{ restaurantId: string } | null> {
  const row = await prisma.restaurantOwnership.findFirst({
    where: {
      userId,
      status: "active",
      restaurant: { slug },
    },
    select: { restaurantId: true },
  });
  return row ? { restaurantId: row.restaurantId } : null;
}
