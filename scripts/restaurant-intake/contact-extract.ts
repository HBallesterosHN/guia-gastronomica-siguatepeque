/**
 * Extracción conservadora de teléfonos / WhatsApp (Honduras +504) desde texto o HTML.
 */

const TEL_HREF = /href=["']tel:([^"'>\s]+)/gi;
const JSON_PHONE = /"(?:telephone|phone|formattedPhoneNumber)"\s*:\s*"([^"\\]+)"/gi;
const WA_ME = /https?:\/\/(?:www\.)?wa\.me\/(\d+)/gi;
const WA_API = /(?:api\.whatsapp\.com|wa\.whatsapp\.com)\/[^"'\s]*phone=(\d+)/gi;

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

/** Devuelve +504XXXXXXXX (8 dígitos locales) o undefined. */
export function normalizeHondurasPhone(raw: string): string | undefined {
  if (!raw?.trim()) return undefined;
  let d = digitsOnly(raw);
  if (d.startsWith("504") && d.length >= 11) {
    d = d.slice(0, 11);
  } else if (d.length === 8) {
    d = `504${d}`;
  } else if (d.length === 9 && d.startsWith("0")) {
    d = `504${d.slice(1)}`;
  } else if (d.length > 11 && d.startsWith("504")) {
    d = d.slice(0, 11);
  }
  if (!/^504\d{8}$/.test(d)) return undefined;
  const local = d.slice(3);
  return `+504 ${local.slice(0, 4)} ${local.slice(4)}`;
}

export function extractPhonesFromHtml(html: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (raw: string) => {
    const n = normalizeHondurasPhone(raw);
    if (n && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  };

  let m: RegExpExecArray | null;
  const telRe = new RegExp(TEL_HREF);
  while ((m = telRe.exec(html)) !== null) {
    push(decodeURIComponent(m[1].replace(/^tel:/i, "")));
  }
  const jsonRe = new RegExp(JSON_PHONE);
  while ((m = jsonRe.exec(html)) !== null) {
    push(m[1]);
  }
  return out;
}

/** Teléfonos +504 en texto libre (bio Instagram, etc.). */
export function extractPhonesFromPlainText(text: string): string[] {
  if (!text?.trim()) return [];
  const out: string[] = [];
  const seen = new Set<string>();

  /** Móviles HN frecuentes en bios sin prefijo (ej. 9299-6305). */
  const patterns: RegExp[] = [
    /\+?\s*504\s*[-\s.]?(\d{4})[-\s.]?(\d{4})/gi,
    /\b504\s*[-\s.]?(\d{4})[-\s.]?(\d{4})\b/gi,
    /\b(9\d{3})[-\s.](\d{4})\b/g,
  ];

  for (const re of patterns) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const raw = m[0];
      const n = normalizeHondurasPhone(raw);
      if (n && !seen.has(n)) {
        seen.add(n);
        out.push(n);
      }
    }
  }
  return out;
}

export function extractWhatsappFromText(text: string): string | undefined {
  if (!text) return undefined;
  let m: RegExpExecArray | null;
  const wa1 = new RegExp(WA_ME);
  while ((m = wa1.exec(text)) !== null) {
    const n = normalizeHondurasPhone(m[1]);
    if (n) return n;
  }
  const wa2 = new RegExp(WA_API);
  while ((m = wa2.exec(text)) !== null) {
    const n = normalizeHondurasPhone(m[1]);
    if (n) return n;
  }
  return undefined;
}

export function pickFirstPhone(candidates: (string | undefined)[]): string | undefined {
  for (const c of candidates) {
    const n = c ? normalizeHondurasPhone(c) : undefined;
    if (n) return n;
  }
  return undefined;
}

/** Resume texto de bio / descripción para copy.summary (una frase). */
export function summarizeForDraft(parts: (string | undefined)[], maxLen = 420): string {
  const t = parts
    .filter(Boolean)
    .map((p) => p!.replace(/\s+/g, " ").trim())
    .join(" · ")
    .trim();
  if (!t) return "";
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}
