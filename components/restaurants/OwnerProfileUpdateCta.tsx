import Link from "next/link";

type OwnerProfileUpdateCtaProps = {
  slug: string;
  /** Bloque destacado en la columna principal (`banner`) o tarjeta en la barra lateral (`aside`). */
  variant?: "banner" | "aside";
};

/**
 * CTA para dueños: solicitud de cambios vía formulario (revisión editorial manual, sin login).
 */
export function OwnerProfileUpdateCta({ slug, variant = "aside" }: OwnerProfileUpdateCtaProps) {
  const href = `/restaurantes/${slug}/actualizar`;

  if (variant === "banner") {
    return (
      <section
        className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-zinc-50/80 p-6 shadow-sm ring-1 ring-emerald-100/60 sm:p-8"
        aria-labelledby="owner-update-heading"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-2">
            <h2
              id="owner-update-heading"
              className="text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl"
            >
              ¿Eres el dueño de este restaurante?
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
              Puedes solicitar actualizar fotos, menú, horarios o información de contacto. Revisamos
              manualmente cada solicitud antes de publicarla.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href={href}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 md:w-auto"
            >
              Solicitar actualización
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white p-5 shadow-sm ring-1 ring-emerald-100/70">
      <h3 className="text-base font-semibold text-zinc-900">¿Eres el dueño de este restaurante?</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        Puedes solicitar actualizar fotos, menú, horarios o información de contacto. Revisamos
        manualmente cada solicitud antes de publicarla.
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
      >
        Solicitar actualización
      </Link>
    </div>
  );
}
