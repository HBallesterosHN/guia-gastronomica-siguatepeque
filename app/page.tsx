import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { getFeaturedRestaurants } from "@/lib/restaurants";

const featuredGuides = [
  {
    title: "Mejores sopas en Siguatepeque",
    description:
      "Una guia editorial para dias frescos: gallina india, marinera, sopa de res y mondongo.",
    href: "/guias/mejores-sopas-en-siguatepeque",
    cta: "Ver guia",
    status: "Publicada",
  },
  {
    title: "Mejores desayunos en Siguatepeque",
    description:
      "Opciones para empezar bien el dia, desde desayuno tipico hasta propuestas para reunirte.",
    href: "/guias/mejores-desayunos-en-siguatepeque",
    cta: "Ver guia",
    status: "Publicada",
  },
  {
    title: "Cafes recomendados en Siguatepeque",
    description:
      "Lugares para trabajar, conversar o hacer una pausa con buen cafe y ambiente agradable.",
    href: "/restaurantes?categoria=cafe",
    cta: "Explorar cafes",
    status: "Proximamente",
  },
];

export default function Home() {
  const featuredRestaurants = getFeaturedRestaurants();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6">
      <Hero />

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-zinc-900">Guías destacadas</h2>
          <Link
            href="/sobre-esta-guia"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Ver enfoque editorial
          </Link>
        </div>
        <p className="max-w-3xl text-sm text-zinc-600 sm:text-base">
          Descubre selecciones curadas para resolver antojos concretos y encontrar opciones que
          de verdad te sirvan en Siguatepeque.
        </p>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredGuides.map((guide) => (
            <article
              key={guide.title}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  Guía editorial
                </p>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                  {guide.status}
                </span>
              </div>
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

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-zinc-900">
          Pensado para crecer
        </h3>
        <p className="mt-2 text-sm text-zinc-600">
          Esta versión inicial ya deja base para perfiles reclamables, panel de
          administración, rankings y nuevas categorías turísticas.
        </p>
      </section>
    </main>
  );
}
