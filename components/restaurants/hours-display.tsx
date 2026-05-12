import { isStructuredScheduleUsable, type StructuredHourRow } from "@/lib/formatters/schedule";

export type HoursDisplayStructuredRow = {
  day: string;
  open?: string;
  close?: string;
  /** Si es true, se muestra «Cerrado» en lugar del rango horario. */
  closed?: boolean;
};

export type HoursDisplayProps = {
  hours?: {
    scheduleLabel?: string;
    structured?: HoursDisplayStructuredRow[];
  };
  /** Texto cuando no hay `scheduleLabel` ni tabla usable (default: ficha pública). */
  emptyLabel?: string;
};

function isClosedText(s: string): boolean {
  return /^(cerrado|closed)$/i.test(s.trim());
}

function normalizeStructuredRows(structured: HoursDisplayStructuredRow[] | undefined): StructuredHourRow[] | undefined {
  if (!structured?.length) return undefined;
  const out: StructuredHourRow[] = [];
  for (const r of structured) {
    const day = r.day?.trim();
    if (!day) continue;
    if (r.closed) {
      out.push({ day, open: "Cerrado", close: "Cerrado" });
      continue;
    }
    const open = r.open?.trim() ?? "";
    const close = r.close?.trim() ?? "";
    if (open && close) {
      if (isClosedText(open) && isClosedText(close)) {
        out.push({ day, open: "Cerrado", close: "Cerrado" });
      } else {
        out.push({ day, open, close });
      }
    }
  }
  return out.length ? out : undefined;
}

function todayEsInTegucigalpa(): string {
  const currentDayEnglish = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "America/Tegucigalpa",
  }).format(new Date());
  const dayMap: Record<string, string> = {
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
    Sunday: "Domingo",
  };
  return dayMap[currentDayEnglish] ?? "";
}

function formatHoursCell(item: StructuredHourRow): string {
  if (isClosedText(item.open) && isClosedText(item.close)) return "Cerrado";
  return `${item.open} - ${item.close}`;
}

/**
 * Horario como en la ficha pública: tabla por día si hay `structured` usable; si no, texto `scheduleLabel`.
 */
export function HoursDisplay({ hours, emptyLabel = "Horario por confirmar." }: HoursDisplayProps) {
  const scheduleLabel = hours?.scheduleLabel?.trim() ?? "";
  const normalized = normalizeStructuredRows(hours?.structured);
  const useTable = isStructuredScheduleUsable(normalized);
  const todayEs = todayEsInTegucigalpa();

  if (useTable && normalized) {
    return (
      <div className="mt-2 space-y-2">
        {normalized.map((item) => {
          const isToday = item.day === todayEs;
          return (
            <div
              key={`${item.day}-${item.open}-${item.close}`}
              className={`flex items-center justify-between gap-3 rounded-lg px-2 py-1 ${
                isToday ? "bg-emerald-50 text-emerald-800" : "text-zinc-900"
              }`}
            >
              <span className="font-medium">{item.day}</span>
              <span className="text-right">{formatHoursCell(item)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mt-2">
      <p className="whitespace-pre-line leading-6 text-zinc-900">{scheduleLabel || emptyLabel}</p>
    </div>
  );
}
