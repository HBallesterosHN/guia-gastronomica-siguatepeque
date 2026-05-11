import Link from "next/link";
import { SignInGoogleForm } from "@/components/auth/SignInGoogleForm";

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const callbackUrl =
    typeof sp.callbackUrl === "string" && sp.callbackUrl.startsWith("/") ? sp.callbackUrl : "/dashboard";

  const googleReady =
    Boolean(process.env.AUTH_GOOGLE_ID?.trim()) && Boolean(process.env.AUTH_GOOGLE_SECRET?.trim());

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Usa tu cuenta de Google para reclamar un perfil o gestionar restaurantes aprobados.
        </p>
      </div>
      {!googleReady ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Falta configurar <code className="rounded bg-amber-100 px-1">AUTH_GOOGLE_ID</code> y{" "}
          <code className="rounded bg-amber-100 px-1">AUTH_GOOGLE_SECRET</code> en el entorno.
        </p>
      ) : null}
      <SignInGoogleForm callbackUrl={callbackUrl} disabled={!googleReady} />
      <p className="text-center text-xs text-zinc-500">
        <Link href="/" className="text-emerald-700 hover:underline">
          Volver al inicio
        </Link>
      </p>
    </main>
  );
}
