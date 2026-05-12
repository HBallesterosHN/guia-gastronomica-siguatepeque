import { z } from "zod";

export const guideStatusSchema = z.enum(["published", "draft", "hidden"]);

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

const optionalLongText = z
  .union([z.string(), z.null(), z.undefined()])
  .optional()
  .transform((v) => (v == null ? null : String(v).trim() || null));

export const createGuideSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(slugPattern).max(80),
  subtitle: optionalLongText,
  intro: optionalLongText,
  description: optionalLongText,
  status: guideStatusSchema,
  featured: z.boolean(),
  coverImageUrl: optionalUrl,
  seoTitle: z.string().max(200).nullish().transform((v) => (v?.trim() || null) ?? null),
  seoDescription: optionalLongText,
});

export type CreateGuideInput = z.infer<typeof createGuideSchema>;

const guideEntryRowSchema = z.object({
  restaurantId: z.string().min(1),
  rank: z.number().int().min(0).max(999),
  label: z.string().max(300).nullish().transform((v) => (v?.trim() || null) ?? null),
  note: z.string().max(12000).nullish().transform((v) => (v?.trim() || null) ?? null),
});

export const saveGuideFullSchema = z
  .object({
    originalSlug: z.string().regex(slugPattern),
    slug: z.string().regex(slugPattern).max(80),
    title: z.string().min(1).max(200),
    subtitle: optionalLongText,
    intro: optionalLongText,
    description: optionalLongText,
    status: guideStatusSchema,
    featured: z.boolean(),
    coverImageUrl: optionalUrl,
    seoTitle: z.string().max(200).nullish().transform((v) => (v?.trim() || null) ?? null),
    seoDescription: optionalLongText,
    entries: z.array(guideEntryRowSchema).max(80),
  })
  .refine(
    (data) => {
      const ids = data.entries.map((e) => e.restaurantId);
      return new Set(ids).size === ids.length;
    },
    { message: "No puedes repetir el mismo restaurante dos veces en la guía.", path: ["entries"] },
  );

export type SaveGuideFullInput = z.infer<typeof saveGuideFullSchema>;

export const saveRestaurantGuideLinksSchema = z
  .object({
    restaurantId: z.string().min(1),
    links: z.array(
      z.object({
        guideId: z.string().min(1),
        selected: z.boolean(),
        label: z.string().max(300).nullish().transform((v) => (v?.trim() || null) ?? null),
        note: z.string().max(12000).nullish().transform((v) => (v?.trim() || null) ?? null),
      }),
    ),
  })
  .refine(
    (data) => {
      const sel = data.links.filter((l) => l.selected).map((l) => l.guideId);
      return new Set(sel).size === sel.length;
    },
    { message: "Guía duplicada en la selección.", path: ["links"] },
  );

export type SaveRestaurantGuideLinksInput = z.infer<typeof saveRestaurantGuideLinksSchema>;
