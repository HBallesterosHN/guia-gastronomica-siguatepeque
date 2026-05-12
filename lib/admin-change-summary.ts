import { parseImageAssetsJson, parseOwnerChangesJson } from "@/lib/change-request-types";
import { formatHondurasPhone } from "@/lib/formatters/phone";
import { isStructuredScheduleUsable } from "@/lib/formatters/schedule";

/** Resumen corto para la tabla de /admin/cambios. */
export function summarizeChangeRequestForAdminList(changes: unknown, imageUrls: unknown): string {
  const c = parseOwnerChangesJson(changes);
  const imgs = parseImageAssetsJson(imageUrls);
  const parts: string[] = [];
  if (c.phone) parts.push("Tel.");
  if (c.whatsapp) parts.push("WhatsApp");
  if (c.menuUrl) parts.push("Menú");
  if (c.instagramUrl) parts.push("Instagram");
  if (c.summary) parts.push("Descripción");
  if (c.scheduleLabel || isStructuredScheduleUsable(c.scheduleStructured)) parts.push("Horario");
  if (c.ownerMessage) parts.push("Nota dueño");
  if (imgs.length > 0) parts.push(`${imgs.length} foto(s)`);
  return parts.join(" · ") || (imgs.length ? `${imgs.length} foto(s)` : "—");
}

export function displayPhoneCell(raw: string | null | undefined): string {
  const t = raw?.trim();
  if (!t) return "—";
  return formatHondurasPhone(t);
}
