import { z } from "zod";

function fdString(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

const optStr = z.preprocess(
  (v) => {
    if (typeof v !== "string") return undefined;
    const s = v.trim();
    return s.length === 0 ? undefined : s;
  },
  z.union([z.undefined(), z.string()]),
);

const optUrl = z.preprocess(
  (v) => {
    if (typeof v !== "string") return undefined;
    const s = v.trim();
    return s.length === 0 ? undefined : s;
  },
  z.union([z.undefined(), z.string().url({ message: "URL no válida" })]),
);

export const ownerChangeRequestFormSchema = z.object({
  phone: optStr,
  whatsapp: optStr,
  scheduleLabel: optStr,
  menuUrl: optUrl,
  instagramUrl: optUrl,
  summary: z.preprocess(
    (v) => {
      if (typeof v !== "string") return undefined;
      const s = v.trim();
      return s.length === 0 ? undefined : s;
    },
    z.union([z.undefined(), z.string().max(12000)]),
  ),
  heroUrl: optUrl,
});

export function parseOwnerChangeRequestForm(formData: FormData) {
  return ownerChangeRequestFormSchema.safeParse({
    phone: fdString(formData, "phone"),
    whatsapp: fdString(formData, "whatsapp"),
    scheduleLabel: fdString(formData, "scheduleLabel"),
    menuUrl: fdString(formData, "menuUrl"),
    instagramUrl: fdString(formData, "instagramUrl"),
    summary: fdString(formData, "summary"),
    heroUrl: fdString(formData, "heroUrl"),
  });
}

export function parseImageUrlsHiddenField(raw: string): string[] {
  if (!raw.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
  } catch {
    return [];
  }
}
