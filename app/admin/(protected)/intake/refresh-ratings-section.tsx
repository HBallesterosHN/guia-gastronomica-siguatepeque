"use client";

import { useActionState } from "react";
import type { RatingRefreshSummary } from "@/lib/admin/rating-refresh-types";
import {
  refreshAllRestaurantRatingsAction,
  type RefreshAllRatingsState,
} from "./ratings-actions";

const initial: RefreshAllRatingsState = { status: "idle" };

function statusLabel(status: string): string {
  if (status === "updated") return "Actualizado";
  if (status === "skipped") return "Sin cambios";
  return "Error";
}

function RatingsRefreshDoneBlock({
  summary,
  publishedOnly,
}: {
  summary: RatingRefreshSummary;
  publishedOnly: boolean;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-950">
      <p className="font-semibold">Resumen</p>
      <ul className="grid gap-1 sm:grid-cols-2">
        <li>Ámbito: {publishedOnly ? "solo publicados" : "todos en Neon"}</li>
        <li>Procesados: {summary.total}</li>
        <li>Actualizados: {summary.updated}</li>
        <li>Sin cambios / omitidos: {summary.skipped}</li>
        <li>Errores: {summary.errors}</li>
      </ul>
      {summary.rows.length > 0 ? <RatingsRefreshResultTable summary={summary} /> : null}
    </div>
  );
}

function RatingsRefreshResultTable({ summary }: { summary: RatingRefreshSummary }) {
  return (
    <div className="max-h-72 overflow-auto rounded border border-emerald-200/80 bg-white">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-zinc-50 text-zinc-600">
          <tr>
            <th className="px-2 py-2 font-medium">Restaurante</th>
            <th className="px-2 py-2 font-medium">Rating</th>
            <th className="px-2 py-2 font-medium">Reseñas</th>
            <th className="px-2 py-2 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {summary.rows.map((row) => (
            <tr key={row.slug} className="border-t border-zinc-100">
              <td className="px-2 py-2">
                <span className="font-medium text-zinc-900">{row.name}</span>
                <span className="block font-mono text-[10px] text-zinc-500">{row.slug}</span>
              </td>
              <td className="px-2 py-2 text-zinc-700">
                {row.previousRating.toFixed(1)}
                {row.newRating != null ? ` → ${row.newRating.toFixed(1)}` : ""}
              </td>
              <td className="px-2 py-2 text-zinc-700">
                {row.previousReviews}
                {row.newReviews != null ? ` → ${row.newReviews}` : ""}
              </td>
              <td className="px-2 py-2">
                <span
                  className={
                    row.status === "updated"
                      ? "text-emerald-800"
                      : row.status === "error"
                        ? "text-red-700"
                        : "text-zinc-600"
                  }
                >
                  {statusLabel(row.status)}
                </span>
                {row.reason ? (
                  <span className="mt-0.5 block text-[10px] text-zinc-500">{row.reason}</span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RefreshRatingsSection() {
  const [state, action, pending] = useActionState(refreshAllRestaurantRatingsAction, initial);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Actualizar ratings</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Actualiza únicamente la puntuación promedio y cantidad de reseñas desde Google Places. No
        modifica fotos, horarios, teléfono ni contenido editorial.
      </p>

      <form action={action} className="mt-4 space-y-3">
        <label className="flex items-center gap-2 text-sm text-zinc-800">
          <input
            type="checkbox"
            name="publishedOnly"
            value="1"
            className="rounded border-zinc-400"
            disabled={pending}
          />
          Actualizar solo restaurantes publicados
        </label>

        {state.status === "error" ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{state.message}</p>
        ) : null}

        {state.status === "done" ? (
          <RatingsRefreshDoneBlock summary={state.summary} publishedOnly={state.publishedOnly} />
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {pending ? "Actualizando ratings…" : "Actualizar ratings de todos"}
        </button>
        {pending ? (
          <p className="text-xs text-zinc-500">
            Procesando en secuencia (puede tardar varios minutos). No cierres esta pestaña.
          </p>
        ) : null}
      </form>
    </section>
  );
}
