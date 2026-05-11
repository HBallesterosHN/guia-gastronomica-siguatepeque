import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { userOwnsRestaurantSlug } from "@/lib/assert-ownership";
import { OwnerChangeRequestForm } from "./OwnerChangeRequestForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SolicitarCambiosPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/dashboard/restaurants/${slug}/solicitar`)}`);
  }

  const own = await userOwnsRestaurantSlug(session.user.id, slug.trim());
  if (!own) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto w-full max-w-lg space-y-6 px-4 py-10 sm:px-6">
      <nav className="text-sm text-zinc-600">
        <Link href="/dashboard" className="font-medium text-emerald-700 hover:underline">
          ← Panel
        </Link>
      </nav>
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">Solicitar cambios</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Los cambios no se publican hasta que un editor apruebe la solicitud.
        </p>
      </header>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <OwnerChangeRequestForm slug={slug} />
      </div>
    </main>
  );
}
