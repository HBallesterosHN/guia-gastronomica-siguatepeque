import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guía Gastronómica de Siguatepeque",
  description:
    "Descubre restaurantes, café, comida típica y experiencias gastronómicas en Siguatepeque.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-50 text-zinc-900">
        <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="text-lg font-bold text-zinc-900">
              Guía Gastronómica
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-zinc-700">
              <Link href="/" className="hover:text-zinc-900">
                Inicio
              </Link>
              <Link href="/restaurantes" className="hover:text-zinc-900">
                Restaurantes
              </Link>
              <Link
                href="/guias/mejores-sopas-en-siguatepeque"
                className="hover:text-zinc-900"
              >
                Guías
              </Link>
              <Link href="/sobre" className="hover:text-zinc-900">
                SOBRE
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
