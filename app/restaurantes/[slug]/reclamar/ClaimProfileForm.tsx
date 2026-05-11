"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { submitRestaurantClaim, type ClaimActionState } from "./actions";

const initial: ClaimActionState = { ok: false };

export function ClaimProfileForm({ slug }: { slug: string }) {
  const bound = submitRestaurantClaim.bind(null, slug);
  const [state, formAction, pending] = useActionState(bound, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok === true) {
      formRef.current?.reset();
    }
  }, [state]);

  if (state.ok === true) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-900">
        <p className="font-medium">Solicitud enviada. Revisaremos tu reclamo antes de asignar el perfil.</p>
        <Link href={`/restaurantes/${slug}`} className="mt-4 inline-block text-sm font-semibold underline">
          Volver al restaurante
        </Link>
      </div>
    );
  }

  const fe = state.ok === false ? state.fieldErrors : undefined;

  return (
    <form ref={formRef} action={formAction} className="relative space-y-5">
      {state.ok === false && state.message ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.message}</p>
      ) : null}

      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="companyWebsite">Empresa web</label>
        <input type="text" id="companyWebsite" name="companyWebsite" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-800">Nombre *</label>
        <input name="ownerName" required className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" />
        {fe?.ownerName ? <p className="mt-1 text-xs text-red-600">{fe.ownerName}</p> : null}
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-800">Teléfono *</label>
        <input name="ownerPhone" type="tel" required className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" />
        {fe?.ownerPhone ? <p className="mt-1 text-xs text-red-600">{fe.ownerPhone}</p> : null}
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-800">Correo *</label>
        <input name="ownerEmail" type="email" required className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" />
        {fe?.ownerEmail ? <p className="mt-1 text-xs text-red-600">{fe.ownerEmail}</p> : null}
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-800">Mensaje *</label>
        <textarea name="message" rows={4} required className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" />
        {fe?.message ? <p className="mt-1 text-xs text-red-600">{fe.message}</p> : null}
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-800">Evidencia (URL opcional)</label>
        <input name="evidenceUrl" type="url" className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm" placeholder="https://..." />
        {fe?.evidenceUrl ? <p className="mt-1 text-xs text-red-600">{fe.evidenceUrl}</p> : null}
      </div>
      <label className="flex items-start gap-2 text-sm text-zinc-800">
        <input type="checkbox" name="authorizationConfirmed" className="mt-1" />
        <span>Confirmo que represento este negocio o tengo autorización para reclamar este perfil. *</span>
      </label>
      {fe?.authorizationConfirmed ? (
        <p className="text-xs text-red-600">{fe.authorizationConfirmed}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}
