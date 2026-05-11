import Link from "next/link";
import { SITE_BRAND_NAME } from "@/lib/site-brand";

export function Hero() {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 py-14 text-white shadow-xl sm:px-10">
      <div className="max-w-3xl space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-50">
          {SITE_BRAND_NAME} · Siguatepeque
        </p>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          Dónde comer en Siguatepeque, sin adivinar
        </h1>
        <p className="text-lg text-emerald-50">
          Fichas con datos útiles (horario, cómo llegar, contacto) y guías editoriales para cuando
          te antoja sopa, desayuno campestre o un café tranquilo en la ciudad de los pinares.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/restaurantes"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Ver restaurantes
          </Link>
          <Link
            href="/guias"
            className="rounded-xl border border-white/70 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Ver guías
          </Link>
        </div>
      </div>
    </section>
  );
}
