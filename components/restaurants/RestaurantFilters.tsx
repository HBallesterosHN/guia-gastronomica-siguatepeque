"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { RESTAURANT_CATEGORIES, type PriceRange, type RestaurantCategory } from "@/types/restaurant";
import { categoryLabels } from "@/lib/category";

interface RestaurantFiltersProps {
  selectedNameQuery?: string;
  selectedCategory?: RestaurantCategory;
  selectedPrice?: PriceRange;
  selectedDelivery?: "si" | "no";
  selectedReservations?: "si" | "no";
  selectedMinRating?: number;
}

const PRICE_OPTIONS: PriceRange[] = ["$", "$$", "$$$"];
const MIN_RATING_OPTIONS = [3, 4, 4.5];
const NAME_DEBOUNCE_MS = 280;
const MAX_NAME_LEN = 120;

function buildSelectsFormKey(p: RestaurantFiltersProps): string {
  return [
    p.selectedCategory ?? "",
    p.selectedPrice ?? "",
    p.selectedDelivery ?? "",
    p.selectedReservations ?? "",
    p.selectedMinRating ?? "",
    p.selectedNameQuery ?? "",
  ].join("|");
}

export function RestaurantFilters({
  selectedNameQuery,
  selectedCategory,
  selectedPrice,
  selectedDelivery,
  selectedReservations,
  selectedMinRating,
}: RestaurantFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [draftName, setDraftName] = useState(selectedNameQuery ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraftName(selectedNameQuery ?? "");
  }, [selectedNameQuery]);

  const pushNameToUrl = useCallback(
    (raw: string) => {
      if (typeof window === "undefined") return;
      const qs = window.location.search.startsWith("?")
        ? window.location.search.slice(1)
        : window.location.search;
      const next = new URLSearchParams(qs);
      const t = raw.trim().slice(0, MAX_NAME_LEN);
      if (t) next.set("nombre", t);
      else next.delete("nombre");
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  function onNameChange(value: string) {
    setDraftName(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      pushNameToUrl(value);
    }, NAME_DEBOUNCE_MS);
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <label className="mb-4 block space-y-1 text-sm">
        <span className="font-medium text-zinc-700">Buscar por nombre</span>
        <input
          type="search"
          value={draftName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Escribe para filtrar al instante…"
          autoComplete="off"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-500 transition placeholder:text-zinc-400 focus:ring-2"
        />
        <span className="block text-xs text-zinc-500">
          Se aplica solo al escribir; los demás filtros siguen con «Aplicar filtros».
        </span>
      </label>

      <form
        key={buildSelectsFormKey({
          selectedNameQuery,
          selectedCategory,
          selectedPrice,
          selectedDelivery,
          selectedReservations,
          selectedMinRating,
        })}
        className="space-y-4"
        action="/restaurantes"
        method="GET"
      >
        <input type="hidden" name="nombre" value={draftName} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-zinc-700">Categoría</span>
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
            <span className="font-medium text-zinc-700">Calificación mínima</span>
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

        <div className="flex flex-wrap gap-2">
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
    </div>
  );
}
