import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { userOwnsRestaurantSlug } from "@/lib/assert-ownership";
import { OwnerRestaurantEditForm } from "./OwnerRestaurantEditForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function OwnerRestaurantEditPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/dashboard/restaurantes/${slug}`)}`);
  }

  const own = await userOwnsRestaurantSlug(session.user.id, slug.trim());
  if (!own) {
    redirect("/dashboard");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: own.restaurantId },
    select: { name: true, slug: true, status: true },
  });
  if (!restaurant) notFound();

  return (
    <main className="mx-auto w-full max-w-lg space-y-6 px-4 py-10 sm:max-w-xl sm:px-6">
      <nav className="flex flex-wrap gap-3 text-sm text-zinc-600">
        <Link href="/dashboard" className="font-medium text-emerald-700 hover:underline">
          ← Panel
        </Link>
        <Link href={`/dashboard/restaurantes/${slug}/fotos`} className="font-medium text-emerald-700 hover:underline">
          Gestionar fotos
        </Link>
        <Link href={`/restaurantes/${slug}`} className="font-medium text-zinc-500 hover:underline">
          Ver ficha pública
        </Link>
      </nav>
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">Editar información</h1>
        <p className="mt-1 text-sm text-zinc-600">
          <span className="font-medium text-zinc-800">{restaurant.name}</span> ·{" "}
          <span className="font-mono text-xs">{restaurant.slug}</span> · Estado:{" "}
          <span className="capitalize">{restaurant.status}</span>
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          Los cambios se envían como solicitud; el equipo editorial los revisa antes de publicarlos.
        </p>
      </header>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <OwnerRestaurantEditForm slug={slug} restaurantName={restaurant.name} />
      </div>
    </main>
  );
}
