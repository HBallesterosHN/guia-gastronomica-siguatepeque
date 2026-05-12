import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FILE_GUIDE_DEFINITIONS } from "@/lib/guides-file-fallback";

interface PageProps {
  searchParams?: Promise<{ q?: string; status?: string }>;
}

export default async function AdminGuidesListPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const statusFilter = typeof sp.status === "string" ? sp.status.trim() : "all";

  const where: import("@prisma/client").Prisma.GuideWhereInput = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }
  if (statusFilter && statusFilter !== "all") {
    where.status = statusFilter;
  }

  const rows = await prisma.guide.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { guideRestaurants: true } },
    },
  });

  /** Slugs en Neon (sin filtros de búsqueda): el aviso no debe depender de `rows` filtrados. */
  const dbSlugSet = new Set(
    (await prisma.guide.findMany({ select: { slug: true } })).map((g) => g.slug),
  );
  const fileOnlyCount = FILE_GUIDE_DEFINITIONS.filter((f) => !dbSlugSet.has(f.slug)).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Guías editoriales (Neon)</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600">
            Contenido curado para la web pública. Las guías en base de datos tienen prioridad sobre las
            definiciones en código cuando el slug coincide. Tras migrar, edita aquí título, SEO y
            restaurantes asociados.
          </p>
        </div>
        <Link
          href="/admin/guias/nueva"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Nueva guía
        </Link>
      </div>

      {fileOnlyCount > 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Hay {fileOnlyCount} guía(s) solo en código. Ejecuta{" "}
          <code className="rounded bg-amber-100 px-1">npm run guides:migrate</code> para copiarlas a Neon sin
          duplicar relaciones.
        </p>
      ) : null}

      <form className="flex flex-wrap items-end gap-3" method="get" action="/admin/guias">
        <label className="block text-sm">
          <span className="font-medium text-zinc-800">Buscar</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Título o slug"
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
        <Link href="/admin/guias" className="text-sm text-emerald-700 hover:underline">
          Limpiar
        </Link>
      </form>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Destacada</th>
              <th className="px-4 py-3">Rest.</th>
              <th className="px-4 py-3">Actualizado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-medium text-zinc-900">{r.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-700">{r.slug}</td>
                <td className="px-4 py-3 capitalize text-zinc-700">{r.status}</td>
                <td className="px-4 py-3">{r.featured ? "Sí" : "No"}</td>
                <td className="px-4 py-3">{r._count.guideRestaurants}</td>
                <td className="px-4 py-3 text-xs text-zinc-600">{r.updatedAt.toISOString().slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/guias/${encodeURIComponent(r.slug)}/editar`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      Editar
                    </Link>
                    {r.status === "published" ? (
                      <Link
                        href={`/guias/${encodeURIComponent(r.slug)}`}
                        className="text-zinc-500 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver pública
                      </Link>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">No hay guías en la base de datos.</p>
        ) : null}
      </div>
    </div>
  );
}
