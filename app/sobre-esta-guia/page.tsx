import type { Metadata } from "next";
import Link from "next/link";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_PROFILE_URL,
  SITE_BRAND_NAME,
  SITE_PAGE_TITLE_SUFFIX,
} from "@/lib/site-brand";

export const metadata: Metadata = {
  title: `Sobre el proyecto ${SITE_PAGE_TITLE_SUFFIX}`,
  description:
    "Contexto de la guía local Me Voy a Sigua: criterio editorial, guías temáticas y cómo enviar recomendaciones.",
};

const themes = ["Mejores sopas", "Desayunos", "Cafés", "Comida típica", "Parrilladas"];

export default function SobreEstaGuiaPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {SITE_BRAND_NAME}
        </p>
        <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">Sobre el proyecto</h1>
        <p className="max-w-3xl text-zinc-600">
          Contenido principal actualizado en{" "}
          <Link href="/sobre" className="font-semibold text-emerald-700 hover:text-emerald-800">
            /sobre
          </Link>
          . Esta página resume el espíritu del sitio: guía local, criterio editorial y cero relleno
          con reseñas falsas.
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
            href={INSTAGRAM_PROFILE_URL}
            className="font-semibold text-emerald-700 hover:text-emerald-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            Enviar recomendación por Instagram @{INSTAGRAM_HANDLE}
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
