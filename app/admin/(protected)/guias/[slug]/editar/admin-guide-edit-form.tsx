"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { generateGuideRestaurantCopy } from "@/lib/editorial/guide-copy";
import type { GuideCopyRestaurantInput } from "@/lib/editorial/guide-copy";
import { slugifyTitle } from "@/lib/slugify-title";
import { saveGuideFullAction } from "../../guides-actions";

export type AdminGuideEditInitial = {
  originalSlug: string;
  slug: string;
  title: string;
  subtitle: string;
  intro: string;
  description: string;
  status: "published" | "draft" | "hidden";
  featured: boolean;
  coverImageUrl: string;
  seoTitle: string;
  seoDescription: string;
  entries: (GuideCopyRestaurantInput & {
    restaurantId: string;
    rank: number;
    label: string;
    note: string;
  })[];
  restaurantOptions: (GuideCopyRestaurantInput & { id: string })[];
};

function normalizeRanks(entries: AdminGuideEditInitial["entries"]): AdminGuideEditInitial["entries"] {
  return entries.map((e, i) => ({ ...e, rank: i }));
}

function entryRestaurant(e: AdminGuideEditInitial["entries"][number]): GuideCopyRestaurantInput {
  return {
    name: e.name,
    slug: e.slug,
    category: e.category,
    summary: e.summary,
    ratingAverage: e.ratingAverage,
    reviewsCount: e.reviewsCount,
    scheduleLabel: e.scheduleLabel,
    address: e.address,
    menuUrl: e.menuUrl,
    instagramUrl: e.instagramUrl,
  };
}

export function AdminGuideEditForm({ initial }: { initial: AdminGuideEditInitial }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [slug, setSlug] = useState(initial.slug);
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [intro, setIntro] = useState(initial.intro);
  const [description, setDescription] = useState(initial.description);
  const [status, setStatus] = useState(initial.status);
  const [featured, setFeatured] = useState(initial.featured);
  const [coverImageUrl, setCoverImageUrl] = useState(initial.coverImageUrl);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription);
  const [entries, setEntries] = useState(() => normalizeRanks([...initial.entries]));
  const [addId, setAddId] = useState("");
  const [suggestionHint, setSuggestionHint] = useState<string | null>(null);

  useEffect(() => {
    if (!suggestionHint) return;
    const t = window.setTimeout(() => setSuggestionHint(null), 5200);
    return () => window.clearTimeout(t);
  }, [suggestionHint]);

  const availableToAdd = useMemo(() => {
    const used = new Set(entries.map((e) => e.restaurantId));
    return initial.restaurantOptions.filter((o) => !used.has(o.id));
  }, [entries, initial.restaurantOptions]);

  function addEntry() {
    if (!addId) return;
    const opt = initial.restaurantOptions.find((o) => o.id === addId);
    if (!opt) return;
    setEntries((prev) =>
      normalizeRanks([
        ...prev,
        {
          restaurantId: opt.id,
          slug: opt.slug,
          name: opt.name,
          rank: prev.length,
          label: "",
          note: "",
          category: opt.category,
          summary: opt.summary,
          ratingAverage: opt.ratingAverage,
          reviewsCount: opt.reviewsCount,
          scheduleLabel: opt.scheduleLabel,
          address: opt.address,
          menuUrl: opt.menuUrl,
          instagramUrl: opt.instagramUrl,
        },
      ]),
    );
    setAddId("");
  }

  function removeAt(i: number) {
    setEntries((prev) => normalizeRanks(prev.filter((_, j) => j !== i)));
  }

  function move(i: number, dir: -1 | 1) {
    setEntries((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const t = next[i]!;
      next[i] = next[j]!;
      next[j] = t;
      return normalizeRanks(next);
    });
  }

  function onSave() {
    if (slug !== initial.originalSlug) {
      const ok = window.confirm(
        `Vas a cambiar el slug público de «${initial.originalSlug}» a «${slug}». La URL /guias/... cambiará. ¿Continuar?`,
      );
      if (!ok) return;
    }
    const payload = {
      originalSlug: initial.originalSlug,
      slug: slug.trim(),
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      intro: intro.trim() || null,
      description: description.trim() || null,
      status,
      featured,
      coverImageUrl: coverImageUrl.trim() || null,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      entries: entries.map((e) => ({
        restaurantId: e.restaurantId,
        rank: e.rank,
        label: e.label.trim() || null,
        note: e.note.trim() || null,
      })),
    };
    start(async () => {
      setMsg(null);
      const res = await saveGuideFullAction(payload);
      if (!res.ok) {
        setMsg({ type: "err", text: res.message });
        return;
      }
      setMsg({ type: "ok", text: "Guardado. La web pública se actualizará al refrescar." });
      if (slug.trim() !== initial.originalSlug) {
        router.replace(`/admin/guias/${encodeURIComponent(slug.trim())}/editar`);
      } else {
        router.refresh();
      }
    });
  }

  function suggestAt(index: number) {
    const e = entries[index];
    if (!e) return;
    const hasLabel = e.label.trim().length > 0;
    const hasNote = e.note.trim().length > 0;
    if (hasLabel && hasNote) {
      setSuggestionHint("Ya hay texto en etiqueta y nota. Usa «Regenerar» si quieres sustituirlos.");
      return;
    }
    const { label, note } = generateGuideRestaurantCopy({
      guideTitle: title.trim(),
      guideSlug: slug.trim(),
      restaurant: entryRestaurant(e),
    });
    setEntries((prev) =>
      prev.map((x, j) =>
        j === index
          ? {
              ...x,
              label: hasLabel ? x.label : label,
              note: hasNote ? x.note : note,
            }
          : x,
      ),
    );
    setSuggestionHint("Texto sugerido: revisa antes de guardar.");
  }

  function regenerateAt(index: number) {
    if (!window.confirm("¿Sustituir etiqueta y nota por una nueva sugerencia?")) return;
    const e = entries[index];
    if (!e) return;
    const { label, note } = generateGuideRestaurantCopy({
      guideTitle: title.trim(),
      guideSlug: slug.trim(),
      restaurant: entryRestaurant(e),
    });
    setEntries((prev) => prev.map((x, j) => (j === index ? { ...x, label, note } : x)));
    setSuggestionHint("Texto regenerado: revisa antes de guardar.");
  }

  function suggestAllMissing() {
    let n = 0;
    const next = entries.map((e) => {
      const hasLabel = e.label.trim().length > 0;
      const hasNote = e.note.trim().length > 0;
      if (hasLabel && hasNote) return e;
      n += 1;
      const { label, note } = generateGuideRestaurantCopy({
        guideTitle: title.trim(),
        guideSlug: slug.trim(),
        restaurant: entryRestaurant(e),
      });
      return {
        ...e,
        label: hasLabel ? e.label : label,
        note: hasNote ? e.note : note,
      };
    });
    setEntries(normalizeRanks(next));
    setSuggestionHint(
      n > 0
        ? `Se rellenaron sugerencias en ${n} fila(s). Revisa antes de guardar.`
        : "Nada que completar: todas las filas ya tienen etiqueta y nota.",
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/guias" className="text-sm text-emerald-700 hover:underline">
          ← Guías
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900">Editar guía</h1>
        <p className="mt-1 text-sm text-amber-900">
          Guía editorial: los cambios se publican de inmediato en rutas públicas cuando el estado es
          «published».
        </p>
      </div>

      {msg ? (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            msg.type === "ok" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"
          }`}
        >
          {msg.text}
        </div>
      ) : null}

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Campos principales</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800">Título</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Slug</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm"
            />
            <button
              type="button"
              className="mt-1 text-xs text-emerald-700 hover:underline"
              onClick={() => setSlug(slugifyTitle(title))}
            >
              Regenerar desde título
            </button>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Estado</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="published">published</option>
              <option value="draft">draft</option>
              <option value="hidden">hidden</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Destacada en listados
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800">Subtítulo</span>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800">Intro (párrafo bajo el título)</span>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800">Descripción corta (tarjetas / SEO)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800">Cover URL (https o ruta /…)</span>
            <input
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">SEO title</span>
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800">SEO description</span>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Restaurantes de esta guía</h2>
        <p className="mt-1 text-xs text-zinc-500">Solo restaurantes publicados en Neon. El orden es el de la guía pública.</p>
        {entries.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={suggestAllMissing}
              className="rounded-lg border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
            >
              Sugerir textos faltantes
            </button>
            <span className="text-xs text-zinc-500">Solo rellena etiqueta o nota vacías; no pisa textos ya escritos.</span>
          </div>
        ) : null}
        {suggestionHint ? (
          <p className="mt-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-950">{suggestionHint}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Añadir</span>
            <select
              value={addId}
              onChange={(e) => setAddId(e.target.value)}
              className="mt-1 min-w-[220px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="">— Elegir —</option>
              {availableToAdd.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.slug})
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={addEntry}
            disabled={!addId}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
          >
            Añadir
          </button>
        </div>

        <ul className="mt-6 space-y-4">
          {entries.map((e, i) => (
            <li key={e.restaurantId} className="rounded-lg border border-zinc-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-zinc-900">{e.name}</p>
                  <p className="font-mono text-xs text-zinc-500">{e.slug}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    className="rounded border border-zinc-300 px-2 py-1 text-xs"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    className="rounded border border-zinc-300 px-2 py-1 text-xs"
                    disabled={i >= entries.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    Bajar
                  </button>
                  <button
                    type="button"
                    className="rounded border border-red-200 px-2 py-1 text-xs text-red-800"
                    onClick={() => removeAt(i)}
                  >
                    Quitar
                  </button>
                  <button
                    type="button"
                    className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900"
                    onClick={() => suggestAt(i)}
                  >
                    Sugerir texto
                  </button>
                  <button
                    type="button"
                    className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-950"
                    onClick={() => regenerateAt(i)}
                  >
                    Regenerar
                  </button>
                </div>
              </div>
              <label className="mt-3 block text-xs">
                <span className="font-medium text-zinc-700">Etiqueta (ej. plato destacado)</span>
                <input
                  value={e.label}
                  onChange={(ev) => {
                    const v = ev.target.value;
                    setEntries((prev) => prev.map((x, j) => (j === i ? { ...x, label: v } : x)));
                  }}
                  className="mt-1 w-full rounded border border-zinc-200 px-2 py-1 text-sm"
                />
              </label>
              <label className="mt-2 block text-xs">
                <span className="font-medium text-zinc-700">Nota editorial</span>
                <textarea
                  value={e.note}
                  onChange={(ev) => {
                    const v = ev.target.value;
                    setEntries((prev) => prev.map((x, j) => (j === i ? { ...x, note: v } : x)));
                  }}
                  rows={3}
                  className="mt-1 w-full rounded border border-zinc-200 px-2 py-1 text-sm"
                />
              </label>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar guía"}
        </button>
        {status === "published" ? (
          <Link
            href={`/guias/${encodeURIComponent(slug.trim())}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            Ver pública
          </Link>
        ) : null}
      </div>
    </div>
  );
}
