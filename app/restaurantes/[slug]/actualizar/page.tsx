import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RestaurantUpdateRequestForm } from "./RestaurantUpdateRequestForm";
import { getRestaurantBySlug } from "@/lib/restaurants";
import { SITE_BRAND_NAME, SITE_PAGE_TITLE_SUFFIX } from "@/lib/site-brand";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    return { title: `Solicitar actualización ${SITE_PAGE_TITLE_SUFFIX}` };
  }
  const title = `Solicitar actualización · ${restaurant.identity.name} ${SITE_PAGE_TITLE_SUFFIX}`;
  return {
    title,
    description: `Formulario para dueños de ${restaurant.identity.name}: solicitar cambios en la ficha (revisión manual).`,
    robots: { index: false, follow: true },
  };
}

export default async function RestaurantUpdateRequestPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const name = restaurant.identity.name;

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 py-10 sm:px-6">
      <nav className="text-sm text-zinc-600">
        <Link href="/restaurantes" className="font-medium text-emerald-700 hover:text-emerald-800">
          Restaurantes
        </Link>
        <span className="mx-2 text-zinc-400">/</span>
        <Link
          href={`/restaurantes/${slug}`}
          className="font-medium text-emerald-700 hover:text-emerald-800"
        >
          {name}
        </Link>
        <span className="mx-2 text-zinc-400">/</span>
        <span className="text-zinc-900">Actualizar</span>
      </nav>

      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {SITE_BRAND_NAME}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Solicitar actualización</h1>
        <p className="text-base leading-relaxed text-zinc-600">
          Estás solicitando cambios para <span className="font-semibold text-zinc-900">{name}</span>.
          No publicamos cambios automáticos: el equipo revisa cada solicitud antes de actualizar la
          ficha.
        </p>
      </header>

      <RestaurantUpdateRequestForm slug={slug} restaurantName={name} />
    </main>
  );
}
