import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre esta guía | Guía Gastronómica de Siguatepeque",
  description:
    "Conoce la historia y propósito de esta guía local de Siguatepeque, creada para recomendar lugares que realmente valen la pena.",
};

export default function SobrePage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Identidad local
        </p>
        <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">Sobre esta guía</h1>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-base leading-7 text-zinc-700">
          Somos de Siguatepeque y creamos esta guía para recomendar lugares donde realmente vale
          la pena comer.
        </p>
        <p className="mt-4 text-base leading-7 text-zinc-700">
          Aquí no vas a encontrar listas genéricas. Queremos compartir recomendaciones reales,
          basadas en nuestra experiencia y en lo que la gente de la zona disfruta.
        </p>
        <p className="mt-4 text-base leading-7 text-zinc-700">
          Nuestro objetivo es ayudar tanto a locales como a visitantes a encontrar buenos
          restaurantes, cafés y comida típica sin perder tiempo.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-zinc-900">
          También iremos publicando guías como:
        </h2>
        <ul className="mt-4 space-y-2 text-zinc-700">
          <li>- Mejores sopas</li>
          <li>- Mejores desayunos</li>
          <li>- Cafés recomendados</li>
          <li>- Lugares para ir en familia o en pareja</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
        <p className="text-base leading-7 text-zinc-700">
          Si tienes algún lugar que crees que deberíamos probar, escríbenos en Instagram{" "}
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
        <p className="mt-3 text-sm">
          <Link href="/restaurantes" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Ver restaurantes
          </Link>
        </p>
      </section>
    </main>
  );
}
