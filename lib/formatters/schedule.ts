/**
 * Horario manual → etiqueta legible y/o estructura por día para la UI.
 */

export type StructuredHourRow = {
  day: string;
  open: string;
  close: string;
};

/** Espacios tipográficos (p. ej. U+202F de Google Places) que suelen verse raros en la UI. */
export function sanitizeScheduleDisplayToken(s: string): string {
  return s.replace(/[\u202f\u00a0]/g, " ").trim();
}

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

export function isStructuredScheduleUsable(rows: StructuredHourRow[] | undefined): boolean {
  return Array.isArray(rows) && rows.length >= 2;
}

const EN_WEEKDAY_TO_ES: Record<string, string> = {
  monday: "Lunes",
  mon: "Lunes",
  tuesday: "Martes",
  tue: "Martes",
  wednesday: "Miércoles",
  wed: "Miércoles",
  thursday: "Jueves",
  thu: "Jueves",
  friday: "Viernes",
  fri: "Viernes",
  saturday: "Sábado",
  sat: "Sábado",
  sunday: "Domingo",
  sun: "Domingo",
};

/**
 * Convierte token de día (inglés o español) a etiqueta canónica española (Lunes…).
 */
export function mapWeekdayTokenToSpanishDay(raw: string): string | null {
  const key = sanitizeScheduleDisplayToken(raw)
    .toLowerCase()
    .replace(/[.:]/g, "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (EN_WEEKDAY_TO_ES[key]) return EN_WEEKDAY_TO_ES[key];
  return normalizeDayLabel(raw);
}

/**
 * Interpreta una sola línea tipo:
 * `Monday: 8:30 AM – 6:30 PM · Tuesday: 8:30 AM – 6:30 PM · …`
 * (también `-` en lugar de `–`, espacios estrechos, etc.)
 */
export function inferStructuredHoursFromScheduleLabel(raw: string): StructuredHourRow[] | undefined {
  const normalized = sanitizeScheduleDisplayToken(raw).replace(/\s+/g, " ").trim();
  if (!normalized) return undefined;

  const segments = normalized.split(/\s*[·•|]\s*/).map((s) => s.trim()).filter(Boolean);
  const rows: StructuredHourRow[] = [];
  const timePair =
    /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[–\-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i;

  for (const seg of segments) {
    const m = seg.match(/^([A-Za-zÁÉÍÓÚÑáéíóúñ]+)\s*:\s*(.+)$/i);
    if (!m) continue;
    const dayEs = mapWeekdayTokenToSpanishDay(m[1]);
    if (!dayEs) continue;
    const rest = sanitizeScheduleDisplayToken(m[2]);
    const tm = rest.match(timePair);
    if (!tm) continue;
    rows.push({
      day: dayEs,
      open: sanitizeScheduleDisplayToken(tm[1]),
      close: sanitizeScheduleDisplayToken(tm[2]),
    });
  }

  if (!isStructuredScheduleUsable(rows)) return undefined;
  return sortStructured(rows);
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

  const inferred = inferStructuredHoursFromScheduleLabel(trimmed);
  if (isStructuredScheduleUsable(inferred)) {
    return {
      scheduleLabel: trimmed,
      structured: inferred,
    };
  }

  return { scheduleLabel: trimmed };
}
