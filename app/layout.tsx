import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  SITE_BRAND_NAME,
  SITE_BRAND_SHORT,
} from "@/lib/site-brand";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Fallback para rutas sin `generateMetadata` / `metadata` propio. */
const defaultTitle = `${SITE_BRAND_NAME} · ${SITE_BRAND_SHORT} de Siguatepeque`;
const defaultDescription =
  "Restaurantes, cafés y comida típica en Siguatepeque: fichas con horario, mapa y valoraciones públicas cuando existen. Guía local hecha para quien vive aquí y para quien nos visita.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: defaultTitle,
  description: defaultDescription,
  keywords: [
    "Siguatepeque",
    "mevoyasigua",
    "restaurantes Siguatepeque",
    "café Siguatepeque",
    "comida típica Honduras",
    "guía gastronómica",
  ],
  openGraph: {
    type: "website",
    locale: "es_HN",
    siteName: SITE_BRAND_NAME,
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900">
        <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link href="/" className="min-w-0 shrink-0">
              <span className="block text-lg font-bold leading-tight text-zinc-900">
                {SITE_BRAND_NAME}
              </span>
              <span className="block text-xs font-medium text-zinc-500">
                {SITE_BRAND_SHORT} · Siguatepeque
              </span>
            </Link>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-zinc-700 sm:justify-end">
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
        </header>
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
