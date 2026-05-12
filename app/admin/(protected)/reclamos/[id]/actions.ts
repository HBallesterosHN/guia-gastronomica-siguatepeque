"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OwnershipRole, OwnershipStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureRestaurantInDbBySlug } from "@/lib/restaurant-db-bootstrap";
import { requirePlatformAdmin } from "@/lib/require-admin";

function parseOwnershipRoleFromForm(formData: FormData): OwnershipRole {
  const v = String(formData.get("ownershipRole") ?? "owner").trim();
  if (v === "manager") return OwnershipRole.manager;
  if (v === "editor") return OwnershipRole.editor;
  return OwnershipRole.owner;
}

export async function approveRestaurantClaimAction(claimId: string, formData: FormData): Promise<void> {
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

  const role = parseOwnershipRoleFromForm(formData);

  await prisma.$transaction(async (tx) => {
    await tx.restaurantOwnership.upsert({
      where: {
        userId_restaurantId: { userId: claim.userId, restaurantId: resolved.id },
      },
      create: {
        restaurantId: resolved.id,
        userId: claim.userId,
        role,
        status: OwnershipStatus.active,
      },
      update: {
        status: OwnershipStatus.active,
        role,
      },
    });
    await tx.restaurantClaim.update({
      where: { id: claimId },
      data: { status: "approved", restaurantId: resolved.id },
    });
  });

  revalidatePath(`/restaurantes/${claim.restaurantSlug}`);
  revalidatePath("/restaurantes");
  revalidatePath("/dashboard");
  revalidatePath(`/admin/reclamos/${claimId}`);
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

export async function setRestaurantOwnershipStatusAction(formData: FormData): Promise<void> {
  await requirePlatformAdmin();

  const ownershipId = String(formData.get("ownershipId") ?? "").trim();
  const next = String(formData.get("nextStatus") ?? "").trim();
  const returnToRaw = String(formData.get("returnTo") ?? "/admin/reclamos").trim();
  const returnTo = returnToRaw.startsWith("/admin/") ? returnToRaw : "/admin/reclamos";

  if (!ownershipId || (next !== "active" && next !== "inactive")) {
    redirect(returnTo);
  }

  const row = await prisma.restaurantOwnership.findUnique({
    where: { id: ownershipId },
    include: { restaurant: { select: { slug: true } } },
  });
  if (!row) redirect(returnTo);

  await prisma.restaurantOwnership.update({
    where: { id: ownershipId },
    data: {
      status: next === "active" ? OwnershipStatus.active : OwnershipStatus.inactive,
    },
  });

  revalidatePath(`/restaurantes/${row.restaurant.slug}`);
  revalidatePath("/restaurantes");
  revalidatePath("/dashboard");
  revalidatePath("/admin/reclamos");
  revalidatePath(returnTo);
  redirect(returnTo);
}
