import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isPlatformAdmin } from "@/lib/require-admin";
import { loginAdminSecret, logoutAdminSecret } from "./actions";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminBootstrapPage({ searchParams }: PageProps) {
  if (await isPlatformAdmin()) {
    redirect("/admin/reclamos");
  }

  const sp = await searchParams;
  const showError = sp.error === "1";
  const session = await auth();

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Administración</p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">Acceso</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Entra con una cuenta Google marcada como <strong>admin</strong> en la base, o usa la clave
          temporal <code className="rounded bg-zinc-200 px-1">ADMIN_SECRET</code> (cookie httpOnly).
        </p>
      </div>

      {session?.user ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Sesión activa como {session.user.email}. Si necesitas permisos de admin, pide que actualicen tu
          rol en la tabla <code className="rounded bg-amber-100 px-1">users.role</code>.
        </p>
      ) : null}

      {showError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Clave incorrecta.
        </p>
      ) : null}

      <form action={loginAdminSecret} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="secret" className="block text-sm font-medium text-zinc-800">
            Clave ADMIN_SECRET
          </label>
          <input
            id="secret"
            name="secret"
            type="password"
            autoComplete="current-password"
            className="mt-1.5 w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm"
          />
        </div>
        <button type="submit" className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white">
          Entrar con clave
        </button>
      </form>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-zinc-600">O inicia sesión con Google (cuenta admin)</p>
        <Link
          href="/auth/signin?callbackUrl=/admin"
          className="mt-3 inline-flex w-full justify-center rounded-xl border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
        >
          Ir a login Google
        </Link>
      </div>

      <form action={logoutAdminSecret} className="text-center">
        <button type="submit" className="text-xs text-zinc-500 underline">
          Borrar cookie de clave admin
        </button>
      </form>

      <p className="text-center text-xs text-zinc-500">
        <Link href="/" className="text-emerald-700 hover:underline">
          Volver al sitio
        </Link>
      </p>
    </main>
  );
}
