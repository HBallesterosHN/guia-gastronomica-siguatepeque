"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { slugifyTitle } from "@/lib/slugify-title";
import { createGuideAction } from "../guides-actions";

export function AdminGuideNewForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugifyTitle(title));
    }
  }, [title, slugTouched]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      subtitle: null,
      intro: null,
      description: null,
      status: "draft" as const,
      featured: false,
      coverImageUrl: null,
      seoTitle: null,
      seoDescription: null,
    };
    start(async () => {
      const res = await createGuideAction(payload);
      if (!res.ok) {
        setMsg({ type: "err", text: res.message });
        return;
      }
      router.push(`/admin/guias/${encodeURIComponent(res.slug)}/editar`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-6">
      <div>
        <Link href="/admin/guias" className="text-sm text-emerald-700 hover:underline">
          ← Volver al listado
        </Link>
        <h1 className="mt-4 text-xl font-semibold text-zinc-900">Nueva guía editorial</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Se creará en estado borrador. Luego podrás añadir texto, SEO y restaurantes en el editor.
        </p>
      </div>
      {msg ? (
        <div className={msg.type === "ok" ? "rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900" : "rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800"}>
          {msg.text}
        </div>
      ) : null}
      <label className="block text-sm">
        <span className="font-medium text-zinc-800">Título</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          placeholder="Ej. Mejores sopas en Siguatepeque"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-zinc-800">Slug (URL pública)</span>
        <input
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm"
          pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
        />
        <span className="mt-1 block text-xs text-zinc-500">
          Solo minúsculas, números y guiones. Cambiar el slug cambia la URL pública de la guía.
        </span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {pending ? "Creando…" : "Crear y abrir editor"}
      </button>
    </form>
  );
}
