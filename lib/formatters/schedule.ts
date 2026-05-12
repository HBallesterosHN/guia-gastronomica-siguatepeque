/**
 * Horario manual → etiqueta legible y/o estructura por día para la UI.
 */

export type StructuredHourRow = {
  day: string;
  open: string;
  close: string;
};

const DAY_ORDER = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

function normalizeDayLabel(raw: string): string | null {
  const s = raw.trim().toLowerCase().replace(/[.:]/g, "");
  const map: Record<string, string> = {
    lun: "Lunes",
    lunes: "Lunes",
    mar: "Martes",
    martes: "Martes",
    mie: "Miércoles",
    miercoles: "Miércoles",
    miércoles: "Miércoles",
    jue: "Jueves",
    jueves: "Jueves",
    vie: "Viernes",
    viernes: "Viernes",
    sab: "Sábado",
    sábado: "Sábado",
    sabado: "Sábado",
    dom: "Domingo",
    domingo: "Domingo",
  };
  return map[s] ?? null;
}

function sortStructured(rows: StructuredHourRow[]): StructuredHourRow[] {
  const idx = (d: string) => {
    const i = DAY_ORDER.indexOf(d as (typeof DAY_ORDER)[number]);
    return i === -1 ? 99 : i;
  };
  return [...rows].sort((a, b) => idx(a.day) - idx(b.day));
}

/**
 * Interpreta texto libre del dueño/editor.
 * Si detecta al menos 2 líneas con día + horas, devuelve `structured` ordenado.
 * Si no, solo `scheduleLabel` para mostrar en bloque de texto (sin mezclar con tabla vacía).
 */
export function parseScheduleManualInput(text: string): {
  scheduleLabel: string;
  structured?: StructuredHourRow[];
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return { scheduleLabel: "" };
  }

  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const structured: StructuredHourRow[] = [];
  const re =
    /^(.+?)\s*[:\-]?\s*(\d{1,2}:\d{2})\s*(?:[-–a]|hasta|al)\s*(\d{1,2}:\d{2})/i;

  for (const line of lines) {
    const m = line.match(re);
    if (!m) continue;
    const day = normalizeDayLabel(m[1]);
    if (!day) continue;
    structured.push({ day, open: m[2], close: m[3] });
  }

  if (structured.length >= 2) {
    return {
      scheduleLabel: trimmed,
      structured: sortStructured(structured),
    };
  }

  return { scheduleLabel: trimmed };
}

export function isStructuredScheduleUsable(rows: StructuredHourRow[] | undefined): boolean {
  return Array.isArray(rows) && rows.length >= 2;
}
