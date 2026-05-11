import type { MetadataRoute } from "next";
import { getAllRestaurants } from "@/lib/restaurants";
import { getSiteUrl } from "@/lib/site-url";

const STATIC_PATHS = [
  "/",
  "/restaurantes",
  "/guias",
  "/sobre",
  "/sobre-esta-guia",
  "/guias/mejores-sopas-en-siguatepeque",
  "/guias/mejores-desayunos-en-siguatepeque",
  "/guias/cafes-recomendados-en-siguatepeque",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/restaurantes" || path === "/guias" ? 0.9 : 0.7,
  }));

  const allRestaurants = await getAllRestaurants();
  const restaurantEntries: MetadataRoute.Sitemap = allRestaurants.map(
    (r) => ({
      url: `${base}/restaurantes/${r.identity.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }),
  );

  return [...staticEntries, ...restaurantEntries];
}
