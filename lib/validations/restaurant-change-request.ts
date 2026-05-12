import { z } from "zod";
import type { ChangeRequestImageAsset } from "@/lib/change-request-types";

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
  ownerMessage: z.preprocess(
    (v) => {
      if (typeof v !== "string") return undefined;
      const s = v.trim();
      return s.length === 0 ? undefined : s;
    },
    z.union([z.undefined(), z.string().max(4000)]),
  ),
});

export function parseImageAssetsFromHiddenJson(raw: string): ChangeRequestImageAsset[] {
  if (!raw.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    const out: ChangeRequestImageAsset[] = [];
    for (const item of v) {
      if (
        item &&
        typeof item === "object" &&
        typeof (item as { url?: string }).url === "string" &&
        typeof (item as { publicId?: string }).publicId === "string" &&
        ((item as { type?: string }).type === "hero" || (item as { type?: string }).type === "gallery")
      ) {
        const o = item as { url: string; publicId: string; type: "hero" | "gallery" };
        out.push({
          url: o.url.trim(),
          publicId: o.publicId.trim(),
          type: o.type,
        });
      }
    }
    return out;
  } catch {
    return [];
  }
}
