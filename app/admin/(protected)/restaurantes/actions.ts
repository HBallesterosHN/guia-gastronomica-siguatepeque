"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mapFileRestaurantToPrismaCreate } from "@/lib/restaurant-db-bootstrap";
import { requirePlatformAdmin } from "@/lib/require-admin";
import { getRestaurantBySlugFromFiles } from "@/lib/restaurants-file";

export async function importRestaurantFromFileToDbAction(slug: string): Promise<void> {
  await requirePlatformAdmin();
  const s = slug.trim();
  if (!/^[a-z0-9-]+$/.test(s)) {
    throw new Error("Slug inválido.");
  }
  const exists = await prisma.restaurant.findUnique({ where: { slug: s } });
  if (exists) {
    redirect(`/admin/restaurantes/${encodeURIComponent(s)}/editar`);
  }
  const file = getRestaurantBySlugFromFiles(s);
  if (!file) {
    throw new Error("No hay entrada en data/restaurants para ese slug.");
  }
  await prisma.restaurant.create({
    data: {
      ...mapFileRestaurantToPrismaCreate(file),
      source: "manual",
      verified: false,
      status: "published",
    },
  });
  revalidatePath("/admin/restaurantes");
  revalidatePath("/restaurantes");
  revalidatePath(`/restaurantes/${s}`);
  revalidatePath("/");
  redirect(`/admin/restaurantes/${encodeURIComponent(s)}/editar`);
}
