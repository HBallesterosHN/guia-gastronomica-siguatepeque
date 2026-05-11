"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  submitRestaurantUpdateRequest,
  type RestaurantUpdateRequestActionState,
} from "./actions";

const initialState: RestaurantUpdateRequestActionState = { status: "idle" };

type RestaurantUpdateRequestFormProps = {
  slug: string;
  restaurantName: string;
};

export function RestaurantUpdateRequestForm({ slug, restaurantName }: RestaurantUpdateRequestFormProps) {
  const boundSubmit = submitRestaurantUpdateRequest.bind(null, slug);
  const [state, formAction, isPending] = useActionState(boundSubmit, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div
        className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center shadow-sm"
        role="status"
      >
        <p className="text-base font-medium text-emerald-900">
          Solicitud recibida. Revisaremos la información antes de publicarla.
        </p>
        <Link
          href={`/restaurantes/${slug}`}
          className="mt-5 inline-flex text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline"
        >
          Volver a la ficha de {restaurantName}
        </Link>
      </div>
    );
  }

  const fe = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form ref={formRef} action={formAction} className="relative space-y-6" noValidate>
      {state.status === "error" && state.message ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      {/* Honeypot: oculto para humanos; si se rellena, el servidor responde éxito sin guardar. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="companyWebsite">Sitio web de la empresa</label>
        <input
          type="text"
          id="companyWebsite"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="ownerName" className="block text-sm font-medium text-zinc-800">
            Nombre del solicitante <span className="text-red-600">*</span>
          </label>
          <input
            id="ownerName"
            name="ownerName"
            type="text"
            required
            autoComplete="name"
            className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            aria-invalid={fe?.ownerName ? true : undefined}
            aria-describedby={fe?.ownerName ? "ownerName-error" : undefined}
          />
          {fe?.ownerName ? (
            <p id="ownerName-error" className="mt-1 text-xs text-red-600">
              {fe.ownerName}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="ownerPhone" className="block text-sm font-medium text-zinc-800">
            Tu teléfono <span className="text-red-600">*</span>
          </label>
          <input
            id="ownerPhone"
            name="ownerPhone"
            type="tel"
            required
            autoComplete="tel"
            className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            aria-invalid={fe?.ownerPhone ? true : undefined}
            aria-describedby={fe?.ownerPhone ? "ownerPhone-error" : undefined}
          />
          {fe?.ownerPhone ? (
            <p id="ownerPhone-error" className="mt-1 text-xs text-red-600">
              {fe.ownerPhone}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="ownerEmail" className="block text-sm font-medium text-zinc-800">
            Correo electrónico (opcional)
          </label>
          <input
            id="ownerEmail"
            name="ownerEmail"
            type="email"
            autoComplete="email"
            className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            aria-invalid={fe?.ownerEmail ? true : undefined}
            aria-describedby={fe?.ownerEmail ? "ownerEmail-error" : undefined}
          />
          {fe?.ownerEmail ? (
            <p id="ownerEmail-error" className="mt-1 text-xs text-red-600">
              {fe.ownerEmail}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-zinc-800">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          placeholder="Describe qué quieres actualizar o corregir."
          aria-invalid={fe?.message ? true : undefined}
          aria-describedby={fe?.message ? "message-error" : undefined}
        />
        {fe?.message ? (
          <p id="message-error" className="mt-1 text-xs text-red-600">
            {fe.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="menuUrl" className="block text-sm font-medium text-zinc-800">
            Enlace al menú (opcional)
          </label>
          <input
            id="menuUrl"
            name="menuUrl"
            type="url"
            inputMode="url"
            placeholder="https://..."
            className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            aria-invalid={fe?.menuUrl ? true : undefined}
            aria-describedby={fe?.menuUrl ? "menuUrl-error" : undefined}
          />
          {fe?.menuUrl ? (
            <p id="menuUrl-error" className="mt-1 text-xs text-red-600">
              {fe.menuUrl}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="instagramUrl" className="block text-sm font-medium text-zinc-800">
            URL de Instagram (opcional)
          </label>
          <input
            id="instagramUrl"
            name="instagramUrl"
            type="url"
            inputMode="url"
            placeholder="https://www.instagram.com/..."
            className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            aria-invalid={fe?.instagramUrl ? true : undefined}
            aria-describedby={fe?.instagramUrl ? "instagramUrl-error" : undefined}
          />
          {fe?.instagramUrl ? (
            <p id="instagramUrl-error" className="mt-1 text-xs text-red-600">
              {fe.instagramUrl}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="businessPhone" className="block text-sm font-medium text-zinc-800">
            Teléfono del negocio (opcional)
          </label>
          <input
            id="businessPhone"
            name="businessPhone"
            type="tel"
            className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            aria-invalid={fe?.businessPhone ? true : undefined}
            aria-describedby={fe?.businessPhone ? "businessPhone-error" : undefined}
          />
          {fe?.businessPhone ? (
            <p id="businessPhone-error" className="mt-1 text-xs text-red-600">
              {fe.businessPhone}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="businessWhatsapp" className="block text-sm font-medium text-zinc-800">
            WhatsApp del negocio (opcional)
          </label>
          <input
            id="businessWhatsapp"
            name="businessWhatsapp"
            type="text"
            className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Número o enlace wa.me"
            aria-invalid={fe?.businessWhatsapp ? true : undefined}
            aria-describedby={fe?.businessWhatsapp ? "businessWhatsapp-error" : undefined}
          />
          {fe?.businessWhatsapp ? (
            <p id="businessWhatsapp-error" className="mt-1 text-xs text-red-600">
              {fe.businessWhatsapp}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="suggestedHours" className="block text-sm font-medium text-zinc-800">
            Horario sugerido (opcional)
          </label>
          <textarea
            id="suggestedHours"
            name="suggestedHours"
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Ej.: Lunes a sábado 7:00–21:00"
            aria-invalid={fe?.suggestedHours ? true : undefined}
            aria-describedby={fe?.suggestedHours ? "suggestedHours-error" : undefined}
          />
          {fe?.suggestedHours ? (
            <p id="suggestedHours-error" className="mt-1 text-xs text-red-600">
              {fe.suggestedHours}
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-800">
          <input
            type="checkbox"
            name="authorizationConfirmed"
            className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-400 text-emerald-600 focus:ring-emerald-500"
            aria-invalid={fe?.authorizationConfirmed ? true : undefined}
            aria-describedby={fe?.authorizationConfirmed ? "auth-error" : undefined}
          />
          <span>
            Confirmo que represento este negocio o tengo autorización para solicitar cambios.{" "}
            <span className="text-red-600">*</span>
          </span>
        </label>
        {fe?.authorizationConfirmed ? (
          <p id="auth-error" className="mt-2 text-xs text-red-600">
            {fe.authorizationConfirmed}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-60"
        >
          {isPending ? "Enviando…" : "Enviar solicitud"}
        </button>
        <Link
          href={`/restaurantes/${slug}`}
          className="text-sm font-semibold text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
