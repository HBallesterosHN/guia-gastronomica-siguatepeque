import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getRestaurantBySlug } from "@/lib/restaurants";

export const metadata: Metadata = {
  title: "Mejores desayunos en Siguatepeque para arrancar bien el día | Guía",
  description:
    "Una guía editorial con desayunos recomendados en Siguatepeque: opciones típicas, de carretera y de café para empezar la mañana.",
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
  {
    slug: "tipicos-guancasco" as const,
    emoji: "🍳",
    dishName: "Desayuno típico",
    placeName: "Tipicos Guancasco",
    description:
      "Lo ponemos segundo porque, si te gusta arrancar con sabor catracho, aquí la cocina típica y el horario desde las 8:00 AM lo vuelven una apuesta muy segura. • Es la opción que solemos sugerir cuando alguien pide desayuno tradicional. • Sirve muy bien para mañanas de fin de semana con hambre de plato completo.",
  },
  {
    slug: "restaurante-rosquillas-paola" as const,
    emoji: "🫓",
    dishName: "Parada de carretera",
    placeName: "Restaurante Rosquillas Paola",
    description:
      "Va en tercer lugar porque Rosquillas Paola mezcla lo práctico y lo tradicional: restaurante sobre la CA-5 y rosquillería en el mismo punto. • Si andas en ruta, es de las paradas que más recomendamos para desayunar sin complicarte. • También suma cuando buscas algo típico y luego llevar producto para el camino.",
  },
  {
    slug: "la-pastela" as const,
    emoji: "☕",
    dishName: "Café y repostería",
    placeName: "La Pastela",
    description:
      "La cerramos en cuarto como opción distinta: no compite con el desayuno típico pesado, sino que resuelve mañanas de café, postre o reunión tranquila. • Según su ficha, abre desde las 8:00 AM, así que encaja bien para empezar temprano. • Es nuestra recomendación cuando quieres algo más ligero, pero con ambiente agradable.",
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
          parada en carretera o mesa en familia antes de arrancar. Este ranking reúne lugares que
          sí recomendamos cuando alguien nos pregunta dónde desayunar bien, sin vueltas.
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
