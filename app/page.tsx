import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { getFeaturedRestaurants } from "@/lib/restaurants";
import { ogPublicImagePath } from "@/lib/og-metadata";
import { SITE_BRAND_NAME } from "@/lib/site-brand";

const HOME_TITLE = "Me Voy a Sigua | Guía gastronómica de Siguatepeque";
const HOME_DESCRIPTION =
  "Descubre restaurantes, cafés y comida típica en Siguatepeque con recomendaciones locales.";

export async function generateMetadata(): Promise<Metadata> {
  const featured = await getFeaturedRestaurants(1);
  const first = featured[0];
  const ogImage = first?.media.hero
    ? [{ url: ogPublicImagePath(first.media.hero), alt: first.identity.name }]
    : undefined;

  return {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "es_HN",
      siteName: SITE_BRAND_NAME,
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      url: "/",
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      images: ogImage?.map((img) => img.url),
    },
  };
}

const featuredGuides = [
  {
    title: "Mejores sopas en Siguatepeque 🍲",
    description:
      "Para cuando baja la temperatura y solo piensas en caldo: cuatro sopas que seguimos pidiendo por acá, con su restaurante.",
    href: "/guias/mejores-sopas-en-siguatepeque",
    cta: "Ver guía",
  },
  {
    title: "Mejores desayunos en Siguatepeque ☀️",
    description:
      "Desde salida temprano hasta domingo en familia: una recomendación concreta cuando alguien pregunta “¿y dónde desayunamos?”",
    href: "/guias/mejores-desayunos-en-siguatepeque",
    cta: "Ver guía",
  },
  {
    title: "Cafés recomendados en Siguatepeque ☕",
    description:
      "Una pausa con buen café y conversación tranquila, sin tener que probar cinco lugares antes de acertar.",
    href: "/guias/cafes-recomendados-en-siguatepeque",
    cta: "Ver guía",
  },
];

export default async function Home() {
  const featuredRestaurants = await getFeaturedRestaurants();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6">
      <Hero />

      <section id="destacados" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">Restaurantes destacados</h2>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600">
              Lugares que ya revisamos en detalle: útiles para salir con tiempo y llegar con
              teléfono y mapa a la mano.
            </p>
          </div>
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

      <section id="guias-destacadas" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">Guías destacadas</h2>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600">
              Listas cortas y honestas para resolver antojos: sopas, desayunos y cafés en la
              ciudad.
            </p>
          </div>
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
    </main>
  );
}
