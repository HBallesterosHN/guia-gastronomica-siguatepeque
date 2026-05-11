import Link from "next/link";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_PROFILE_URL,
  SITE_BRAND_NAME,
  SITE_INDEPENDENT_LINE,
} from "@/lib/site-brand";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-md space-y-2">
          <p className="text-sm font-semibold text-zinc-900">{SITE_BRAND_NAME}</p>
          <p className="text-sm leading-relaxed text-zinc-600">{SITE_INDEPENDENT_LINE}</p>
        </div>
        <div className="flex flex-col gap-3 text-sm sm:items-end sm:text-right">
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Instagram @{INSTAGRAM_HANDLE}
          </a>
          <p className="text-zinc-600">
            ¿Sugerencias o correcciones?{" "}
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Escríbenos por Instagram
            </a>
            .
          </p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-zinc-600">
            <Link href="/" className="hover:text-zinc-900">
              Inicio
            </Link>
            <Link href="/restaurantes" className="hover:text-zinc-900">
              Restaurantes
            </Link>
            <Link href="/guias" className="hover:text-zinc-900">
              Guías
            </Link>
            <Link href="/sobre" className="hover:text-zinc-900">
              Sobre
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
