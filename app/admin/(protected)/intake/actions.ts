"use server";

import { revalidatePath } from "next/cache";
import { buildRestaurantFromSources } from "@/lib/restaurant-intake/build-restaurant-from-sources";
import {
  restaurantSlugExistsInNeon,
  saveRestaurantToDatabase,
} from "@/lib/restaurant-intake/save-restaurant-to-database";
import { requirePlatformAdmin } from "@/lib/require-admin";
import type { IntakeInput, NormalizedDraft } from "@/scripts/restaurant-intake/types";
import { RESTAURANT_CATEGORIES, type RestaurantCategory } from "@/types/restaurant";

function buildWebIntakeInput(params: {
  name?: string;
  googleMapsUrl: string;
  instagramUrl?: string;
  category?: string;
  menuUrl?: string;
}): IntakeInput {
  const rawCat = params.category?.trim() as RestaurantCategory | undefined;
  const categoryProvided = Boolean(params.category?.trim());
  const category = rawCat && RESTAURANT_CATEGORIES.includes(rawCat) ? rawCat : "familiar";
  return {
    target: "db",
    targetExplicit: true,
    forceFile: false,
    forceDb: false,
    name: params.name?.trim() || undefined,
    category,
    categoryProvided,
    dryRun: false,
    textOnly: false,
    imagesScope: "all",
    slug: undefined,
    mapsUrlCli: params.googleMapsUrl.trim(),
    instagramUrlCli: params.instagramUrl?.trim() || undefined,
    menuUrlCli: params.menuUrl?.trim() || undefined,
    menuLabelCli: undefined,
  };
}

export type IntakeGenerateState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "preview";
      draft: NormalizedDraft;
      pending: string[];
      placesErrors: string[];
    };

export async function generateIntakePreviewAction(
  _prev: IntakeGenerateState,
  formData: FormData,
): Promise<IntakeGenerateState> {
  await requirePlatformAdmin();
  const googleMapsUrl = String(formData.get("googleMapsUrl") ?? "").trim();
  if (!googleMapsUrl) {
    return { status: "error", message: "La URL de Google Maps es obligatoria." };
  }

  try {
    const input = buildWebIntakeInput({
      name: String(formData.get("name") ?? ""),
      googleMapsUrl,
      instagramUrl: String(formData.get("instagramUrl") ?? ""),
      category: String(formData.get("category") ?? ""),
      menuUrl: String(formData.get("menuUrl") ?? ""),
    });
    const { draft, report } = await buildRestaurantFromSources({
      input,
      mediaMode: "cloudinary-direct",
    });
    return {
      status: "preview",
      draft,
      pending: report.pending ?? [],
      placesErrors: report.placesIntakeErrors ?? [],
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { status: "error", message };
  }
}

export type IntakeSaveState =
  | { status: "idle" }
  | { status: "error"; message: string; slugConflict?: boolean }
  | { status: "success"; created: boolean; slug: string };

export async function saveIntakeRestaurantFormAction(
  _prev: IntakeSaveState,
  formData: FormData,
): Promise<IntakeSaveState> {
  await requirePlatformAdmin();
  const raw = String(formData.get("draftJson") ?? "");
  const force = String(formData.get("force") ?? "") === "1";
  let draft: NormalizedDraft;
  try {
    draft = JSON.parse(raw) as NormalizedDraft;
  } catch {
    return { status: "error", message: "No hay borrador válido. Genera el restaurante primero." };
  }
  if (!draft.slug?.trim() || !draft.name?.trim()) {
    return { status: "error", message: "Borrador incompleto (slug o nombre). Vuelve a generar." };
  }

  const existed = await restaurantSlugExistsInNeon(draft.slug);
  if (existed && !force) {
    return {
      status: "error",
      message: `Ya existe un restaurante con slug «${draft.slug}» en Neon. Activa «Sobrescribir» para actualizar la fila.`,
      slugConflict: true,
    };
  }

  try {
    await saveRestaurantToDatabase({ draft, dryRun: false, textOnly: false, force });
    revalidatePath("/restaurantes");
    revalidatePath(`/restaurantes/${draft.slug}`);
    revalidatePath("/");
    return { status: "success", created: !existed, slug: draft.slug };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { status: "error", message };
  }
}
