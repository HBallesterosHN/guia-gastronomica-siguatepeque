"use server";

import { revalidatePath } from "next/cache";
import { saveAdminRestaurantUpdate } from "@/lib/admin-restaurant-save";
import {
  createRestaurantImageUploadSignature,
  type CloudinaryUploadSignature,
} from "@/lib/cloudinary-upload-signature";
import { revalidateRestaurantPublicCache } from "@/lib/revalidate-public-cache";
import { requirePlatformAdmin } from "@/lib/require-admin";
import { adminRestaurantUpdateSchema } from "@/lib/validations/admin-restaurant-update";

export type SaveAdminRestaurantResult =
  | { ok: true }
  | { ok: false; message: string };

export type SignCloudinaryUploadResult =
  | { ok: true; data: CloudinaryUploadSignature }
  | { ok: false; message: string };

/** Firma vía Server Action (cookie admin path=/admin también llega aquí). */
export async function signCloudinaryUploadAction(slug: string): Promise<SignCloudinaryUploadResult> {
  await requirePlatformAdmin();
  const signed = createRestaurantImageUploadSignature(slug);
  if (!signed.ok) {
    return { ok: false, message: signed.error };
  }
  return { ok: true, data: signed.data };
}

export async function saveAdminRestaurantAction(payload: unknown): Promise<SaveAdminRestaurantResult> {
  await requirePlatformAdmin();
  const safe = adminRestaurantUpdateSchema.safeParse(payload);
  if (!safe.success) {
    const msg = safe.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(" · ");
    return { ok: false, message: msg };
  }
  try {
    const parsed = safe.data;
    const result = await saveAdminRestaurantUpdate(parsed);
    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    await revalidateRestaurantPublicCache({
      slug: result.slug,
      previousSlug: result.previousSlug,
      restaurantId: result.restaurantId,
    });

    revalidatePath("/admin/restaurantes");
    revalidatePath(`/admin/restaurantes/${encodeURIComponent(result.slug)}/editar`);
    if (result.slug !== result.previousSlug) {
      revalidatePath(`/admin/restaurantes/${encodeURIComponent(result.previousSlug)}/editar`);
    }

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, message };
  }
}
