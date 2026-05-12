import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { prismaRowToAdminEditorInitial } from "@/lib/admin-restaurant-editor-initial";
import { getRestaurantBySlugFromFiles } from "@/lib/restaurants-file";
import { getGuideMembershipsForRestaurant, listAllGuidesForRestaurantEditor } from "@/lib/guides-data";
import { importRestaurantFromFileToDbAction } from "../../actions";
import { AdminRestaurantEditForm } from "./admin-restaurant-edit-form";
import { AdminRestaurantGuidesSection } from "./admin-restaurant-guides-section";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminRestaurantEditPage({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw).trim();
  if (!slug) notFound();

  const row = await prisma.restaurant.findUnique({ where: { slug } });
  if (!row) {
    const file = getRestaurantBySlugFromFiles(slug);
    if (!file) notFound();
    return (
      <div className="space-y-6">
        <p className="text-sm text-zinc-600">
          El slug <span className="font-mono">{slug}</span> existe en archivos pero no en la base de datos.
        </p>
        <form action={importRestaurantFromFileToDbAction.bind(null, slug)}>
          <button
            type="submit"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Importar a base de datos
          </button>
        </form>
        <p className="text-xs text-zinc-500">
          Tras importar se creará la fila con datos del archivo (source manual, no verificado) y podrás editarla aquí.
        </p>
      </div>
    );
  }

  const initial = prismaRowToAdminEditorInitial(row);

  const allGuides = await listAllGuidesForRestaurantEditor();
  const memberships = await getGuideMembershipsForRestaurant(row.id);
  const guideRows = allGuides.map((g) => {
    const m = memberships.find((x) => x.guideId === g.id);
    return {
      guideId: g.id,
      slug: g.slug,
      title: g.title,
      status: g.status,
      selected: Boolean(m),
      label: m?.label?.trim() ?? "",
      note: m?.note?.trim() ?? "",
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Editar restaurante</h1>
          <p className="mt-1 text-sm text-amber-900">
            Estás editando como administrador. Los cambios se publican de inmediato en la ficha pública (Neon tiene
            prioridad sobre archivos).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/restaurantes/${encodeURIComponent(row.slug)}`}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Ver perfil público
          </Link>
          <Link href="/admin/restaurantes" className="text-sm font-medium text-emerald-700 hover:underline">
            ← Lista
          </Link>
        </div>
      </div>
      <AdminRestaurantEditForm initial={initial} />
      <AdminRestaurantGuidesSection
        restaurantId={row.id}
        rows={guideRows}
      />
    </div>
  );
}
