import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { approveChangeRequestAction, rejectChangeRequestAction } from "./actions";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}

function formatJson(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export default async function AdminCambioDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;

  const row = await prisma.restaurantChangeRequest.findUnique({
    where: { id },
    include: {
      restaurant: true,
      user: { select: { email: true, name: true } },
    },
  });
  if (!row) notFound();

  const pending = row.status === "pending";

  return (
    <main className="space-y-6">
      <Link href="/admin/cambios" className="text-sm font-medium text-emerald-700 hover:underline">
        ← Cambios
      </Link>

      {sp.ok === "approved" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Cambios aplicados al restaurante en Neon.
        </p>
      ) : null}
      {sp.ok === "rejected" ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">Solicitud rechazada.</p>
      ) : null}
      {sp.error === "already" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">Ya no está pendiente.</p>
      ) : null}

      <h1 className="text-2xl font-bold">
        Cambio · {row.restaurant.name}{" "}
        <span className="text-base font-normal text-zinc-500">({row.restaurant.slug})</span>
      </h1>
      <p className="text-sm text-zinc-600">
        Estado: <strong>{row.status}</strong> · Usuario: {row.user.email ?? row.user.name ?? row.userId}
      </p>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold">changes (JSON)</h2>
        <pre className="mt-2 max-h-64 overflow-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100">
          {formatJson(row.changes)}
        </pre>
      </section>
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold">imageUrls (JSON)</h2>
        <pre className="mt-2 max-h-48 overflow-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100">
          {formatJson(row.imageUrls)}
        </pre>
      </section>

      {pending ? (
        <div className="flex flex-wrap gap-3">
          <form action={approveChangeRequestAction.bind(null, row.id)}>
            <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
              Aprobar y aplicar
            </button>
          </form>
          <form action={rejectChangeRequestAction.bind(null, row.id)}>
            <button type="submit" className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold">
              Rechazar
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
