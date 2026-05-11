import type { Metadata } from "next";
import { RestaurantFilters } from "@/components/restaurants/RestaurantFilters";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { filterRestaurants } from "@/lib/restaurants";
import { getFeaturedRestaurants } from "@/lib/restaurants";
import { ogPublicImagePath } from "@/lib/og-metadata";
import { SITE_BRAND_NAME, SITE_PAGE_TITLE_SUFFIX } from "@/lib/site-brand";
import type { PriceRange, RestaurantCategory } from "@/types/restaurant";

const RESTAURANTES_TITLE = `Restaurantes en Siguatepeque ${SITE_PAGE_TITLE_SUFFIX}`;
const RESTAURANTES_DESCRIPTION =
  "Listado curado con filtros por categoría, precio, delivery y valoración pública. Guía local Me Voy a Sigua.";

const listPreview = getFeaturedRestaurants(1)[0];
const listOgImages =
  listPreview?.media.hero != null
    ? [{ url: ogPublicImagePath(listPreview.media.hero), alt: listPreview.identity.name }]
    : undefined;

export const metadata: Metadata = {
  title: RESTAURANTES_TITLE,
  description: RESTAURANTES_DESCRIPTION,
  alternates: { canonical: "/restaurantes" },
  openGraph: {
    type: "website",
    locale: "es_HN",
    siteName: SITE_BRAND_NAME,
    title: RESTAURANTES_TITLE,
    description: RESTAURANTES_DESCRIPTION,
    url: "/restaurantes",
    images: listOgImages,
  },
  twitter: {
    card: "summary_large_image",
    title: RESTAURANTES_TITLE,
    description: RESTAURANTES_DESCRIPTION,
    images: listOgImages?.map((img) => img.url),
  },
};

interface RestaurantsPageProps {
  searchParams: Promise<{
    categoria?: string;
    precio?: string;
    delivery?: string;
    reservas?: string;
    ratingMinimo?: string;
  }>;
}

function isCategory(value?: string): value is RestaurantCategory {
  return (
    value === "desayuno" ||
    value === "cafe" ||
    value === "comida-tipica" ||
    value === "familiar" ||
    value === "romantico" ||
    value === "parrilla" ||
    value === "mariscos"
  );
}

function isPriceRange(value?: string): value is PriceRange {
  return value === "$" || value === "$$" || value === "$$$";
}

function isYesNo(value?: string): value is "si" | "no" {
  return value === "si" || value === "no";
}

function parseMinRating(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 5) {
    return undefined;
  }

  return parsed;
}

export default async function RestaurantsPage({
  searchParams,
}: RestaurantsPageProps) {
  const params = await searchParams;
  const selectedCategory = isCategory(params.categoria)
    ? params.categoria
    : undefined;
  const selectedPrice = isPriceRange(params.precio) ? params.precio : undefined;
  const selectedDelivery = isYesNo(params.delivery) ? params.delivery : undefined;
  const selectedReservations = isYesNo(params.reservas) ? params.reservas : undefined;
  const selectedMinRating = parseMinRating(params.ratingMinimo);

  const restaurants = filterRestaurants({
    category: selectedCategory,
    priceRange: selectedPrice,
    delivery: selectedDelivery,
    reservations: selectedReservations,
    minRating: selectedMinRating,
  });

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {SITE_BRAND_NAME}
        </p>
        <h1 className="text-3xl font-bold text-zinc-900">Restaurantes en Siguatepeque</h1>
        <p className="max-w-2xl text-zinc-600">
          Filtra por categoría, precio, si llevan a domicilio o si aceptan reservas, y por la
          valoración pública cuando la tenemos. Cada ficha es para salir con el teléfono y la
          dirección claros.
        </p>
      </header>

      <RestaurantFilters
        selectedCategory={selectedCategory}
        selectedPrice={selectedPrice}
        selectedDelivery={selectedDelivery}
        selectedReservations={selectedReservations}
        selectedMinRating={selectedMinRating}
      />

      <p className="text-sm text-zinc-600">
        Mostrando <span className="font-semibold text-zinc-900">{restaurants.length}</span>{" "}
        restaurantes.
      </p>

      {restaurants.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.identity.slug} restaurant={restaurant} />
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-zinc-900">
            No hay resultados con esos filtros
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Prueba cambiando el rango de precio o bajando la calificación mínima.
          </p>
        </section>
      )}
    </main>
  );
}
