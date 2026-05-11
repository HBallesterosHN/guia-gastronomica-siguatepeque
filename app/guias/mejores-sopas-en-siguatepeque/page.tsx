import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getRestaurantBySlug } from "@/lib/restaurants";
import { guidePageMetadata } from "@/lib/guide-page-metadata";
import { INSTAGRAM_HANDLE, INSTAGRAM_PROFILE_URL } from "@/lib/site-brand";

export async function generateMetadata(): Promise<Metadata> {
  return guidePageMetadata({
    canonicalPath: "/guias/mejores-sopas-en-siguatepeque",
    titleShort: "Sopas en Siguatepeque cuando pega el frío",
    description:
      "Gallina india, marinera, sopa de res y mondongo: cuatro sopas que seguimos pidiendo en Siguatepeque y dónde pedirlas.",
    previewSlug: "tipicos-guancasco",
  });
}

const guideEntries = [
  {
    slug: "tipicos-guancasco" as const,
    emoji: "🐔",
    dishName: "Gallina india",
    placeName: "Tipicos Guancasco",
    description:
      "Para nosotros esta va primero porque es la sopa que encaja con un almuerzo familiar en Siguatepeque: cocina típica hondureña, mesa llena y ese caldo de gallina india que te quita el frío de golpe. • Es el plato que uno pide cuando quiere sabor de casa, sin rodeos. • Si te toca día nublado o tarde larga, aquí encontramos el consuelo clásico.",
  },
  {
    slug: "el-torito-steak-house" as const,
    emoji: "🐟",
    dishName: "Marinera",
    placeName: "El Torito Steak House",
    description:
      "La dejamos en segundo lugar porque cuando ya vienes de mucha sopa de tierra, en El Torito la marinera cambia el chip: caldo de pescado y mariscos, en la CA-5 frente a Uniplaza, en un local donde también se pide parrilla y mariscos. • Sirve para el antojo de mar sin complicarse. • Si quieres algo caliente pero distinto al caldo de siempre, esta es nuestra apuesta.",
  },
  {
    slug: "restaurante-rosquillas-paola" as const,
    emoji: "🥩",
    dishName: "Sopa de res",
    placeName: "Restaurante Rosquillas Paola",
    description:
      "Va tercera porque, en la misma CA-5, en Rosquillas Paola, la sopa de res nos remite a lo tradicional de carretera: sabor fuerte, plato lleno y ese ambiente de restaurante y rosquillería donde uno se siente en confianza. • Es la sopa de res que pedimos cuando queremos algo contundente y sencillo. • Si vas en grupo o con hambre de verdad, aquí no quedamos con el plato a medias.",
  },
  {
    slug: "habana-mex" as const,
    emoji: "🥣",
    dishName: "Mondongo",
    placeName: "Habana Mex",
    description:
      "La cerramos en cuarto no porque falte sabor, sino porque el ranking va de lo más típico de almuerzo hondureño hacia un perfil con sazón mexicana; en Habana Mex el mondongo es de los platos que la gente pide seguido. • Si te gusta el mondongo bien cocido y con sazón, aquí lo pedimos sin pena. • Es el cierre cuando ya recorriste las otras y quieres un caldo distinto pero igual de llenador.",
  },
];

export default async function MejoresSopasEnSiguatepequePage() {
  const rows = await Promise.all(
    guideEntries.map(async (entry) => ({
      entry,
      restaurant: await getRestaurantBySlug(entry.slug),
    })),
  );

  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10 sm:px-6">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Guía editorial
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
        {rows.map(({ entry, restaurant }, index) => {
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
          Esta guía es una selección editorial: son lugares y platos que ya están en el sitio,
          pero la carta puede cambiar con el día o la temporada. Antes de salir, confirma por
          teléfono o WhatsApp si la sopa sigue disponible. ¿Nos faltó alguna sopa que, para ti,
          debería estar aquí? Escríbenos en Instagram{" "}
          <a
            href={INSTAGRAM_PROFILE_URL}
            className="font-semibold text-emerald-700 hover:text-emerald-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            @{INSTAGRAM_HANDLE}
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
