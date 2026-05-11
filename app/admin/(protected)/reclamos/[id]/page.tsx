import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { approveRestaurantClaimAction, rejectRestaurantClaimAction } from "./actions";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}

export default async function AdminReclamoDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;

  const row = await prisma.restaurantClaim.findUnique({
    where: { id },
    include: { user: { select: { email: true, name: true } }, restaurant: true },
  });
  if (!row) notFound();

  const pending = row.status === "pending";

  return (
    <main className="space-y-6">
      <Link href="/admin/reclamos" className="text-sm font-medium text-emerald-700 hover:underline">
        ← Reclamos
      </Link>

      {sp.ok === "approved" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Reclamo aprobado. Se creó o actualizó la fila en Neon y la titularidad del usuario.
        </p>
      ) : null}
      {sp.ok === "rejected" ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">Reclamo rechazado.</p>
      ) : null}
      {sp.error === "already" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">Ya no está pendiente.</p>
      ) : null}
      {sp.error === "no_file" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm">
          No hay ficha en archivos para este slug; no se puede crear el restaurante en DB.
        </p>
      ) : null}
      {sp.error === "other_owner" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm">
          Ya existe otro titular activo para este restaurante en la base.
        </p>
      ) : null}

      <h1 className="text-2xl font-bold">Reclamo · {row.restaurantSlug}</h1>
      <p className="text-sm text-zinc-600">
        Estado: <strong>{row.status}</strong> · {row.createdAt.toLocaleString("es-HN")}
      </p>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 text-sm">
        <h2 className="font-semibold">Solicitante</h2>
        <p className="mt-2">Nombre: {row.ownerName}</p>
        <p>Teléfono: {row.ownerPhone ?? "—"}</p>
        <p>Email: {row.ownerEmail ?? "—"}</p>
        <p className="mt-2 whitespace-pre-wrap">Mensaje: {row.message ?? "—"}</p>
        <p className="mt-2">Evidencia: {row.evidenceUrl ?? "—"}</p>
        <p className="mt-2 text-zinc-500">
          Cuenta: {row.user.email ?? row.user.name ?? row.userId}
        </p>
      </section>

      {pending ? (
        <div className="flex flex-wrap gap-3">
          <form action={approveRestaurantClaimAction.bind(null, row.id)}>
            <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
              Aprobar
            </button>
          </form>
          <form action={rejectRestaurantClaimAction.bind(null, row.id)}>
            <button type="submit" className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold">
              Rechazar
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
