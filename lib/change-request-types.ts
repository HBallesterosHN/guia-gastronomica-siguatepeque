import type { StructuredHourRow } from "@/lib/formatters/schedule";

export type ChangeRequestImageAsset = {
  url: string;
  publicId: string;
  type: "hero" | "gallery";
};

export type OwnerChangesJson = {
  phone?: string;
  whatsapp?: string;
  scheduleLabel?: string;
  scheduleStructured?: StructuredHourRow[];
  menuUrl?: string;
  instagramUrl?: string;
  summary?: string;
  heroUrl?: string;
  gallery?: string[];
  ownerMessage?: string;
};

function asStringRecord(raw: unknown): Record<string, unknown> {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, unknown>;
}

export function parseOwnerChangesJson(raw: unknown): OwnerChangesJson {
  const o = asStringRecord(raw);
  const str = (k: string) => (typeof o[k] === "string" ? (o[k] as string).trim() : undefined);
  const out: OwnerChangesJson = {};
  const phone = str("phone");
  const whatsapp = str("whatsapp");
  const scheduleLabel = str("scheduleLabel");
  const menuUrl = str("menuUrl");
  const instagramUrl = str("instagramUrl");
  const summary = str("summary");
  const heroUrl = str("heroUrl");
  const ownerMessage = str("ownerMessage");
  if (phone !== undefined) out.phone = phone;
  if (whatsapp !== undefined) out.whatsapp = whatsapp;
  if (scheduleLabel !== undefined) out.scheduleLabel = scheduleLabel;
  if (menuUrl !== undefined) out.menuUrl = menuUrl;
  if (instagramUrl !== undefined) out.instagramUrl = instagramUrl;
  if (summary !== undefined) out.summary = summary;
  if (heroUrl !== undefined) out.heroUrl = heroUrl;
  if (ownerMessage !== undefined) out.ownerMessage = ownerMessage;

  if (Array.isArray(o.gallery)) {
    const urls = o.gallery.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
    if (urls.length) out.gallery = urls;
  }

  if (Array.isArray(o.scheduleStructured)) {
    const rows: StructuredHourRow[] = [];
    for (const item of o.scheduleStructured) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const r = item as Record<string, unknown>;
      const day = typeof r.day === "string" ? r.day.trim() : "";
      const open = typeof r.open === "string" ? r.open.trim() : "";
      const close = typeof r.close === "string" ? r.close.trim() : "";
      if (day && open && close) rows.push({ day, open, close });
    }
    if (rows.length) out.scheduleStructured = rows;
  }

  return out;
}

function isImageAsset(v: unknown): v is ChangeRequestImageAsset {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.url === "string" &&
    o.url.trim().length > 0 &&
    typeof o.publicId === "string" &&
    o.publicId.trim().length > 0 &&
    (o.type === "hero" || o.type === "gallery")
  );
}

/** Soporta `[{url,publicId,type}]` o legado `string[]` de URLs. */
export function parseImageAssetsJson(raw: unknown): ChangeRequestImageAsset[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) return [];
  const out: ChangeRequestImageAsset[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      out.push({ url: item.trim(), publicId: "", type: "gallery" });
      continue;
    }
    if (isImageAsset(item)) {
      out.push({
        url: item.url.trim(),
        publicId: item.publicId.trim(),
        type: item.type,
      });
    }
  }
  return out;
}
