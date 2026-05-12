import type { Restaurant as DbRestaurant } from "@prisma/client";
import { formatHondurasPhone } from "@/lib/formatters/phone";
import {
  isStructuredScheduleUsable,
  parseScheduleManualInput,
  type StructuredHourRow,
} from "@/lib/formatters/schedule";
import type { RestaurantProfileSource } from "@/types/restaurant";

export const ADMIN_SCHEDULE_DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

export type AdminScheduleDay = (typeof ADMIN_SCHEDULE_DAYS)[number];

export type AdminScheduleRowState = {
  day: AdminScheduleDay;
  closed: boolean;
  open: string;
  close: string;
};

function structuredFromRow(row: DbRestaurant): StructuredHourRow[] | undefined {
  const json = row.scheduleStructured;
  if (!Array.isArray(json)) return undefined;
  const rows: StructuredHourRow[] = [];
  for (const item of json) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const r = item as Record<string, unknown>;
    const day = typeof r.day === "string" ? r.day.trim() : "";
    const open = typeof r.open === "string" ? r.open.trim() : "";
    const close = typeof r.close === "string" ? r.close.trim() : "";
    if (day && open && close) rows.push({ day, open, close });
  }
  return isStructuredScheduleUsable(rows) ? rows : undefined;
}

export function buildScheduleRowStateFromRow(row: DbRestaurant): AdminScheduleRowState[] {
  let structured = structuredFromRow(row);
  const label = row.scheduleLabel?.trim() || "";
  if (!structured && label) {
    const p = parseScheduleManualInput(label);
    if (isStructuredScheduleUsable(p.structured)) structured = p.structured;
  }
  const byDay = new Map(structured?.map((r) => [r.day, r]) ?? []);
  return ADMIN_SCHEDULE_DAYS.map((day) => {
    const h = byDay.get(day);
    if (!h) return { day, closed: true, open: "9:00", close: "18:00" };
    const closed = /^cerrado$/i.test(h.open.trim()) && /^cerrado$/i.test(h.close.trim());
    return {
      day,
      closed,
      open: closed ? "9:00" : h.open,
      close: closed ? "18:00" : h.close,
    };
  });
}

function galleryUrlsFromRow(row: DbRestaurant): string[] {
  const g = row.gallery;
  if (g == null || !Array.isArray(g)) return [];
  return g
    .filter((u): u is string => typeof u === "string" && (u.startsWith("/") || u.startsWith("https://")))
    .slice(0, 10);
}

export type AdminRestaurantEditorInitial = {
  originalSlug: string;
  slug: string;
  name: string;
  category: string;
  priceRange: string;
  summary: string;
  status: string;
  verified: boolean;
  source: RestaurantProfileSource;
  address: string;
  lat: string;
  lng: string;
  googleMapsUrl: string;
  phone: string;
  whatsapp: string;
  instagramUrl: string;
  menuUrl: string;
  scheduleLabel: string;
  scheduleRows: AdminScheduleRowState[];
  offersDelivery: boolean;
  acceptsReservations: boolean;
  ratingAverage: number;
  reviewsCount: number;
  heroUrl: string;
  gallery: string[];
};

export function prismaRowToAdminEditorInitial(row: DbRestaurant): AdminRestaurantEditorInitial {
  const gallery = galleryUrlsFromRow(row);
  return {
    originalSlug: row.slug,
    slug: row.slug,
    name: row.name,
    category: row.category,
    priceRange: row.priceRange || "$$",
    summary: row.summary?.trim() ?? "",
    status: row.status || "published",
    verified: row.verified,
    source: (row.source === "manual" || row.source === "owner_submitted" ? row.source : "auto") as RestaurantProfileSource,
    address: row.address?.trim() ?? "",
    lat: row.lat != null ? String(row.lat) : "",
    lng: row.lng != null ? String(row.lng) : "",
    googleMapsUrl: row.googleMapsUrl?.trim() ?? "",
    phone: row.phone ? formatHondurasPhone(row.phone) : "",
    whatsapp: row.whatsapp ? formatHondurasPhone(row.whatsapp) : "",
    instagramUrl: row.instagramUrl?.trim() ?? "",
    menuUrl: row.menuUrl?.trim() ?? "",
    scheduleLabel: row.scheduleLabel?.trim() ?? "",
    scheduleRows: buildScheduleRowStateFromRow(row),
    offersDelivery: Boolean(row.offersDelivery),
    acceptsReservations: Boolean(row.acceptsReservations),
    ratingAverage: row.ratingAverage,
    reviewsCount: row.reviewsCount,
    heroUrl: row.heroUrl?.trim() || "/restaurants/placeholders/hero-placeholder.svg",
    gallery,
  };
}
