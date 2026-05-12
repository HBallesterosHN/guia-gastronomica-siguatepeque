import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { summarizeChangeRequestForAdminList } from "@/lib/admin-change-summary";

function orderStatus(s: string): number {
  if (s === "pending") return 0;
  if (s === "approved") return 1;
  return 2;
}

export default async function AdminCambiosPage() {
  const rows = await prisma.restaurantChangeRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      restaurant: { select: { slug: true, name: true } },
      user: { select: { email: true } },
    },
  });

  const sorted = [...rows].sort((a, b) => {
    const d = orderStatus(a.status) - orderStatus(b.status);
    if (d !== 0) return d;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Solicitudes de cambios</h1>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-[880px] w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-600">
            <tr>
              <th className="px-3 py-2">Restaurante</th>
              <th className="px-3 py-2">Usuario</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Resumen</th>
              <th className="px-3 py-2 text-right">Ver</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sorted.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2">
                  <div className="font-medium">{r.restaurant.name}</div>
                  <div className="font-mono text-xs text-zinc-500">{r.restaurant.slug}</div>
                </td>
                <td className="px-3 py-2 text-xs">{r.user.email ?? r.userId}</td>
                <td className="px-3 py-2 capitalize">{r.status}</td>
                <td className="px-3 py-2 whitespace-nowrap text-zinc-600">
                  {r.createdAt.toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" })}
                </td>
                <td className="px-3 py-2 text-xs text-zinc-700">
                  {summarizeChangeRequestForAdminList(r.changes, r.imageUrls)}
                </td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href={`/admin/cambios/${r.id}`}
                    className="rounded-lg bg-zinc-900 px-2 py-1 text-xs font-semibold text-white"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
