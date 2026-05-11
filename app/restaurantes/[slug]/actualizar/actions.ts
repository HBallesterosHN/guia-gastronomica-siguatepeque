"use server";

import { prisma } from "@/lib/prisma";
import {
  parseRestaurantUpdateFormFromFormData,
  type RequestedChangesJson,
} from "@/lib/validations/restaurant-update-request";

export type RestaurantUpdateRequestActionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

const GENERIC_SUCCESS: RestaurantUpdateRequestActionState = { status: "success" };

function flattenFieldErrors(
  issues: { path: (string | number)[]; message: string }[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      out[key] = issue.message;
    }
  }
  return out;
}

export async function submitRestaurantUpdateRequest(
  restaurantSlug: string,
  _prev: RestaurantUpdateRequestActionState,
  formData: FormData,
): Promise<RestaurantUpdateRequestActionState> {
  const honeypot = String(formData.get("companyWebsite") ?? "").trim();
  if (honeypot.length > 0) {
    return GENERIC_SUCCESS;
  }

  const parsed = parseRestaurantUpdateFormFromFormData(formData);
  if (!parsed.success) {
    const fieldErrors = flattenFieldErrors(parsed.error.issues);
    return {
      status: "error",
      message: "Revisa los campos marcados e inténtalo de nuevo.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  const requestedChanges: RequestedChangesJson = {
    authorizationConfirmed: true,
  };
  if (data.menuUrl) requestedChanges.menuUrl = data.menuUrl;
  if (data.instagramUrl) requestedChanges.instagramUrl = data.instagramUrl;
  if (data.businessPhone) requestedChanges.businessPhone = data.businessPhone;
  if (data.businessWhatsapp) requestedChanges.businessWhatsapp = data.businessWhatsapp;
  if (data.suggestedHours) requestedChanges.suggestedHours = data.suggestedHours;

  try {
    let restaurantId: string | null = null;
    try {
      const row = await prisma.restaurant.findUnique({
        where: { slug: restaurantSlug },
        select: { id: true },
      });
      restaurantId = row?.id ?? null;
    } catch {
      restaurantId = null;
    }

    await prisma.restaurantUpdateRequest.create({
      data: {
        restaurantSlug,
        restaurantId,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        ownerEmail: data.ownerEmail ?? null,
        message: data.message ?? null,
        requestedChanges,
        status: "pending",
      },
    });
  } catch (err) {
    console.error("[submitRestaurantUpdateRequest]", err);
    return {
      status: "error",
      message:
        "No pudimos registrar la solicitud en este momento. Intenta de nuevo más tarde o escríbenos por otro canal.",
    };
  }

  return GENERIC_SUCCESS;
}
