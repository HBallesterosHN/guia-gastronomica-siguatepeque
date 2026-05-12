/**
 * Normalización y presentación de teléfonos en Honduras (+504).
 */

const PLACEHOLDER = /^(por\s*confirmar|pendiente|n\/a|na|—|-|sin\s+tel[eé]fono)\s*$/i;

function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

/**
 * Devuelve número en formato preferido `+504 9755-3669` (8 dígitos móvil) o null si no es reconocible.
 */
export function normalizeHondurasPhone(input: string): string | null {
  const t = input.trim();
  if (!t || PLACEHOLDER.test(t)) return null;

  let d = onlyDigits(t);
  if (d.startsWith("504")) d = d.slice(3);
  if (d.length === 8) {
    return `+504 ${d.slice(0, 4)}-${d.slice(4)}`;
  }
  if (d.length === 7) {
    return `+504 ${d.slice(0, 3)}-${d.slice(3)}`;
  }
  return null;
}

/** Muestra formateado; si no se puede normalizar, devuelve el texto recortado. */
export function formatHondurasPhone(input: string): string {
  const n = normalizeHondurasPhone(input);
  if (n) return n;
  return input.trim();
}

/** Dígitos con prefijo 504 para wa.me (sin + ni espacios). */
export function whatsAppDigitsFromInput(input: string): string {
  const n = normalizeHondurasPhone(input);
  if (n) {
    const d = onlyDigits(n);
    return d.startsWith("504") ? d : `504${d}`;
  }
  let d = onlyDigits(input);
  if (d.startsWith("504")) return d;
  if (d.length === 8) return `504${d}`;
  return d;
}

/** URI `tel:` con prefijo internacional. */
export function telUriFromInput(input: string): string {
  const n = normalizeHondurasPhone(input);
  if (n) {
    const d = onlyDigits(n);
    return d.startsWith("504") ? `tel:+${d}` : `tel:+504${d}`;
  }
  const d = onlyDigits(input);
  if (d.length >= 8) {
    return d.startsWith("504") ? `tel:+${d}` : `tel:+504${d}`;
  }
  return `tel:${input.replace(/\s/g, "")}`;
}
