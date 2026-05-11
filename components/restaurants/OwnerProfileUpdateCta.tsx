import { INSTAGRAM_PROFILE_URL } from "@/lib/site-brand";

/**
 * CTA ligero para validar interés de dueños en actualizar la ficha (sin login ni formularios).
 */
export function OwnerProfileUpdateCta() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/90 p-4">
      <h3 className="text-sm font-semibold text-zinc-900">
        ¿Eres el dueño de este restaurante?
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-zinc-600">
        Si quieres actualizar fotos, menú, horario o información de contacto, escríbenos y revisamos
        el perfil.
      </p>
      <a
        href={INSTAGRAM_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-900"
      >
        Solicitar actualización
      </a>
    </div>
  );
}
