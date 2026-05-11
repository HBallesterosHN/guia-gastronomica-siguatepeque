"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureRestaurantInDbBySlug } from "@/lib/restaurant-db-bootstrap";
import { requirePlatformAdmin } from "@/lib/require-admin";

export async function approveRestaurantClaimAction(claimId: string, _formData: FormData): Promise<void> {
  await requirePlatformAdmin();

  const claim = await prisma.restaurantClaim.findUnique({ where: { id: claimId } });
  if (!claim) redirect("/admin/reclamos?error=not_found");
  if (claim.status !== "pending") {
    redirect(`/admin/reclamos/${claimId}?error=already`);
  }

  const resolved = await ensureRestaurantInDbBySlug(claim.restaurantSlug);
  if (!resolved) {
    redirect(`/admin/reclamos/${claimId}?error=no_file`);
  }

  const blocked = await prisma.restaurantOwnership.findFirst({
    where: {
      restaurantId: resolved.id,
      status: "active",
      userId: { not: claim.userId },
    },
  });
  if (blocked) {
    redirect(`/admin/reclamos/${claimId}?error=other_owner`);
  }

  await prisma.$transaction(async (tx) => {
    const exists = await tx.restaurantOwnership.findUnique({
      where: {
        restaurantId_userId: { restaurantId: resolved.id, userId: claim.userId },
      },
    });
    if (!exists) {
      await tx.restaurantOwnership.create({
        data: {
          restaurantId: resolved.id,
          userId: claim.userId,
          role: "owner",
          status: "active",
        },
      });
    }
    await tx.restaurantClaim.update({
      where: { id: claimId },
      data: { status: "approved", restaurantId: resolved.id },
    });
  });

  revalidatePath(`/restaurantes/${claim.restaurantSlug}`);
  revalidatePath("/restaurantes");
  redirect(`/admin/reclamos/${claimId}?ok=approved`);
}

export async function rejectRestaurantClaimAction(claimId: string, _formData: FormData): Promise<void> {
  await requirePlatformAdmin();

  const claim = await prisma.restaurantClaim.findUnique({ where: { id: claimId } });
  if (!claim) redirect("/admin/reclamos?error=not_found");
  if (claim.status !== "pending") {
    redirect(`/admin/reclamos/${claimId}?error=already`);
  }

  await prisma.restaurantClaim.update({
    where: { id: claimId },
    data: { status: "rejected" },
  });

  redirect(`/admin/reclamos/${claimId}?ok=rejected`);
}
