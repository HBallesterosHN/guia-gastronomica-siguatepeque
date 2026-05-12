import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseImageAssetsJson, parseOwnerChangesJson } from "@/lib/change-request-types";
import { displayPhoneCell } from "@/lib/admin-change-summary";
import { isStructuredScheduleUsable, type StructuredHourRow } from "@/lib/formatters/schedule";
import { approveChangeRequestAction, rejectChangeRequestAction } from "./actions";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}

function parseStructuredFromJson(raw: unknown): StructuredHourRow[] {
  if (!Array.isArray(raw)) return [];
  const rows: StructuredHourRow[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const r = item as Record<string, unknown>;
    const day = typeof r.day === "string" ? r.day.trim() : "";
    const open = typeof r.open === "string" ? r.open.trim() : "";
    const close = typeof r.close === "string" ? r.close.trim() : "";
    if (day && open && close) rows.push({ day, open, close });
  }
  return rows;
}

function ScheduleMiniTable({ rows }: { rows: StructuredHourRow[] }) {
  return (
    <div className="mt-1 space-y-1 text-xs">
      {rows.map((item) => (
        <div key={`${item.day}-${item.open}-${item.close}`} className="flex justify-between gap-2 text-zinc-700">
          <span className="font-medium">{item.day}</span>
          <span>
            {item.open} – {item.close}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function AdminCambioDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;

  const row = await prisma.restaurantChangeRequest.findUnique({
    where: { id },
    include: {
      restaurant: true,
      user: { select: { email: true, name: true } },
    },
  });
  if (!row) notFound();

  const pending = row.status === "pending";
  const requested = parseOwnerChangesJson(row.changes);
  const images = parseImageAssetsJson(row.imageUrls);
  const r = row.restaurant;
  const currentStructured = parseStructuredFromJson(r.scheduleStructured);
  const currentStructuredOk = isStructuredScheduleUsable(currentStructured);
  const reqStructured = requested.scheduleStructured;
  const reqStructuredOk = isStructuredScheduleUsable(reqStructured);

  return (
    <main className="space-y-6">
      <Link href="/admin/cambios" className="text-sm font-medium text-emerald-700 hover:underline">
        ← Cambios
      </Link>

      {sp.ok === "approved" ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Cambios aplicados al restaurante en la base de datos.
        </p>
      ) : null}
      {sp.ok === "rejected" ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">Solicitud rechazada.</p>
      ) : null}
      {sp.error === "already" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">Ya no está pendiente.</p>
      ) : null}

      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Revisar cambios · {r.name}{" "}
          <span className="text-base font-normal text-zinc-500">({r.slug})</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Estado: <strong className="capitalize">{row.status}</strong> · Dueño:{" "}
          {row.user.email ?? row.user.name ?? row.userId} ·{" "}
          {row.createdAt.toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" })}
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Actual (publicado)</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-xs font-medium text-zinc-500">Teléfono</dt>
              <dd className="text-zinc-900">{displayPhoneCell(r.phone)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500">WhatsApp</dt>
              <dd className="text-zinc-900">{displayPhoneCell(r.whatsapp)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500">Menú</dt>
              <dd className="break-all text-zinc-900">{r.menuUrl?.trim() || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500">Instagram</dt>
              <dd className="break-all text-zinc-900">{r.instagramUrl?.trim() || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500">Resumen</dt>
              <dd className="whitespace-pre-wrap text-zinc-900">{r.summary?.trim() || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500">Horario</dt>
              <dd className="text-zinc-900">
                {currentStructuredOk ? (
                  <>
                    <p className="text-xs text-zinc-500">Tabla estructurada</p>
                    <ScheduleMiniTable rows={currentStructured} />
                    {r.scheduleLabel?.trim() ? (
                      <p className="mt-2 whitespace-pre-wrap text-xs text-zinc-600">{r.scheduleLabel}</p>
                    ) : null}
                  </>
                ) : (
                  <p className="whitespace-pre-wrap">{r.scheduleLabel?.trim() || "—"}</p>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500">Hero URL</dt>
              <dd className="break-all text-xs text-zinc-700">{r.heroUrl?.trim() || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500">Galería (URLs)</dt>
              <dd className="max-h-32 overflow-auto break-all text-xs text-zinc-700">
                {Array.isArray(r.gallery) && r.gallery.length
                  ? (r.gallery as unknown[])
                      .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
                      .join("\n")
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Solicitado</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-xs font-medium text-emerald-800/80">Teléfono</dt>
              <dd className="text-zinc-900">
                {requested.phone !== undefined ? displayPhoneCell(requested.phone) : <span className="text-zinc-400">sin cambio</span>}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-emerald-800/80">WhatsApp</dt>
              <dd className="text-zinc-900">
                {requested.whatsapp !== undefined ? (
                  displayPhoneCell(requested.whatsapp)
                ) : (
                  <span className="text-zinc-400">sin cambio</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-emerald-800/80">Menú</dt>
              <dd className="break-all text-zinc-900">
                {requested.menuUrl !== undefined ? requested.menuUrl || "—" : <span className="text-zinc-400">sin cambio</span>}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-emerald-800/80">Instagram</dt>
              <dd className="break-all text-zinc-900">
                {requested.instagramUrl !== undefined ? (
                  requested.instagramUrl || "—"
                ) : (
                  <span className="text-zinc-400">sin cambio</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-emerald-800/80">Resumen</dt>
              <dd className="whitespace-pre-wrap text-zinc-900">
                {requested.summary !== undefined ? (
                  requested.summary || "—"
                ) : (
                  <span className="text-zinc-400">sin cambio</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-emerald-800/80">Horario</dt>
              <dd className="text-zinc-900">
                {requested.scheduleLabel !== undefined || reqStructuredOk ? (
                  <>
                    {requested.scheduleLabel !== undefined ? (
                      <p className="whitespace-pre-wrap">{requested.scheduleLabel || "—"}</p>
                    ) : null}
                    {reqStructuredOk && reqStructured ? (
                      <>
                        <p className="mt-2 text-xs font-medium text-emerald-800">Estructura detectada</p>
                        <ScheduleMiniTable rows={reqStructured} />
                      </>
                    ) : null}
                    {!requested.scheduleLabel && !reqStructuredOk ? <span>—</span> : null}
                  </>
                ) : (
                  <span className="text-zinc-400">sin cambio</span>
                )}
              </dd>
            </div>
            {requested.ownerMessage ? (
              <div>
                <dt className="text-xs font-medium text-emerald-800/80">Mensaje del dueño</dt>
                <dd className="whitespace-pre-wrap text-zinc-900">{requested.ownerMessage}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </section>

      {images.length > 0 ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Imágenes propuestas</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Al aprobar, la hero reemplaza la actual; las de galería se añaden sin duplicar URL.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => (
              <div key={`${img.publicId || img.url}-${img.type}`} className="space-y-2">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                  <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                </div>
                <p className="text-xs font-medium text-zinc-700">
                  <span className="rounded bg-zinc-200 px-1.5 py-0.5 uppercase">{img.type}</span>
                  {img.publicId ? (
                    <span className="ml-2 font-mono text-[10px] text-zinc-500">{img.publicId}</span>
                  ) : null}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {pending ? (
        <div className="flex flex-wrap gap-3">
          <form action={approveChangeRequestAction.bind(null, row.id)}>
            <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
              Aprobar y aplicar
            </button>
          </form>
          <form action={rejectChangeRequestAction.bind(null, row.id)}>
            <button type="submit" className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold">
              Rechazar
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
