import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getRestaurantBySlug } from "@/lib/restaurants";

export const metadata: Metadata = {
  title: "Cafés recomendados en Siguatepeque | Guía",
  description:
    "Guía editorial de cafés recomendados en Siguatepeque para una pausa, reunión o tarde tranquila.",
};

const guideEntries = [
  {
    slug: "la-pastela" as const,
    emoji: "☕",
    dishName: "Café y repostería",
    placeName: "La Pastela",
    description:
      "Incluimos a La Pastela como recomendación principal porque en el sistema está clasificado como café y abre desde temprano, lo cual encaja perfecto para una pausa en la mañana o en la tarde. • Es nuestra sugerencia cuando quieres conversar tranquilo con algo dulce. • También funciona bien si buscas un lugar cómodo para una reunión corta.",
  },
];

export default function CafesRecomendadosEnSiguatepequePage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10 sm:px-6">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Guía editorial
        </p>
        <h1 className="text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
          ☕ Cafés recomendados en Siguatepeque
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600">
          Una selección para cuando quieres una pausa con buen café, plática tranquila y ambiente
          agradable en Siguatepeque.
        </p>
      </header>

      <ol className="space-y-8">
        {guideEntries.map((entry, index) => {
          const restaurant = getRestaurantBySlug(entry.slug);
          if (!restaurant) {
            return null;
          }

          const { identity, media } = restaurant;
          const profileHref = `/restaurantes/${identity.slug}`;

          return (
            <li key={entry.slug}>
              <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,280px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
                  <div className="space-y-4 p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                        {index + 1}
                      </span>
                      <span className="font-medium text-zinc-700">
                        {entry.emoji} {entry.dishName}
                      </span>
                    </div>
                    <h2 className="text-2xl font-semibold text-zinc-900">{entry.placeName}</h2>
                    <p className="max-w-xl leading-7 text-zinc-600">{entry.description}</p>
                    <Link
                      href={profileHref}
                      className="inline-flex w-fit items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Ver restaurante
                    </Link>
                  </div>
                  <Link
                    href={profileHref}
                    className="relative block min-h-[220px] md:min-h-full"
                  >
                    <Image
                      src={media.hero}
                      alt={`${entry.dishName} en ${entry.placeName}`}
                      fill
                      className="object-cover transition duration-500 hover:opacity-95"
                      sizes="(max-width: 768px) 100vw, 340px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 to-transparent md:bg-gradient-to-l" />
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
      </ol>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Otras guías que te pueden interesar</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link
            href="/guias/mejores-sopas-en-siguatepeque"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Mejores sopas en Siguatepeque
          </Link>
          <Link
            href="/guias/mejores-desayunos-en-siguatepeque"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Mejores desayunos en Siguatepeque
          </Link>
          <Link
            href="/guias/cafes-recomendados-en-siguatepeque"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Cafés recomendados en Siguatepeque
          </Link>
        </div>
      </section>

      <footer className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600">
        <p>
          Esta guía crecerá con más cafés conforme ampliemos la curaduría local. ¿Nos faltó uno
          que te guste? Escríbenos en Instagram{" "}
          <a
            href="https://www.instagram.com/mevoyasigua/"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            @mevoyasigua
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
