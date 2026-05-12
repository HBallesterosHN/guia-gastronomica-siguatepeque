"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { HoursDisplay } from "@/components/restaurants/hours-display";
import type {
  AdminRestaurantEditorInitial,
  AdminScheduleRowState,
} from "@/lib/admin-restaurant-editor-initial";
import { isStructuredScheduleUsable, type StructuredHourRow } from "@/lib/formatters/schedule";
import { RESTAURANT_CATEGORIES } from "@/types/restaurant";
import { saveAdminRestaurantAction } from "./actions";

function rowsToStructured(rows: AdminScheduleRowState[]): StructuredHourRow[] {
  return rows.map((r) =>
    r.closed
      ? { day: r.day, open: "Cerrado", close: "Cerrado" }
      : { day: r.day, open: (r.open || "9:00").trim(), close: (r.close || "18:00").trim() },
  );
}

async function uploadToCloudinary(slug: string, file: File): Promise<string> {
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
  const data = (await up.json()) as { secure_url: string };
  return data.secure_url;
}

export function AdminRestaurantEditForm({ initial }: { initial: AdminRestaurantEditorInitial }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [slug, setSlug] = useState(initial.slug);
  const [name, setName] = useState(initial.name);
  const [category, setCategory] = useState(initial.category);
  const [priceRange, setPriceRange] = useState(initial.priceRange);
  const [summary, setSummary] = useState(initial.summary);
  const [status, setStatus] = useState(initial.status);
  const [verified, setVerified] = useState(initial.verified);
  const [source, setSource] = useState(initial.source);
  const [address, setAddress] = useState(initial.address);
  const [lat, setLat] = useState(initial.lat);
  const [lng, setLng] = useState(initial.lng);
  const [googleMapsUrl, setGoogleMapsUrl] = useState(initial.googleMapsUrl);
  const [phone, setPhone] = useState(initial.phone);
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl);
  const [menuUrl, setMenuUrl] = useState(initial.menuUrl);
  const [scheduleLabel, setScheduleLabel] = useState(initial.scheduleLabel);
  const [scheduleRows, setScheduleRows] = useState<AdminScheduleRowState[]>(initial.scheduleRows);
  const [offersDelivery, setOffersDelivery] = useState(initial.offersDelivery);
  const [acceptsReservations, setAcceptsReservations] = useState(initial.acceptsReservations);
  const [ratingAverage, setRatingAverage] = useState(String(initial.ratingAverage));
  const [reviewsCount, setReviewsCount] = useState(String(initial.reviewsCount));
  const [heroUrl, setHeroUrl] = useState(initial.heroUrl);
  const [gallery, setGallery] = useState<string[]>(initial.gallery);
  const [galleryUrlDraft, setGalleryUrlDraft] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);

  const structuredPreview = rowsToStructured(scheduleRows);
  const hoursPreview = {
    scheduleLabel,
    structured: isStructuredScheduleUsable(structuredPreview) ? structuredPreview : undefined,
  };

  function updateRow(i: number, patch: Partial<AdminScheduleRowState>) {
    setScheduleRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  function moveGallery(from: number, to: number) {
    setGallery((prev) => {
      const next = [...prev];
      const [x] = next.splice(from, 1);
      next.splice(to, 0, x);
      return next;
    });
  }

  function removeGallery(i: number) {
    setGallery((prev) => prev.filter((_, j) => j !== i));
  }

  async function onHeroFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadBusy(true);
    setMessage(null);
    try {
      const url = await uploadToCloudinary(slug.trim() || initial.originalSlug, f);
      setHeroUrl(url);
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Error al subir hero" });
    } finally {
      setUploadBusy(false);
      e.target.value = "";
    }
  }

  async function onGalleryFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadBusy(true);
    setMessage(null);
    try {
      for (const f of Array.from(files)) {
        if (gallery.length >= 10) break;
        const url = await uploadToCloudinary(slug.trim() || initial.originalSlug, f);
        setGallery((g) => (g.length >= 10 ? g : [...g, url]));
      }
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Error al subir galería" });
    } finally {
      setUploadBusy(false);
      e.target.value = "";
    }
  }

  function onSave() {
    if (slug !== initial.originalSlug) {
      const ok = window.confirm(
        `Vas a cambiar el slug de «${initial.originalSlug}» a «${slug}». Las URLs públicas y reclamos por slug se actualizarán. ¿Continuar?`,
      );
      if (!ok) return;
    }
    const latN = lat.trim() === "" ? null : Number(lat);
    const lngN = lng.trim() === "" ? null : Number(lng);
    if (lat.trim() && !Number.isFinite(latN)) {
      setMessage({ type: "err", text: "Latitud no numérica." });
      return;
    }
    if (lng.trim() && !Number.isFinite(lngN)) {
      setMessage({ type: "err", text: "Longitud no numérica." });
      return;
    }
    const ra = Number(ratingAverage);
    const rc = Number(reviewsCount);
    if (!Number.isFinite(ra) || ra < 0 || ra > 5) {
      setMessage({ type: "err", text: "Rating inválido (0–5)." });
      return;
    }
    if (!Number.isFinite(rc) || rc < 0 || !Number.isInteger(rc)) {
      setMessage({ type: "err", text: "Número de reseñas inválido." });
      return;
    }

    const structured = rowsToStructured(scheduleRows);
    const payload = {
      originalSlug: initial.originalSlug,
      slug: slug.trim(),
      name: name.trim(),
      category,
      priceRange,
      summary: summary.trim() || null,
      status,
      verified,
      source,
      address: address.trim() || null,
      lat: latN,
      lng: lngN,
      googleMapsUrl: googleMapsUrl.trim() || null,
      phone: phone.trim() || null,
      whatsapp: whatsapp.trim() || null,
      instagramUrl: instagramUrl.trim() || null,
      menuUrl: menuUrl.trim() || null,
      scheduleLabel: scheduleLabel.trim() || null,
      structured: isStructuredScheduleUsable(structured) ? structured : undefined,
      offersDelivery,
      acceptsReservations,
      ratingAverage: ra,
      reviewsCount: rc,
      heroUrl: heroUrl.trim(),
      gallery,
    };

    startTransition(async () => {
      setMessage(null);
      const res = await saveAdminRestaurantAction(payload);
      if (!res.ok) {
        setMessage({ type: "err", text: res.message });
        return;
      }
      setMessage({ type: "ok", text: "Guardado. La ficha pública ya refleja los cambios." });
      if (slug.trim() !== initial.originalSlug) {
        router.replace(`/admin/restaurantes/${encodeURIComponent(slug.trim())}/editar`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">
      {message ? (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Datos principales</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Nombre</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Slug</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Categoría</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              {RESTAURANT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Rango de precio</span>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="$">$</option>
              <option value="$$">$$</option>
              <option value="$$$">$$$</option>
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800">Resumen</span>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Estado</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="published">published</option>
              <option value="draft">draft</option>
              <option value="hidden">hidden</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-800">
            <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
            Verificado
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Origen (source)</span>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as typeof source)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="auto">auto</option>
              <option value="manual">manual</option>
              <option value="owner_submitted">owner_submitted</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Ubicación</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800">Dirección</span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Latitud</span>
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Longitud</span>
            <input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800">Google Maps URL</span>
            <input
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Contacto</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Se guardan en formato +504. Los enlaces tel: y WhatsApp siguen funcionando en la ficha.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Teléfono</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="+504 9755-3669"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">WhatsApp</span>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800">Instagram URL</span>
            <input
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800">Menú URL</span>
            <input
              value={menuUrl}
              onChange={(e) => setMenuUrl(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Horario</h2>
        <label className="mt-4 block text-sm">
          <span className="font-medium text-zinc-800">Etiqueta rápida (texto libre)</span>
          <textarea
            value={scheduleLabel}
            onChange={(e) => setScheduleLabel(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Opcional si usas la tabla por días"
          />
        </label>
        <div className="mt-6">
          <p className="text-sm font-medium text-zinc-800">Por día</p>
          <div className="mt-2 space-y-2">
            {scheduleRows.map((row, i) => (
              <div
                key={row.day}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm"
              >
                <span className="w-24 font-medium text-zinc-900">{row.day}</span>
                <label className="flex items-center gap-1.5 text-zinc-700">
                  <input
                    type="checkbox"
                    checked={row.closed}
                    onChange={(e) => updateRow(i, { closed: e.target.checked })}
                  />
                  Cerrado
                </label>
                {!row.closed ? (
                  <>
                    <input
                      value={row.open}
                      onChange={(e) => updateRow(i, { open: e.target.value })}
                      className="w-28 rounded border border-zinc-300 px-2 py-1"
                      placeholder="Apertura"
                    />
                    <span className="text-zinc-500">—</span>
                    <input
                      value={row.close}
                      onChange={(e) => updateRow(i, { close: e.target.value })}
                      className="w-28 rounded border border-zinc-300 px-2 py-1"
                      placeholder="Cierre"
                    />
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Vista previa</p>
          <HoursDisplay hours={hoursPreview} />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Servicios</h2>
        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={offersDelivery} onChange={(e) => setOffersDelivery(e.target.checked)} />
            Delivery
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={acceptsReservations}
              onChange={(e) => setAcceptsReservations(e.target.checked)}
            />
            Acepta reservas
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Ratings (Google u otras fuentes)</h2>
        <p className="mt-1 text-xs text-zinc-500">Normalmente vienen de Google Places; puedes ajustarlos manualmente.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Promedio (0–5)</span>
            <input
              value={ratingAverage}
              onChange={(e) => setRatingAverage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Número de reseñas</span>
            <input
              value={reviewsCount}
              onChange={(e) => setReviewsCount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Media</h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-zinc-800">Hero</p>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroUrl} alt="" className="h-28 max-w-xs rounded-lg border border-zinc-200 object-cover" />
              <label className="text-sm">
                <span className="text-zinc-600">URL manual</span>
                <input
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  className="mt-1 block w-full min-w-[240px] rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs"
                />
              </label>
              <label className="cursor-pointer rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800">
                Subir imagen
                <input type="file" accept="image/*" className="hidden" onChange={onHeroFile} disabled={uploadBusy} />
              </label>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-800">Galería (máx. 10)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {gallery.map((url, i) => (
                <div key={`${url}-${i}`} className="relative w-24">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="aspect-square w-full rounded border object-cover" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    <button
                      type="button"
                      className="rounded bg-zinc-200 px-1 text-xs"
                      disabled={i === 0}
                      onClick={() => moveGallery(i, i - 1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="rounded bg-zinc-200 px-1 text-xs"
                      disabled={i >= gallery.length - 1}
                      onClick={() => moveGallery(i, i + 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="rounded bg-red-100 px-1 text-xs text-red-800"
                      onClick={() => removeGallery(i)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {gallery.length < 10 ? (
              <label className="mt-3 inline-block cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50">
                Añadir imágenes
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onGalleryFile}
                  disabled={uploadBusy}
                />
              </label>
            ) : null}
            {gallery.length < 10 ? (
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <label className="block text-sm">
                  <span className="text-zinc-600">URL de imagen (https)</span>
                  <input
                    value={galleryUrlDraft}
                    onChange={(e) => setGalleryUrlDraft(e.target.value)}
                    className="mt-1 block w-72 rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs"
                    placeholder="https://…"
                  />
                </label>
                <button
                  type="button"
                  className="rounded-lg bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300"
                  onClick={() => {
                    const t = galleryUrlDraft.trim();
                    if (!t.startsWith("https://")) return;
                    try {
                      void new URL(t);
                    } catch {
                      return;
                    }
                    setGallery((g) => (g.length >= 10 ? g : [...g, t]));
                    setGalleryUrlDraft("");
                  }}
                >
                  Añadir URL
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={onSave}
        disabled={pending || uploadBusy}
        className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
  );
}
