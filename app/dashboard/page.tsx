import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const ownerships = await prisma.restaurantOwnership.findMany({
    where: { userId: session.user.id, status: "active" },
    include: { restaurant: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">Mi cuenta</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Hola, {session.user.name ?? session.user.email}. Aquí aparecen los restaurantes vinculados a tu
          cuenta tras aprobación del equipo.
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Mis restaurantes</h2>
        {ownerships.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">
            Aún no tienes restaurantes aprobados. Reclama un perfil desde la ficha pública y espera la
            revisión.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100">
            {ownerships.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-zinc-900">{o.restaurant.name}</p>
                  <p className="text-xs text-zinc-500">{o.restaurant.slug}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/restaurantes/${o.restaurant.slug}`}
                    className="text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    Ver ficha
                  </Link>
                  <Link
                    href={`/dashboard/restaurants/${o.restaurant.slug}/solicitar`}
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    Solicitar cambios
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
