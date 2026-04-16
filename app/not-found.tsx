import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
        Guia Gastronomica de Siguatepeque
      </p>
      <h1 className="text-3xl font-bold text-zinc-900">Pagina no encontrada</h1>
      <p className="text-zinc-600">
        El contenido que buscas no existe o fue movido a otra ruta.
      </p>
      <Link
        href="/restaurantes"
        className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Ver restaurantes
      </Link>
    </main>
  );
}
