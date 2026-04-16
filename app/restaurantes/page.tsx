import { RestaurantFilters } from "@/components/restaurants/RestaurantFilters";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { filterRestaurants } from "@/lib/restaurants";
import type { PriceRange, RestaurantCategory } from "@/types/restaurant";

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
          Guía Gastronómica de Siguatepeque
        </p>
        <h1 className="text-3xl font-bold text-zinc-900">Todos los restaurantes</h1>
        <p className="max-w-2xl text-zinc-600">
          Filtra por categoría, precio, delivery, reservas y rating para encontrar
          rápido el lugar ideal para tu visita en Siguatepeque.
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
