import Link from "next/link";
import { prisma } from "@/lib/prisma";

function claimStatusOrder(s: string): number {
  if (s === "pending") return 0;
  if (s === "approved") return 1;
  return 2;
}

export default async function AdminReclamosPage() {
  const rows = await prisma.restaurantClaim.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, name: true } } },
  });

  const sorted = [...rows].sort((a, b) => {
    const d = claimStatusOrder(a.status) - claimStatusOrder(b.status);
    if (d !== 0) return d;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Reclamos de perfil</h1>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-600">
            <tr>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Solicitante</th>
              <th className="px-3 py-2">Usuario</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2 text-right">Ver</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sorted.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2 font-mono text-xs">{r.restaurantSlug}</td>
                <td className="px-3 py-2">{r.ownerName}</td>
                <td className="px-3 py-2 text-xs text-zinc-600">{r.user.email ?? r.user.name ?? r.userId}</td>
                <td className="px-3 py-2 capitalize">{r.status}</td>
                <td className="px-3 py-2 whitespace-nowrap text-zinc-600">
                  {r.createdAt.toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" })}
                </td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href={`/admin/reclamos/${r.id}`}
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
