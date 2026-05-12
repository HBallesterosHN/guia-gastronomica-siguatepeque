import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAllRestaurantsFromFiles } from "@/lib/restaurants-file";
import { importRestaurantFromFileToDbAction } from "./actions";

interface PageProps {
  searchParams?: Promise<{ q?: string; status?: string }>;
}

export default async function AdminRestaurantsListPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const statusFilter = typeof sp.status === "string" ? sp.status.trim() : "all";

  const where: import("@prisma/client").Prisma.RestaurantWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }
  if (statusFilter && statusFilter !== "all") {
    where.status = statusFilter;
  }

  const rows = await prisma.restaurant.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: {
      slug: true,
      name: true,
      category: true,
      status: true,
      verified: true,
      featured: true,
      ratingAverage: true,
      updatedAt: true,
    },
  });

  const dbSlugs = new Set(rows.map((r) => r.slug));
  const fileOnly = getAllRestaurantsFromFiles().filter((f) => !dbSlugs.has(f.identity.slug));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Restaurantes (Neon)</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Lista y edición directa en base de datos. Los cambios se publican al instante en la web.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3" method="get" action="/admin/restaurantes">
        <label className="block text-sm">
          <span className="font-medium text-zinc-800">Buscar</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Nombre o slug"
            className="mt-1 w-56 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-800">Estado</span>
          <select
            name="status"
            defaultValue={statusFilter}
            className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="all">Todos</option>
            <option value="published">published</option>
            <option value="draft">draft</option>
            <option value="hidden">hidden</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Filtrar
        </button>
        <Link href="/admin/restaurantes" className="text-sm text-emerald-700 hover:underline">
          Limpiar
        </Link>
      </form>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Destacado</th>
              <th className="px-4 py-3">Verif.</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Actualizado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-medium text-zinc-900">{r.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-700">{r.slug}</td>
                <td className="px-4 py-3 text-zinc-700">{r.category}</td>
                <td className="px-4 py-3 capitalize text-zinc-700">{r.status}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-zinc-700">{r.featured ? "Sí" : "No"}</span>
                    <span
                      className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        r.featured
                          ? "bg-amber-100 text-amber-900 ring-1 ring-amber-200"
                          : "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200"
                      }`}
                    >
                      {r.featured ? "Destacado" : "Normal"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">{r.verified ? "Sí" : "No"}</td>
                <td className="px-4 py-3">{r.ratingAverage.toFixed(1)}</td>
                <td className="px-4 py-3 text-xs text-zinc-600">
                  {r.updatedAt.toISOString().slice(0, 10)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/restaurantes/${encodeURIComponent(r.slug)}/editar`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/restaurantes/${encodeURIComponent(r.slug)}`}
                      className="text-zinc-500 hover:underline"
                    >
                      Ver público
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">No hay resultados en la base de datos.</p>
        ) : null}
      </div>

      {fileOnly.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900">Solo en archivos (importar a DB)</h2>
          <p className="text-sm text-zinc-600">
            Estos slugs existen en <code className="rounded bg-zinc-100 px-1">data/restaurants</code> pero no tienen
            fila en Neon. Importa para poder editarlos aquí; la web seguirá priorizando DB.
          </p>
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
            {fileOnly.map((f) => (
              <li
                key={f.identity.slug}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium text-zinc-900">{f.identity.name}</span>{" "}
                  <span className="font-mono text-xs text-zinc-600">{f.identity.slug}</span>
                </div>
                <form action={importRestaurantFromFileToDbAction.bind(null, f.identity.slug)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
                  >
                    Importar a DB
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
