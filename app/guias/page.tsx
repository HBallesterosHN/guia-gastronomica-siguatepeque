import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedRestaurants } from "@/lib/restaurants";
import { ogPublicImagePath } from "@/lib/og-metadata";
import { SITE_BRAND_NAME } from "@/lib/site-brand";

const GUIAS_TITLE = `Guías gastronómicas en Siguatepeque | ${SITE_BRAND_NAME}`;
const GUIAS_DESCRIPTION =
  "Sopas, desayunos y cafés en Siguatepeque: listas cortas y locales para decidir sin dar tantas vueltas.";

export async function generateMetadata(): Promise<Metadata> {
  const preview = (await getFeaturedRestaurants(1))[0];
  const guiasOgImages =
    preview?.media.hero != null
      ? [{ url: ogPublicImagePath(preview.media.hero), alt: preview.identity.name }]
      : undefined;

  return {
    title: GUIAS_TITLE,
    description: GUIAS_DESCRIPTION,
    alternates: { canonical: "/guias" },
    openGraph: {
      type: "website",
      locale: "es_HN",
      siteName: SITE_BRAND_NAME,
      title: GUIAS_TITLE,
      description: GUIAS_DESCRIPTION,
      url: "/guias",
      images: guiasOgImages,
    },
    twitter: {
      card: "summary_large_image",
      title: GUIAS_TITLE,
      description: GUIAS_DESCRIPTION,
      images: guiasOgImages?.map((img) => img.url),
    },
  };
}

const guides = [
  {
    title: "Mejores sopas en Siguatepeque 🍲",
    description:
      "Una selección local para días frescos: gallina india, marinera, sopa de res y mondongo.",
    href: "/guias/mejores-sopas-en-siguatepeque",
  },
  {
    title: "Mejores desayunos en Siguatepeque ☀️",
    description:
      "Una guía práctica para empezar el día con buen sabor y opciones que sí recomendamos.",
    href: "/guias/mejores-desayunos-en-siguatepeque",
  },
  {
    title: "Cafés recomendados en Siguatepeque ☕",
    description:
      "Lugares ideales para conversar, trabajar o hacer una pausa con buen café.",
    href: "/guias/cafes-recomendados-en-siguatepeque",
  },
];

export default function GuiasPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Guía editorial
        </p>
        <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
          Guías gastronómicas en Siguatepeque
        </h1>
        <p className="max-w-3xl text-zinc-600">
          Cada guía es una conversación de mesa: pocos lugares, criterio claro y cero relleno. Si
          te falta un tema, nos escribes y lo vamos sumando.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {guides.map((guide) => (
          <article
            key={guide.title}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
              Guía destacada
            </p>
            <h2 className="mt-3 text-xl font-semibold text-zinc-900">{guide.title}</h2>
            <p className="mt-2 min-h-16 text-sm leading-6 text-zinc-600">{guide.description}</p>
            <Link
              href={guide.href}
              className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Ver guía →
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
