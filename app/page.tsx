import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { getFeaturedRestaurants } from "@/lib/restaurants";

export default function Home() {
  const featuredRestaurants = getFeaturedRestaurants();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6">
      <Hero />

      <section id="destacados" className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Restaurantes destacados
          </h2>
          <Link
            href="/restaurantes"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Ver todos
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.identity.slug} restaurant={restaurant} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-zinc-900">
          Pensado para crecer
        </h3>
        <p className="mt-2 text-sm text-zinc-600">
          Esta version inicial ya deja base para perfiles reclamables, panel de
          administracion, rankings y nuevas categorias turisticas.
        </p>
      </section>
    </main>
  );
}
