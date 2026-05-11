import { z } from "zod";

function fdString(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

const emptyToUndefined = (v: unknown) => {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s.length === 0 ? undefined : s;
};

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.union([z.undefined(), z.string().url({ message: "URL no válida" })]),
);

export const restaurantUpdateRequestFormSchema = z
  .object({
    ownerName: z.string().trim().min(1, "Indica tu nombre"),
    ownerPhone: z.string().trim().min(6, "Indica un teléfono de contacto"),
    ownerEmail: z.preprocess(
      emptyToUndefined,
      z.union([z.undefined(), z.string().email({ message: "Correo no válido" })]),
    ),
    message: z.preprocess(emptyToUndefined, z.union([z.undefined(), z.string().max(8000)])),
    menuUrl: optionalUrl,
    instagramUrl: optionalUrl,
    businessPhone: z.preprocess(emptyToUndefined, z.union([z.undefined(), z.string().max(80)])),
    businessWhatsapp: z.preprocess(emptyToUndefined, z.union([z.undefined(), z.string().max(80)])),
    suggestedHours: z.preprocess(emptyToUndefined, z.union([z.undefined(), z.string().max(2000)])),
    authorizationConfirmed: z.boolean(),
  })
  .refine((data) => data.authorizationConfirmed === true, {
    path: ["authorizationConfirmed"],
    message: "Debes confirmar que representas el negocio o tienes autorización.",
  });

export type RequestedChangesJson = {
  menuUrl?: string;
  instagramUrl?: string;
  businessPhone?: string;
  businessWhatsapp?: string;
  suggestedHours?: string;
  authorizationConfirmed: boolean;
};

export function parseRestaurantUpdateFormFromFormData(formData: FormData) {
  const authRaw = formData.get("authorizationConfirmed");
  const authorizationConfirmed = authRaw === "on" || authRaw === "true" || authRaw === "1";

  return restaurantUpdateRequestFormSchema.safeParse({
    ownerName: fdString(formData, "ownerName"),
    ownerPhone: fdString(formData, "ownerPhone"),
    ownerEmail: fdString(formData, "ownerEmail"),
    message: fdString(formData, "message"),
    menuUrl: fdString(formData, "menuUrl"),
    instagramUrl: fdString(formData, "instagramUrl"),
    businessPhone: fdString(formData, "businessPhone"),
    businessWhatsapp: fdString(formData, "businessWhatsapp"),
    suggestedHours: fdString(formData, "suggestedHours"),
    authorizationConfirmed,
  });
}
