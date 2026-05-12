"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ChangeRequestImageAsset } from "@/lib/change-request-types";
import { submitOwnerPhotosChangeRequest, type ChangeRequestActionState } from "../actions";

const initial: ChangeRequestActionState = { ok: false };

export function ManageRestaurantPhotosForm({ slug, restaurantName }: { slug: string; restaurantName: string }) {
  const bound = submitOwnerPhotosChangeRequest.bind(null, slug);
  const [state, formAction, pending] = useActionState(bound, initial);
  const [hero, setHero] = useState<ChangeRequestImageAsset | null>(null);
  const [gallery, setGallery] = useState<ChangeRequestImageAsset[]>([]);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  async function uploadToCloudinary(file: File, type: "hero" | "gallery"): Promise<void> {
    setUploadErr(null);
    setUploadBusy(true);
    try {
      const sigRes = await fetch("/api/cloudinary/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
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
      if (!up.ok) throw new Error("Falló la subida a Cloudinary.");
      const data = (await up.json()) as { secure_url: string; public_id: string };
      const asset: ChangeRequestImageAsset = {
        url: data.secure_url,
        publicId: data.public_id,
        type,
      };
      if (type === "hero") {
        setHero(asset);
      } else {
        setGallery((prev) => {
          if (prev.length >= 10) return prev;
          return [...prev, asset];
        });
      }
    } catch (e) {
      setUploadErr(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setUploadBusy(false);
    }
  }

  const payload: ChangeRequestImageAsset[] = [
    ...(hero ? [hero] : []),
    ...gallery,
  ];

  if (state.ok === true) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
        <p className="font-medium">
          Solicitud de fotos enviada para {restaurantName}. El equipo revisará antes de publicarlas.
        </p>
        <Link href="/dashboard" className="mt-3 inline-block text-sm font-semibold underline">
          Volver al panel
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="imageUrlsJson" value={JSON.stringify(payload)} readOnly />

      {state.ok === false && state.message ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{state.message}</p>
      ) : null}
      {uploadErr ? <p className="text-sm text-red-600">{uploadErr}</p> : null}

      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Hero propuesto</h2>
        <p className="mt-1 text-xs text-zinc-600">Una imagen principal. Reemplaza la anterior al aprobar.</p>
        <input
          type="file"
          accept="image/*"
          disabled={uploadBusy}
          className="mt-3 text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void uploadToCloudinary(f, "hero");
          }}
        />
        {hero ? (
          <div className="relative mt-3 h-40 w-full max-w-sm overflow-hidden rounded-lg border border-zinc-200">
            <Image src={hero.url} alt="Hero" fill className="object-cover" unoptimized />
            <button
              type="button"
              className="absolute right-2 top-2 rounded bg-zinc-900/80 px-2 py-1 text-xs text-white"
              onClick={() => setHero(null)}
            >
              Quitar
            </button>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Galería (hasta 10)</h2>
        <p className="mt-1 text-xs text-zinc-600">Se añaden a la galería existente al aprobar (sin duplicar URL).</p>
        <input
          type="file"
          accept="image/*"
          disabled={uploadBusy || gallery.length >= 10}
          className="mt-3 text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void uploadToCloudinary(f, "gallery");
          }}
        />
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {gallery.map((g) => (
            <div key={g.publicId} className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200">
              <Image src={g.url} alt="" fill className="object-cover" unoptimized />
              <button
                type="button"
                className="absolute right-1 top-1 rounded bg-zinc-900/80 px-1.5 py-0.5 text-[10px] text-white"
                onClick={() => setGallery((prev) => prev.filter((x) => x.publicId !== g.publicId))}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={pending || payload.length === 0}
        className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Enviando…" : "Enviar solicitud de fotos"}
      </button>
    </form>
  );
}
