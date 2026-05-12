"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { saveRestaurantGuideLinksAction } from "../../../guias/guides-actions";

export type RestaurantGuideRow = {
  guideId: string;
  slug: string;
  title: string;
  status: string;
  selected: boolean;
  label: string;
  note: string;
};

export function AdminRestaurantGuidesSection({
  restaurantId,
  rows,
}: {
  restaurantId: string;
  rows: RestaurantGuideRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [state, setState] = useState(rows);

  const dirty = useMemo(() => JSON.stringify(state) !== JSON.stringify(rows), [state, rows]);

  function toggle(i: number, checked: boolean) {
    setState((prev) => prev.map((r, j) => (j === i ? { ...r, selected: checked } : r)));
  }

  function setField(i: number, field: "label" | "note", value: string) {
    setState((prev) => prev.map((r, j) => (j === i ? { ...r, [field]: value } : r)));
  }

  function onSave() {
    start(async () => {
      setMsg(null);
      const res = await saveRestaurantGuideLinksAction({
        restaurantId,
        links: state.map((r) => ({
          guideId: r.guideId,
          selected: r.selected,
          label: r.label.trim() || null,
          note: r.note.trim() || null,
        })),
      });
      if (!res.ok) {
        setMsg({ type: "err", text: res.message });
        return;
      }
      setMsg({ type: "ok", text: "Guías actualizadas." });
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Guías editoriales</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Marca en qué guías aparece este restaurante. Para crear guías o el orden global, usa{" "}
        <span className="font-medium text-zinc-700">Admin → Guías</span>.
      </p>
      {msg ? (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-sm ${
            msg.type === "ok" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"
          }`}
        >
          {msg.text}
        </div>
      ) : null}
      <ul className="mt-4 divide-y divide-zinc-100 rounded-lg border border-zinc-100">
        {state.map((r, i) => (
          <li key={r.guideId} className="space-y-2 p-3">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={r.selected}
                onChange={(e) => toggle(i, e.target.checked)}
              />
              <span>
                <span className="font-medium text-zinc-900">{r.title}</span>
                <span className="ml-2 font-mono text-xs text-zinc-500">{r.slug}</span>
                <span className="ml-2 rounded bg-zinc-100 px-1.5 text-[10px] uppercase text-zinc-600">
                  {r.status}
                </span>
              </span>
            </label>
            {r.selected ? (
              <div className="ml-7 grid gap-2 sm:grid-cols-2">
                <label className="block text-xs">
                  <span className="text-zinc-600">Etiqueta en la guía (opcional)</span>
                  <input
                    value={r.label}
                    onChange={(e) => setField(i, "label", e.target.value)}
                    className="mt-1 w-full rounded border border-zinc-200 px-2 py-1 text-sm"
                    placeholder="Ej. Mejor sopa de gallina india"
                  />
                </label>
                <label className="block text-xs sm:col-span-2">
                  <span className="text-zinc-600">Nota breve (opcional)</span>
                  <textarea
                    value={r.note}
                    onChange={(e) => setField(i, "note", e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded border border-zinc-200 px-2 py-1 text-sm"
                  />
                </label>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={pending || !dirty}
        onClick={onSave}
        className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-40"
      >
        {pending ? "Guardando…" : "Guardar guías del restaurante"}
      </button>
    </section>
  );
}
