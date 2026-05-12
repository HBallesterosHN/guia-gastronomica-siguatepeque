import Link from "next/link";
import { redirect } from "next/navigation";
import { OwnershipStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const ownerships = await prisma.restaurantOwnership.findMany({
    where: { userId: session.user.id, status: OwnershipStatus.active },
    include: { restaurant: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">Panel de dueño</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Hola, {session.user.name ?? session.user.email}. Aquí ves los perfiles vinculados a tu cuenta
          después de que el equipo apruebe el reclamo.
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Tus restaurantes</h2>
        {ownerships.length === 0 ? (
          <div className="mt-4 space-y-3 text-sm text-zinc-600">
            <p>Aún no tienes perfiles aprobados.</p>
            <p>
              Reclama un perfil desde la ficha pública del restaurante y espera la revisión del equipo.
            </p>
            <Link
              href="/restaurantes"
              className="inline-flex font-semibold text-emerald-700 hover:underline"
            >
              Volver a restaurantes
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100">
            {ownerships.map((o) => (
              <li key={o.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-zinc-900">{o.restaurant.name}</p>
                  <p className="font-mono text-xs text-zinc-500">{o.restaurant.slug}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Estado ficha: <span className="capitalize text-zinc-700">{o.restaurant.status}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/restaurantes/${o.restaurant.slug}`}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                  >
                    Ver ficha
                  </Link>
                  <Link
                    href={`/dashboard/restaurantes/${o.restaurant.slug}`}
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    Editar información
                  </Link>
                  <Link
                    href={`/dashboard/restaurantes/${o.restaurant.slug}/fotos`}
                    className="rounded-lg border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
                  >
                    Gestionar fotos
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
