"use client";

import { useActionState, useMemo } from "react";
import { HoursDisplay } from "@/components/restaurants/hours-display";
import {
  generateIntakePreviewAction,
  type IntakeGenerateState,
  saveIntakeRestaurantFormAction,
  type IntakeSaveState,
} from "./actions";
import { RESTAURANT_CATEGORIES } from "@/types/restaurant";

const initialGenerate: IntakeGenerateState = { status: "idle" };
const initialSave: IntakeSaveState = { status: "idle" };

export function IntakeClient() {
  const [genState, genAction, genPending] = useActionState(generateIntakePreviewAction, initialGenerate);
  const [saveState, saveAction, savePending] = useActionState(saveIntakeRestaurantFormAction, initialSave);

  const draftJson = useMemo(() => {
    if (genState.status !== "preview") return "";
    try {
      return JSON.stringify(genState.draft);
    } catch {
      return "";
    }
  }, [genState]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Intake de restaurantes</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Genera un borrador con Google Places, Instagram opcional e imágenes en Cloudinary; revisa la vista previa y
          guarda en Neon.
        </p>
      </div>

      <form action={genAction} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Nombre (opcional)</span>
            <input
              name="name"
              type="text"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="Si se omite, se infiere de Maps / Instagram"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800">URL de Google Maps *</span>
            <input
              name="googleMapsUrl"
              type="url"
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="https://maps.app.goo.gl/… o enlace con place_id"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800">Instagram (opcional)</span>
            <input
              name="instagramUrl"
              type="url"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="https://www.instagram.com/…"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Categoría (opcional)</span>
            <select name="category" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm">
              <option value="">Inferir automáticamente</option>
              {RESTAURANT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800">URL del menú (opcional)</span>
            <input
              name="menuUrl"
              type="url"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="https://…"
            />
          </label>
        </div>
        {genState.status === "error" ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{genState.message}</p>
        ) : null}
        <button
          type="submit"
          disabled={genPending}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {genPending ? "Generando…" : "Generar restaurante"}
        </button>
      </form>

      {genState.status === "preview" ? (
        <div className="space-y-6">
          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Vista previa</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-zinc-500">Nombre</dt>
                <dd className="font-medium text-zinc-900">{genState.draft.name}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Slug</dt>
                <dd className="font-mono text-zinc-900">{genState.draft.slug}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Categoría</dt>
                <dd className="text-zinc-900">{genState.draft.category}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Teléfono</dt>
                <dd className="text-zinc-900">{genState.draft.phone}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-zinc-500">Dirección</dt>
                <dd className="text-zinc-900">{genState.draft.address}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-zinc-500">Horario</dt>
                <dd className="text-zinc-900">
                  <HoursDisplay
                    hours={{
                      scheduleLabel: genState.draft.hours,
                      structured: genState.draft.hoursStructured,
                    }}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Rating</dt>
                <dd className="text-zinc-900">
                  {genState.draft.ratings.average} ({genState.draft.ratings.reviewsCount} reseñas)
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-zinc-500">Resumen</dt>
                <dd className="text-zinc-900">{genState.draft.summary || "—"}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-zinc-800">Hero</h3>
              <div className="mt-2 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                {/* eslint-disable-next-line @next/next/no-img-element -- rutas locales y URLs Cloudinary en preview */}
                <img
                  src={genState.draft.hero}
                  alt=""
                  className={
                    genState.draft.hero.endsWith(".svg")
                      ? "max-h-48 w-full object-contain p-4"
                      : "max-h-64 w-full object-cover"
                  }
                />
              </div>
              <p className="mt-1 break-all text-xs text-zinc-500">{genState.draft.hero}</p>
            </div>

            {genState.draft.gallery.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-zinc-800">Galería</h3>
                <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {genState.draft.gallery.map((src) => (
                    <li key={src} className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="aspect-square w-full object-cover" />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-6 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
              <p className="font-medium">Pendientes / por confirmar</p>
              {genState.pending.length ? (
                <ul className="mt-1 list-inside list-disc">
                  {genState.pending.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-amber-900">Ninguno registrado en el reporte.</p>
              )}
            </div>

            {genState.placesErrors.length > 0 ? (
              <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">
                <p className="font-medium">Avisos Google Places</p>
                <ul className="mt-1 list-inside list-disc">
                  {genState.placesErrors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <form action={saveAction} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <input type="hidden" name="draftJson" value={draftJson} />
            <label className="flex items-center gap-2 text-sm text-zinc-800">
              <input type="checkbox" name="force" value="1" className="rounded border-zinc-400" />
              Sobrescribir si el slug ya existe en Neon
            </label>
            {saveState.status === "error" ? (
              <p
                className={`rounded-lg px-3 py-2 text-sm ${
                  saveState.slugConflict ? "bg-amber-50 text-amber-950" : "bg-red-50 text-red-800"
                }`}
              >
                {saveState.message}
              </p>
            ) : null}
            {saveState.status === "success" ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                {saveState.created ? "Creado" : "Actualizado"}: <span className="font-mono">{saveState.slug}</span>
              </p>
            ) : null}
            <button
              type="submit"
              disabled={savePending || !draftJson}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50"
            >
              {savePending ? "Guardando…" : "Guardar restaurante"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
