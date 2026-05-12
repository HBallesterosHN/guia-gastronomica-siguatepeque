import Link from "next/link";
import { notFound } from "next/navigation";
import { OwnershipStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  approveRestaurantClaimAction,
  rejectRestaurantClaimAction,
  setRestaurantOwnershipStatusAction,
} from "./actions";

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

  const restaurantResolved =
    row.restaurant ??
    (await prisma.restaurant.findUnique({
      where: { slug: row.restaurantSlug },
      select: { id: true, slug: true, name: true },
    }));

  const ownerships = restaurantResolved
    ? await prisma.restaurantOwnership.findMany({
        where: { restaurantId: restaurantResolved.id },
        include: { user: { select: { email: true, name: true } } },
        orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      })
    : [];

  const returnTo = `/admin/reclamos/${id}`;

  return (
    <main className="space-y-6">
      <Link href="/admin/reclamos" className="text-sm font-medium text-emerald-700 hover:underline">
        ← Reclamos
      </Link>

      {sp.ok === "approved" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Reclamo aprobado. Titularidad actualizada (puede haber varios usuarios autorizados por restaurante).
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

      <h1 className="text-2xl font-bold text-zinc-900">Reclamo · {row.restaurantSlug}</h1>
      <p className="text-sm text-zinc-600">
        Estado: <strong className="capitalize">{row.status}</strong> ·{" "}
        {row.createdAt.toLocaleString("es-HN")}
      </p>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 text-sm">
        <h2 className="font-semibold text-zinc-900">Solicitante</h2>
        <p className="mt-2">Nombre: {row.ownerName}</p>
        <p>Teléfono: {row.ownerPhone ?? "—"}</p>
        <p>Email: {row.ownerEmail ?? "—"}</p>
        <p className="mt-2 whitespace-pre-wrap">Mensaje: {row.message ?? "—"}</p>
        <p className="mt-2">Evidencia: {row.evidenceUrl ?? "—"}</p>
        <p className="mt-2 text-zinc-500">
          Cuenta: {row.user.email ?? row.user.name ?? row.userId}
        </p>
      </section>

      {restaurantResolved ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-4 text-sm shadow-sm">
          <h2 className="font-semibold text-zinc-900">Usuarios autorizados en la ficha</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Varios usuarios pueden tener acceso. Solo los <strong>activos</strong> ven el panel y pueden
            solicitar cambios. Desactivar revoca acceso sin borrar el vínculo.
          </p>
          {ownerships.length === 0 ? (
            <p className="mt-3 text-zinc-600">Aún no hay titulares en base para este restaurante.</p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100">
              {ownerships.map((o) => (
                <li key={o.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-zinc-900">{o.user.email ?? o.user.name ?? o.userId}</p>
                    <p className="text-xs text-zinc-500">
                      Rol: <span className="capitalize">{o.role}</span> · Estado:{" "}
                      <span className={o.status === OwnershipStatus.active ? "text-emerald-700" : "text-zinc-500"}>
                        {o.status}
                      </span>
                    </p>
                  </div>
                  <form action={setRestaurantOwnershipStatusAction} className="flex flex-wrap gap-2">
                    <input type="hidden" name="ownershipId" value={o.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    {o.status === OwnershipStatus.active ? (
                      <>
                        <input type="hidden" name="nextStatus" value="inactive" />
                        <button
                          type="submit"
                          className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                        >
                          Desactivar
                        </button>
                      </>
                    ) : (
                      <>
                        <input type="hidden" name="nextStatus" value="active" />
                        <button
                          type="submit"
                          className="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
                        >
                          Reactivar
                        </button>
                      </>
                    )}
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {pending ? (
        <section className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
          <h2 className="text-sm font-semibold text-emerald-900">Aprobar este reclamo</h2>
          <p className="text-xs text-emerald-800/90">
            Puedes sumar a este usuario como titular adicional aunque ya existan otros activos. Elige el rol
            antes de aprobar.
          </p>
          <form action={approveRestaurantClaimAction.bind(null, row.id)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1">
              <label htmlFor="ownershipRole" className="text-xs font-medium text-zinc-700">
                Rol en la ficha
              </label>
              <select
                id="ownershipRole"
                name="ownershipRole"
                defaultValue="owner"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="owner">Dueño (owner)</option>
                <option value="manager">Gerente (manager)</option>
                <option value="editor">Editor (editor)</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                Aprobar
              </button>
            </div>
          </form>
          <form action={rejectRestaurantClaimAction.bind(null, row.id)}>
            <button type="submit" className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold">
              Rechazar
            </button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
