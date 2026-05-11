"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { submitOwnerChangeRequest, type ChangeRequestActionState } from "./actions";

const initial: ChangeRequestActionState = { ok: false };

export function OwnerChangeRequestForm({ slug }: { slug: string }) {
  const bound = submitOwnerChangeRequest.bind(null, slug);
  const [state, formAction, pending] = useActionState(bound, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const [uploaded, setUploaded] = useState<string[]>([]);

  useEffect(() => {
    if (state.ok === true) {
      setUploaded([]);
      formRef.current?.reset();
    }
  }, [state]);

  if (state.ok === true) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
        <p className="font-medium">Solicitud creada. El equipo la revisará antes de publicar cambios.</p>
        <Link href="/dashboard" className="mt-3 inline-block text-sm font-semibold underline">
          Volver al panel
        </Link>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.ok === false && state.message ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.message}</p>
      ) : null}

      <input type="hidden" name="imageUrlsJson" value={JSON.stringify(uploaded)} readOnly />

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-sm font-medium text-zinc-800">Fotos (Cloudinary)</p>
        <p className="mt-1 text-xs text-zinc-600">
          Sube imágenes; quedarán pendientes hasta que un editor apruebe la solicitud.
        </p>
        <CloudinaryUploader slug={slug} onUploaded={(url) => setUploaded((prev) => [...prev, url])} />
        {uploaded.length > 0 ? (
          <ul className="mt-2 list-inside list-disc text-xs text-zinc-700">
            {uploaded.map((u) => (
              <li key={u} className="break-all">
                {u}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-800">Teléfono</label>
        <input name="phone" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800">WhatsApp</label>
        <input name="whatsapp" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800">Horario (texto)</label>
        <textarea name="scheduleLabel" rows={2} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800">URL menú</label>
        <input name="menuUrl" type="url" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800">URL Instagram</label>
        <input name="instagramUrl" type="url" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800">Descripción / resumen</label>
        <textarea name="summary" rows={4} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-800">URL hero (opcional)</label>
        <input name="heroUrl" type="url" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
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

function CloudinaryUploader({
  slug,
  onUploaded,
}: {
  slug: string;
  onUploaded: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr(null);
    setBusy(true);
    try {
      const sigRes = await fetch("/api/cloudinary/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, folder: `restaurantes/${slug}/owner` }),
      });
      if (!sigRes.ok) {
        const t = await sigRes.text();
        throw new Error(t || "No se pudo firmar la subida.");
      }
      const { signature, timestamp, apiKey, cloudName, folder } = (await sigRes.json()) as {
        signature: string;
        timestamp: number;
        apiKey: string;
        cloudName: string;
        folder: string;
      };

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", apiKey);
      body.append("timestamp", String(timestamp));
      body.append("signature", signature);
      body.append("folder", folder);

      const up = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body,
      });
      if (!up.ok) {
        throw new Error("Falló la subida a Cloudinary.");
      }
      const data = (await up.json()) as { secure_url: string };
      onUploaded(data.secure_url);
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <input type="file" accept="image/*" disabled={busy} onChange={(e) => void onFile(e)} className="text-sm" />
      {busy ? <p className="mt-2 text-xs text-zinc-600">Subiendo…</p> : null}
      {err ? <p className="mt-2 text-xs text-red-600">{err}</p> : null}
    </div>
  );
}
