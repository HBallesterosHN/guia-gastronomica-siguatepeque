"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  applyApprovedChangesToRestaurant,
  parseImageAssetsJson,
  parseOwnerChangesJson,
} from "@/lib/apply-owner-changes";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/require-admin";

export async function approveChangeRequestAction(requestId: string, _formData: FormData): Promise<void> {
  await requirePlatformAdmin();

  const row = await prisma.restaurantChangeRequest.findUnique({ where: { id: requestId } });
  if (!row) redirect("/admin/cambios?error=not_found");
  if (row.status !== "pending") {
    redirect(`/admin/cambios/${requestId}?error=already`);
  }

  const changes = parseOwnerChangesJson(row.changes);
  const images = parseImageAssetsJson(row.imageUrls);

  const rest = await prisma.restaurant.findUnique({
    where: { id: row.restaurantId },
    select: { slug: true },
  });

  await applyApprovedChangesToRestaurant(row.restaurantId, changes, images);
  await prisma.restaurantChangeRequest.update({
    where: { id: requestId },
    data: { status: "approved" },
  });

  if (rest?.slug) {
    revalidatePath(`/restaurantes/${rest.slug}`);
    revalidatePath("/restaurantes");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/restaurantes/${rest.slug}`);
    revalidatePath(`/dashboard/restaurantes/${rest.slug}/fotos`);
  }

  redirect(`/admin/cambios/${requestId}?ok=approved`);
}

export async function rejectChangeRequestAction(requestId: string, _formData: FormData): Promise<void> {
  await requirePlatformAdmin();

  const row = await prisma.restaurantChangeRequest.findUnique({ where: { id: requestId } });
  if (!row) redirect("/admin/cambios?error=not_found");
  if (row.status !== "pending") {
    redirect(`/admin/cambios/${requestId}?error=already`);
  }

  await prisma.restaurantChangeRequest.update({
    where: { id: requestId },
    data: { status: "rejected" },
  });

  redirect(`/admin/cambios/${requestId}?ok=rejected`);
}
