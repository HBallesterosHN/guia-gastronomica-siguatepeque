import { z } from "zod";
import { RESTAURANT_CATEGORIES } from "@/types/restaurant";

const categoryEnum = z.enum(RESTAURANT_CATEGORIES);

export const adminRestaurantStatusSchema = z.enum(["published", "draft", "hidden"]);
export const adminRestaurantSourceSchema = z.enum(["auto", "manual", "owner_submitted"]);

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalUrl = z
  .union([z.string(), z.null(), z.undefined()])
  .optional()
  .transform((v) => {
    if (v == null) return null;
    const t = String(v).trim();
    if (!t) return null;
    try {
      const u = new URL(t);
      if (u.protocol !== "https:" && u.protocol !== "http:") return null;
      return t;
    } catch {
      return null;
    }
  });

const heroSchema = z
  .string()
  .max(2000)
  .transform((v) => {
    const t = v.trim();
    if (!t) return "/restaurants/placeholders/hero-placeholder.svg";
    if (t.startsWith("/") || t.startsWith("https://")) return t;
    return "/restaurants/placeholders/hero-placeholder.svg";
  });

const gallerySchema = z
  .array(z.string().max(2000))
  .max(10)
  .transform((arr) =>
    arr
      .map((s) => s.trim())
      .filter((s) => s.startsWith("https://") || s.startsWith("/"))
      .slice(0, 10),
  );

const structuredRowSchema = z.object({
  day: z.string().min(1).max(32),
  open: z.string().min(1).max(64),
  close: z.string().min(1).max(64),
});

export const adminRestaurantUpdateSchema = z.object({
  originalSlug: z.string().regex(slugPattern),
  slug: z.string().regex(slugPattern),
  name: z.string().min(1).max(200),
  category: categoryEnum,
  priceRange: z.enum(["$", "$$", "$$$"]),
  summary: z.string().max(4000).nullish(),
  status: adminRestaurantStatusSchema,
  verified: z.boolean(),
  source: adminRestaurantSourceSchema,
  address: z.string().max(500).nullish(),
  lat: z.number().finite().nullable().optional(),
  lng: z.number().finite().nullable().optional(),
  googleMapsUrl: optionalUrl,
  phone: z.string().max(120).nullish(),
  whatsapp: z.string().max(120).nullish(),
  instagramUrl: optionalUrl,
  menuUrl: optionalUrl,
  scheduleLabel: z.string().max(8000).nullish(),
  structured: z.array(structuredRowSchema).max(14).optional(),
  offersDelivery: z.boolean(),
  acceptsReservations: z.boolean(),
  ratingAverage: z.number().min(0).max(5),
  reviewsCount: z.number().int().min(0).max(10_000_000),
  heroUrl: heroSchema,
  gallery: gallerySchema,
});

export type AdminRestaurantUpdateInput = z.infer<typeof adminRestaurantUpdateSchema>;
