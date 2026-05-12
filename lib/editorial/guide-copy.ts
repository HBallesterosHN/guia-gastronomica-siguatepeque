/**
 * Texto editorial local para relaciones guía–restaurante (sin APIs externas).
 */

export type GuideCopyRestaurantInput = {
  name: string;
  slug: string;
  category: string;
  summary: string | null;
  ratingAverage: number;
  reviewsCount: number;
  scheduleLabel: string | null;
  address: string | null;
  menuUrl: string | null;
  instagramUrl: string | null;
};

const POR_CONFIRMAR = /por\s*confirmar/i;

/** Limpia notas: prefijos tipo "nota:", bullets sueltos, espacios y longitud razonable. */
export function cleanGuideEditorialNote(raw: string): string {
  let t = raw.replace(/^\s*nota\s*:\s*/i, "").trim();
  t = t.replace(/^[\s•\-\*]+/gm, "");
  t = t.replace(/\s{2,}/g, " ");
  t = t.replace(/\s+([.,;:])/g, "$1");
  const max = 420;
  if (t.length <= max) return t.trim();
  const cut = t.slice(0, max);
  const lastPeriod = cut.lastIndexOf(".");
  return (lastPeriod > 80 ? cut.slice(0, lastPeriod + 1) : `${cut.trim()}…`).trim();
}

function firstSentence(text: string, maxLen: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return "";
  const dot = t.indexOf(".");
  const chunk = dot >= 0 ? t.slice(0, dot + 1) : t;
  return chunk.length > maxLen ? `${chunk.slice(0, maxLen - 1).trim()}…` : chunk;
}

function categoryLabelShort(category: string): string {
  const map: Record<string, string> = {
    desayuno: "Desayuno tranquilo",
    cafe: "Café y repostería",
    "comida-tipica": "Comida típica hondureña",
    familiar: "Almuerzo familiar",
    romantico: "Mesa tranquila",
    parrilla: "Parrilla y carnes",
    mariscos: "Mariscos en la mesa",
  };
  return map[category] ?? "Propuesta gastronómica local";
}

function labelFromGuideContext(guideSlug: string, guideTitle: string, category: string): string {
  const s = `${guideSlug} ${guideTitle}`.toLowerCase();

  if (/(café|cafe|coffee|reposter)/i.test(s)) return clampWords("Café y repostería", 5);
  if (/(desayuno|mañana|amanecer)/i.test(s)) return clampWords("Desayuno tranquilo", 5);
  if (/(sopa|caldo|mondongo|marinera|gallina)/i.test(s)) return clampWords("Sopa tradicional", 5);
  if (/(parrill|asado|carne)/i.test(s)) return clampWords("Parrilla y carnes", 5);
  if (/(marisco|pescado|ceviche)/i.test(s)) return clampWords("Mariscos en la mesa", 5);
  if (/(típic|tipic|hondureñ|casero)/i.test(s)) return clampWords("Comida típica hondureña", 5);

  return clampWords(categoryLabelShort(category), 5);
}

function clampWords(phrase: string, maxWords: number): string {
  const w = phrase.trim().split(/\s+/).filter(Boolean);
  return w.slice(0, maxWords).join(" ");
}

function safeSummarySnippet(summary: string | null): string {
  if (!summary?.trim()) return "";
  const cleaned = cleanGuideEditorialNote(summary);
  if (POR_CONFIRMAR.test(cleaned)) return "";
  return firstSentence(cleaned, 160);
}

function safeAddressSnippet(address: string | null): string {
  if (!address?.trim() || POR_CONFIRMAR.test(address)) return "";
  return clampWords(address.replace(/\s+/g, " ").trim(), 12);
}

function guideAnglePhrase(guideSlug: string, guideTitle: string): { open: string; close: string } {
  const s = `${guideSlug} ${guideTitle}`.toLowerCase();
  if (/(café|cafe|coffee)/i.test(s)) {
    return {
      open: "funciona bien para una mañana tranquila de café o una tarde de plática sin prisa",
      close: "si buscas algo dulce, café y un ambiente relajado",
    };
  }
  if (/(desayuno)/i.test(s)) {
    return {
      open: "es una parada práctica para desayunar con calma antes de seguir el día",
      close: "si quieres salir temprano sin complicarte la mesa",
    };
  }
  if (/(sopa|caldo|mondongo|marinera|gallina)/i.test(s)) {
    return {
      open: "encaja cuando buscas un caldo con sabor casero y mesa sin rodeos",
      close: "si te apetece algo caliente y bien servido",
    };
  }
  if (/(parrill|asado)/i.test(s)) {
    return {
      open: "sirve cuando te apetece carne a la parrilla y ambiente relajado",
      close: "si vas con hambre de verdad",
    };
  }
  if (/(marisco|pescado)/i.test(s)) {
    return {
      open: "ayuda cuando quieres mar en el plato sin complicarte",
      close: "si prefieres caldos o pescado fresco",
    };
  }
  return {
    open: "cuadra para salir a comer en Siguatepeque con datos claros en la ficha",
    close: "si quieres resolver el plan sin dar tantas vueltas",
  };
}

export function generateGuideRestaurantCopy(input: {
  guideTitle: string;
  guideSlug: string;
  restaurant: GuideCopyRestaurantInput;
}): { label: string; note: string } {
  const { guideTitle, guideSlug, restaurant: r } = input;
  const label = labelFromGuideContext(guideSlug, guideTitle, r.category);

  const name = r.name.trim() || r.slug;
  const { open, close } = guideAnglePhrase(guideSlug, guideTitle);
  const sum = safeSummarySnippet(r.summary);
  const addr = safeAddressSnippet(r.address);
  const sched =
    r.scheduleLabel?.trim() && !POR_CONFIRMAR.test(r.scheduleLabel)
      ? firstSentence(r.scheduleLabel.replace(/\s+/g, " ").trim(), 90)
      : "";

  let note: string;
  if (sum) {
    note = `${name} ${open}. En la ficha resumimos: ${sum}`;
    if (sched && !sum.includes(sched.slice(0, 20))) {
      note = `${note} El horario publicado (${sched}) ayuda a coordinar antes de salir.`;
    }
  } else if (sched) {
    note = `${name} ${open}. El horario publicado en el sitio (${sched}) ayuda a coordinar antes de salir.`;
  } else if (addr) {
    note = `${name} ${open}. La dirección en la ficha (${addr}) ayuda a llegar sin adivinar calles.`;
  } else if (r.menuUrl?.trim()) {
    note = `${name} ${open}. Si quieres ver carta o precios, el enlace al menú en la ficha suele aclarar dudas rápidas.`;
  } else {
    note = `${name} ${open}. Es una opción cómoda si ${close}.`;
  }

  note = cleanGuideEditorialNote(note);
  const sentences = note.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length > 2) {
    note = cleanGuideEditorialNote(`${sentences[0]!} ${sentences[1]!}`);
  }

  return { label, note };
}
