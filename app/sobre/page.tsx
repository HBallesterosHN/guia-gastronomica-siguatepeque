import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedRestaurants } from "@/lib/restaurants";
import { ogPublicImagePath } from "@/lib/og-metadata";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_PROFILE_URL,
  SITE_BRAND_NAME,
  SITE_INDEPENDENT_LINE,
} from "@/lib/site-brand";

const SOBRE_TITLE = `Sobre esta guía | ${SITE_BRAND_NAME}`;
const SOBRE_DESCRIPTION =
  "Qué es Me Voy a Sigua, cómo armamos las fichas y por qué no publicamos reseñas inventadas. Guía gastronómica local de Siguatepeque.";

export async function generateMetadata(): Promise<Metadata> {
  const sobrePreview = (await getFeaturedRestaurants(1))[0];
  const sobreOgImages =
    sobrePreview?.media.hero != null
      ? [{ url: ogPublicImagePath(sobrePreview.media.hero), alt: sobrePreview.identity.name }]
      : undefined;

  return {
    title: SOBRE_TITLE,
    description: SOBRE_DESCRIPTION,
    alternates: { canonical: "/sobre" },
    openGraph: {
      type: "website",
      locale: "es_HN",
      siteName: SITE_BRAND_NAME,
      title: SOBRE_TITLE,
      description: SOBRE_DESCRIPTION,
      url: "/sobre",
      images: sobreOgImages,
    },
    twitter: {
      card: "summary_large_image",
      title: SOBRE_TITLE,
      description: SOBRE_DESCRIPTION,
      images: sobreOgImages?.map((img) => img.url),
    },
  };
}

export default function SobrePage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {SITE_BRAND_NAME}
        </p>
        <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">Sobre esta guía</h1>
        <p className="max-w-3xl text-lg leading-relaxed text-zinc-600">
          {SITE_INDEPENDENT_LINE}
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-zinc-900">Por qué existe este sitio</h2>
        <p className="mt-4 text-base leading-7 text-zinc-700">
          En Siguatepeque comer bien no es el problema: el problema es elegir sin perder tiempo.
          Armamos {SITE_BRAND_NAME} para tener en un solo lugar direcciones claras, horarios y
          formas de contacto, más guías cortas cuando el antojo es específico (sopa, desayuno,
          café).
        </p>
        <p className="mt-4 text-base leading-7 text-zinc-700">
          No somos un directorio infinito: cada ficha es trabajo editorial. Si algo cambió en el
          local y ves un dato desactualizado, nos ayudas mucho escribiéndonos para corregirlo.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-zinc-900">Valoraciones y comentarios</h2>
        <p className="mt-4 text-base leading-7 text-zinc-700">
          Cuando ves promedio de estrellas y cantidad de valoraciones en una ficha, eso viene de
          datos públicos agregados (por ejemplo Google Maps), no de comentarios que nosotros
          inventemos.
        </p>
        <p className="mt-4 text-base leading-7 text-zinc-700">
          Una sección de “opiniones” solo aparece si tenemos comentarios editoriales verificados y
          con texto real. Si no hay ninguno, no rellenamos con frases genéricas: preferimos
          dejar la ficha limpia.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-zinc-900">Guías que vamos sumando</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Temas que ya puedes leer en el sitio:
        </p>
        <ul className="mt-4 list-inside list-disc space-y-2 text-zinc-700">
          <li>
            <Link
              href="/guias/mejores-sopas-en-siguatepeque"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Sopas para cuando pega el frío
            </Link>
          </li>
          <li>
            <Link
              href="/guias/mejores-desayunos-en-siguatepeque"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Desayunos que sí recomendamos
            </Link>
          </li>
          <li>
            <Link
              href="/guias/cafes-recomendados-en-siguatepeque"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Cafés para una pausa tranquila
            </Link>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-zinc-900">Hablemos</h2>
        <p className="mt-2 text-base leading-7 text-zinc-700">
          ¿Un lugar que deberíamos visitar, un dato mal en una ficha o una guía que te gustaría
          ver? El canal más directo es Instagram{" "}
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
        <p className="mt-4 text-sm">
          <Link href="/restaurantes" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Explorar restaurantes
          </Link>
          {" · "}
          <Link href="/guias" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Ver guías
          </Link>
        </p>
      </section>
    </main>
  );
}
