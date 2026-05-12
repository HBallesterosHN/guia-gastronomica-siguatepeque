"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { submitOwnerInfoChangeRequest, type ChangeRequestActionState } from "./actions";

const initial: ChangeRequestActionState = { ok: false };

export function OwnerRestaurantEditForm({
  slug,
  restaurantName,
}: {
  slug: string;
  restaurantName: string;
}) {
  const bound = submitOwnerInfoChangeRequest.bind(null, slug);
  const [state, formAction, pending] = useActionState(bound, initial);

  useEffect(() => {
    if (state.ok === true) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state]);

  if (state.ok === true) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
        <p className="font-medium">
          Solicitud enviada. El equipo revisará los cambios antes de publicarlos en la ficha de{" "}
          {restaurantName}.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/dashboard" className="text-emerald-800 underline">
            Volver al panel
          </Link>
          <Link href={`/dashboard/restaurantes/${slug}/fotos`} className="text-emerald-800 underline">
            Gestionar fotos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.ok === false && state.message ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.message}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-zinc-800">Teléfono del negocio</label>
          <input
            name="phone"
            type="tel"
            placeholder="9755-3669 o +504 …"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-800">WhatsApp</label>
          <input
            name="whatsapp"
            type="tel"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-800">Horario sugerido</label>
        <textarea
          name="scheduleLabel"
          rows={5}
          placeholder={`Una línea por día, por ejemplo:\nLunes 8:00 - 20:00\nMartes 8:00 - 20:00`}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Si escribes varios días con hora, intentamos mostrar tabla en la ficha tras aprobación. Si es texto
          libre, se mostrará en un bloque legible.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-800">URL del menú</label>
        <input name="menuUrl" type="url" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800">URL de Instagram</label>
        <input
          name="instagramUrl"
          type="url"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800">Descripción / resumen sugerido</label>
        <textarea name="summary" rows={4} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800">Mensaje para el equipo editorial</label>
        <textarea
          name="ownerMessage"
          rows={3}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Contexto o notas que ayuden a revisar la solicitud."
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar solicitud de cambios"}
      </button>
    </form>
  );
}
