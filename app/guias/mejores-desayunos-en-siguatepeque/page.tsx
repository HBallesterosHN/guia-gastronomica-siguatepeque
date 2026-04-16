import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getRestaurantBySlug } from "@/lib/restaurants";

export const metadata: Metadata = {
  title: "Mejores desayunos en Siguatepeque para arrancar bien el día | Guía",
  description:
    "Una guía editorial de desayunos recomendados en Siguatepeque, con Villa Verde como opción destacada.",
};

const guideEntries = [
  {
    slug: "restaurante-villa-verde" as const,
    emoji: "🌄",
    dishName: "Desayuno completo",
    placeName: "Restaurante Villa Verde",
    description:
      "Para nosotros, Villa Verde abre este ranking porque en su propia ficha se define para desayuno, almuerzo y cena, y eso se nota en la costumbre local de llegar temprano sobre la CA-5. • Lo recomendamos cuando quieres empezar el día con ambiente campestre y sin correr. • Es de esos lugares que funcionan tanto para desayuno familiar como para parada de viaje.",
  },
];

export default function MejoresDesayunosEnSiguatepequePage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10 sm:px-6">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Guía editorial
        </p>
        <h1 className="text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
          🍽️ Mejores desayunos en Siguatepeque para empezar bien el día
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600">
          En Siguatepeque, el desayuno muchas veces marca el ritmo del día: salida temprano,
          parada en carretera o mesa en familia antes de arrancar. En esta guía dejamos una
          recomendación concreta que sí sugerimos cuando alguien pregunta dónde desayunar bien.
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
          Esta guía es una selección editorial y puede variar según el día, el horario o la
          disponibilidad del restaurante. ¿Nos faltó algún desayuno que, para ti, sí debería estar
          aquí? Escríbenos en Instagram{" "}
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
