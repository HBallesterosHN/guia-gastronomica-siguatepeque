import { normalizeHondurasPhone } from "@/lib/formatters/phone";

/** Valores de contacto que no deben enlazar a tel/WA. */
const PLACEHOLDER_PHONE = /^(por\s*confirmar|pendiente|n\/a|na|—|-|sin\s+tel[eé]fono)\s*$/i;

function digitCount(value: string): number {
  return value.replace(/\D/g, "").length;
}

export function hasDialablePhone(phone: string): boolean {
  const t = phone.trim();
  if (!t || PLACEHOLDER_PHONE.test(t)) return false;
  if (normalizeHondurasPhone(t)) return true;
  return digitCount(t) >= 8;
}

export function hasWhatsAppLink(whatsapp: string): boolean {
  return hasDialablePhone(whatsapp);
}

export function hasMapCoordinates(coords: { lat: number; lng: number }): boolean {
  return (
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng) &&
    !(coords.lat === 0 && coords.lng === 0)
  );
}
