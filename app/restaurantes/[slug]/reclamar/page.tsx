import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRestaurantBySlug } from "@/lib/restaurants";
import { ClaimProfileForm } from "./ClaimProfileForm";
import { SignInGoogleForm } from "@/components/auth/SignInGoogleForm";
import { SITE_PAGE_TITLE_SUFFIX } from "@/lib/site-brand";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRestaurantBySlug(slug);
  const title = r
    ? `Reclamar perfil · ${r.identity.name} ${SITE_PAGE_TITLE_SUFFIX}`
    : `Reclamar perfil ${SITE_PAGE_TITLE_SUFFIX}`;
  return { title, robots: { index: false, follow: true } };
}

export default async function ReclamarPerfilPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    redirect("/restaurantes");
  }

  const session = await auth();
  const callbackUrl = `/restaurantes/${slug}/reclamar`;

  return (
    <main className="mx-auto w-full max-w-lg space-y-8 px-4 py-10 sm:px-6">
      <nav className="text-sm text-zinc-600">
        <Link href={`/restaurantes/${slug}`} className="font-medium text-emerald-700 hover:underline">
          ← {restaurant.identity.name}
        </Link>
      </nav>
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-zinc-900">Reclamar este perfil</h1>
        <p className="text-sm text-zinc-600">
          Si eres el dueño o representante autorizado, envía una solicitud. El equipo revisa cada reclamo
          antes de darte acceso al panel. Los cambios en la ficha pública siguen pasando por aprobación
          editorial.
        </p>
      </header>

      {!session?.user ? (
        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-700">Inicia sesión para continuar.</p>
          <SignInGoogleForm callbackUrl={callbackUrl} />
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm text-zinc-600">
            Sesión: <span className="font-medium text-zinc-900">{session.user.email ?? session.user.name}</span>
          </p>
          <ClaimProfileForm slug={slug} />
        </div>
      )}
    </main>
  );
}
