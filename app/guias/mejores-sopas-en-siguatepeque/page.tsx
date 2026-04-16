import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getRestaurantBySlug } from "@/lib/restaurants";

export const metadata: Metadata = {
  title: "Mejores sopas en Siguatepeque | Guia Gastronomica",
  description:
    "Seleccion editorial: gallina india, marinera, sopa de res y mondongo en Siguatepeque.",
};

const guideEntries = [
  {
    slug: "tipicos-guancasco" as const,
    emoji: "🐔",
    dishName: "Gallina india",
    placeName: "Guancasco",
    description:
      "Sopa contundente de gallina india, con el punto justo de sazon y aroma que recuerda a la cocina de barrio.",
  },
  {
    slug: "el-torito-steak-house" as const,
    emoji: "🐟",
    dishName: "Marinera",
    placeName: "El Torito",
    description:
      "Caldo de pescado y mariscos con sabor intenso al mar, ideal cuando quieres algo caliente y distinto.",
  },
  {
    slug: "restaurante-rosquillas-paola" as const,
    emoji: "🥩",
    dishName: "Sopa de res",
    placeName: "Rosquillería Paola",
    description:
      "Sopa de res con verduras, reconfortante y generosa, perfecta para compartir en mesa larga.",
  },
  {
    slug: "habana-mex" as const,
    emoji: "🥣",
    dishName: "Mondongo",
    placeName: "Abanamex",
    description:
      "Mondongo bien cocido, caldo espeso y sazon que pide repetir; la especialidad de la casa.",
  },
];

export default function MejoresSopasEnSiguatepequePage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10 sm:px-6">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Guia editorial
        </p>
        <h1 className="text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
          🍲 Mejores sopas en Siguatepeque
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600">
          Cuatro sopas emblematicas y donde encontrarlas hoy en Siguatepeque. Toca cada ficha
          para ver el restaurante completo.
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

      <footer className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600">
        <p>
          Esta guia es una seleccion editorial. Los platos pueden variar segun temporada y
          carta del dia. Siempre confirma disponibilidad directamente con el restaurante.
        </p>
        <p className="mt-3">
          <Link
            href="/restaurantes"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Ver todos los restaurantes
          </Link>
        </p>
      </footer>
    </main>
  );
}
