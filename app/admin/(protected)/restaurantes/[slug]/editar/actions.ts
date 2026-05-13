"use server";

import { revalidatePath } from "next/cache";
import { saveAdminRestaurantUpdate } from "@/lib/admin-restaurant-save";
import { requirePlatformAdmin } from "@/lib/require-admin";
import { adminRestaurantUpdateSchema } from "@/lib/validations/admin-restaurant-update";

export type SaveAdminRestaurantResult =
  | { ok: true }
  | { ok: false; message: string };

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
    revalidatePath("/admin/restaurantes");
    revalidatePath(`/admin/restaurantes/${encodeURIComponent(parsed.slug)}/editar`);
    if (parsed.slug !== parsed.originalSlug) {
      revalidatePath(`/admin/restaurantes/${encodeURIComponent(parsed.originalSlug)}/editar`);
    }
    revalidatePath("/restaurantes");
    revalidatePath(`/restaurantes/${parsed.slug}`);
    revalidatePath(`/restaurantes/${parsed.originalSlug}`);
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, message };
  }
}
