import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guías gastronómicas en Siguatepeque | Guía Gastronómica",
  description:
    "Explora nuestras recomendaciones locales sobre dónde comer en Siguatepeque: sopas, desayunos, cafés y más.",
};

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
          Si no sabes por dónde empezar, aquí tienes nuestras recomendaciones locales para comer
          bien en Siguatepeque: sopas, desayunos, cafés y más.
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
