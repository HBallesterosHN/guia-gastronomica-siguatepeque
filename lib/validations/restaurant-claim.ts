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

export const restaurantClaimFormSchema = z
  .object({
    ownerName: z.string().trim().min(1, "Indica tu nombre"),
    ownerPhone: z.string().trim().min(6, "Indica un teléfono"),
    ownerEmail: z.preprocess(
      emptyToUndefined,
      z.union([z.undefined(), z.string().email({ message: "Correo no válido" })]),
    ),
    message: z.string().trim().min(1, "Escribe un mensaje breve"),
    evidenceUrl: optionalUrl,
    authorizationConfirmed: z.boolean(),
  })
  .refine((data) => data.authorizationConfirmed === true, {
    path: ["authorizationConfirmed"],
    message: "Debes confirmar que representas el negocio.",
  });

export function parseRestaurantClaimForm(formData: FormData) {
  const authRaw = formData.get("authorizationConfirmed");
  const authorizationConfirmed = authRaw === "on" || authRaw === "true";

  return restaurantClaimFormSchema.safeParse({
    ownerName: fdString(formData, "ownerName"),
    ownerPhone: fdString(formData, "ownerPhone"),
    ownerEmail: fdString(formData, "ownerEmail"),
    message: fdString(formData, "message"),
    evidenceUrl: fdString(formData, "evidenceUrl"),
    authorizationConfirmed,
  });
}
