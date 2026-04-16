import Link from "next/link";
import { RESTAURANT_CATEGORIES, type PriceRange, type RestaurantCategory } from "@/types/restaurant";
import { categoryLabels } from "@/lib/category";

interface RestaurantFiltersProps {
  selectedCategory?: RestaurantCategory;
  selectedPrice?: PriceRange;
  selectedDelivery?: "si" | "no";
  selectedReservations?: "si" | "no";
  selectedMinRating?: number;
}

const PRICE_OPTIONS: PriceRange[] = ["$", "$$", "$$$"];
const MIN_RATING_OPTIONS = [3, 4, 4.5];

export function RestaurantFilters({
  selectedCategory,
  selectedPrice,
  selectedDelivery,
  selectedReservations,
  selectedMinRating,
}: RestaurantFiltersProps) {
  return (
    <form
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
      action="/restaurantes"
      method="GET"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Categoria</span>
          <select
            name="categoria"
            defaultValue={selectedCategory ?? ""}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500 transition focus:ring-2"
          >
            <option value="">Todas</option>
            {RESTAURANT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Rango de precio</span>
          <select
            name="precio"
            defaultValue={selectedPrice ?? ""}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500 transition focus:ring-2"
          >
            <option value="">Todos</option>
            {PRICE_OPTIONS.map((price) => (
              <option key={price} value={price}>
                {price}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Delivery</span>
          <select
            name="delivery"
            defaultValue={selectedDelivery ?? ""}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500 transition focus:ring-2"
          >
            <option value="">Todos</option>
            <option value="si">Con delivery</option>
            <option value="no">Sin delivery</option>
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Reservas</span>
          <select
            name="reservas"
            defaultValue={selectedReservations ?? ""}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500 transition focus:ring-2"
          >
            <option value="">Todos</option>
            <option value="si">Acepta reservas</option>
            <option value="no">Sin reservas</option>
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-zinc-700">Calificacion minima</span>
          <select
            name="ratingMinimo"
            defaultValue={selectedMinRating?.toString() ?? ""}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500 transition focus:ring-2"
          >
            <option value="">Cualquiera</option>
            {MIN_RATING_OPTIONS.map((rating) => (
              <option key={rating} value={rating}>
                {rating}+ estrellas
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Aplicar filtros
        </button>
        <Link
          href="/restaurantes"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
        >
          Limpiar
        </Link>
      </div>
    </form>
  );
}
