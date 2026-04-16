import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { getFeaturedRestaurants } from "@/lib/restaurants";

const featuredGuides = [
  {
    title: "Mejores sopas en Siguatepeque 🍲",
    description:
      "Una selección local para días frescos: gallina india, marinera, sopa de res y mondongo.",
    href: "/guias/mejores-sopas-en-siguatepeque",
    cta: "Ver guía",
  },
  {
    title: "Mejores desayunos en Siguatepeque ☀️",
    description:
      "Opciones para empezar bien el día, desde desayuno típico hasta paradas prácticas en ruta.",
    href: "/guias/mejores-desayunos-en-siguatepeque",
    cta: "Ver guía",
  },
  {
    title: "Cafés recomendados en Siguatepeque ☕",
    description:
      "Lugares para una pausa tranquila, conversar y disfrutar un buen café en la ciudad.",
    href: "/guias/cafes-recomendados-en-siguatepeque",
    cta: "Ver guía",
  },
];

export default function Home() {
  const featuredRestaurants = getFeaturedRestaurants();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6">
      <Hero />

      <section id="guias-destacadas" className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-zinc-900">Guías destacadas</h2>
          <Link
            href="/guias"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Ver todas
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredGuides.map((guide) => (
            <article
              key={guide.title}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                Guía editorial
              </p>
              <h3 className="mt-3 text-xl font-semibold text-zinc-900">{guide.title}</h3>
              <p className="mt-2 min-h-16 text-sm leading-6 text-zinc-600">{guide.description}</p>
              <Link
                href={guide.href}
                className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                {guide.cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>

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
    </main>
  );
}
