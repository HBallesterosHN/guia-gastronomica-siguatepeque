import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getRestaurantBySlug } from "@/lib/restaurants";

export const metadata: Metadata = {
  title: "Sopas en Siguatepeque que vale la pena pedir cuando el frío pega | Guía",
  description:
    "Cuatro sopas que seguimos pidiendo en Siguatepeque —gallina india, marinera, sopa de res y mondongo— y el restaurante donde las encontramos.",
};

const guideEntries = [
  {
    slug: "tipicos-guancasco" as const,
    emoji: "🐔",
    dishName: "Gallina india",
    placeName: "Tipicos Guancasco",
    description:
      "Para nosotros esta va primero porque es la sopa que encaja con un almuerzo familiar en Siguatepeque: cocina tipica hondurena, mesa llena y ese caldo de gallina india que te quita el frío de golpe. • Es el plato que uno pide cuando quiere sabor de casa, sin rodeos. • Si te toca día nublado o tarde larga, aquí encontramos el consuelo clásico.",
  },
  {
    slug: "el-torito-steak-house" as const,
    emoji: "🐟",
    dishName: "Marinera",
    placeName: "El Torito Steak House",
    description:
      "La dejamos en segundo lugar porque cuando ya comimos mucha sopa de tierra, en El Torito la marinera nos cambia el chip: caldo de pescado y mariscos, en un lugar en la CA-5 frente a Uniplaza que en el sitio figura como referencia en parrilladas, mariscos y sopas. • Sirve para el antojo de mar sin complicarse. • Si quieres algo caliente pero distinto al caldo de siempre, esta es nuestra apuesta.",
  },
  {
    slug: "restaurante-rosquillas-paola" as const,
    emoji: "🥩",
    dishName: "Sopa de res",
    placeName: "Restaurante Rosquillas Paola",
    description:
      "Va tercera porque en la misma CA-5, en Rosquillas Paola, la sopa de res nos remite a lo tradicional de carretera: sabor fuerte, plato lleno y ese ambiente de restaurante y rosquilleria donde uno se siente en confianza. • Es la sopa de res que pedimos cuando queremos algo contundente y sencillo. • Si vas en grupo o con hambre de verdad, aquí no quedamos con el plato a medias.",
  },
  {
    slug: "habana-mex" as const,
    emoji: "🥣",
    dishName: "Mondongo",
    placeName: "Habana Mex",
    description:
      "La cerramos en cuarto no porque falte sabor, sino porque el ranking va de lo más típico de almuerzo hondureño hacia un perfil con influencia mexicana; en la ficha de Habana Mex la sopa de mondongo aparece como especialidad de la casa. • Si te late el mondongo bien cocido y con sazón, aquí lo pedimos sin pena. • Es el cierre que pedimos cuando ya dimos la vuelta a las otras y queremos un caldo distinto pero igual de llenador.",
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
          🍲 Sopas en Siguatepeque que pedimos cuando el frío pega
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600">
          En Siguatepeque el frío se siente en la piel y en la mesa: la sopa no es moda, es
          costumbre de almuerzo, de domingo con familia o de ese día en que uno solo quiere un
          caldo honesto. Estas son cuatro sopas que seguimos recomendando, en el orden en que
          nosotros las pediríamos; toca cada ficha para ver horarios, ubicación y el perfil
          completo del restaurante.
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
          Esta guia es una seleccion editorial: son lugares y platos que ya estan en el sitio,
          pero la carta puede cambiar con el dia o la temporada. Antes de salir, confirma por
          telefono o WhatsApp si la sopa sigue disponible. ¿Nos faltó alguna sopa que para ti
          deberia estar aqui? Escríbenos en Instagram{" "}
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
