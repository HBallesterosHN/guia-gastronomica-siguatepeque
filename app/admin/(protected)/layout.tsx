import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/require-admin";
import { logoutAdminSecret } from "../actions";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePlatformAdmin();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <span className="font-semibold text-zinc-900">Admin</span>
            <Link href="/admin/reclamos" className="text-emerald-700 hover:underline">
              Reclamos
            </Link>
            <Link href="/admin/cambios" className="text-emerald-700 hover:underline">
              Cambios
            </Link>
            <Link href="/admin/intake" className="text-emerald-700 hover:underline">
              Intake
            </Link>
            <Link href="/admin/guias" className="text-emerald-700 hover:underline">
              Guías
            </Link>
            <Link href="/admin/restaurantes" className="text-emerald-700 hover:underline">
              Restaurantes
            </Link>
          </nav>
          <form action={logoutAdminSecret}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Cerrar clave admin
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}
