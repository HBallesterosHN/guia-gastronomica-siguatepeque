import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre esta guía | Guía Gastronómica de Siguatepeque",
  description:
    "Conoce qué es esta guía local y curada de Siguatepeque, para quién está hecha y cómo puedes recomendarnos nuevos lugares.",
};

const themes = ["Mejores sopas", "Desayunos", "Cafés", "Comida típica", "Parrilladas"];

export default function SobreEstaGuiaPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Identidad del proyecto
        </p>
        <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">Sobre esta guía</h1>
        <p className="max-w-3xl text-zinc-600">
          Esta es una guía gastronómica de Siguatepeque, creada para ayudarte a elegir mejor
          dónde comer. No buscamos listar por listar: queremos recomendar lugares útiles, reales
          y fáciles de aprovechar, tanto si vives aquí como si andas de visita.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900">Guía local y curada</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Este proyecto se construye desde una mirada local. Cada perfil y cada guía temática
            se publica con criterio editorial para que encuentres información clara: ubicación,
            contacto, tipo de comida y por qué vale la pena ir.
          </p>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900">Para locales y turistas</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Queremos que esta guía te funcione en el día a día y también cuando recibes visitas.
            Si eres de Siguatepeque, te ahorra tiempo para decidir. Si vienes por primera vez, te
            orienta rápido hacia opciones confiables.
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-zinc-900">Guías temáticas que vienen</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Iremos publicando guías por tema para resolver antojos concretos y momentos
          específicos: desde una sopa para el frío hasta un café para reunirse o un desayuno de
          fin de semana.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {themes.map((theme) => (
            <span
              key={theme}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
            >
              {theme}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
        <h2 className="text-xl font-semibold text-zinc-900">Tu recomendación también cuenta</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Queremos construir esto con la comunidad. Si conoces un lugar que deberíamos evaluar o
          una guía temática que te gustaría ver publicada, escríbenos y lo tomamos en cuenta para
          las siguientes actualizaciones.
        </p>
        <p className="mt-3 text-sm">
          <a
            href="https://www.instagram.com/mevoyasigua/"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            Enviar recomendación por Instagram @mevoyasigua
          </a>
        </p>
      </section>

      <footer className="text-sm text-zinc-600">
        <Link href="/restaurantes" className="font-semibold text-emerald-700 hover:text-emerald-800">
          Explorar restaurantes
        </Link>
      </footer>
    </main>
  );
}
