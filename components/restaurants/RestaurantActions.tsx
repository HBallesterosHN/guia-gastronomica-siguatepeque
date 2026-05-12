import type { Restaurant } from "@/types/restaurant";
import { telUriFromInput, whatsAppDigitsFromInput } from "@/lib/formatters/phone";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons/ContactIcons";
import { hasDialablePhone, hasMapCoordinates, hasWhatsAppLink } from "@/lib/contact-validation";

interface RestaurantActionsProps {
  restaurant: Restaurant;
}

export function RestaurantActions({ restaurant }: RestaurantActionsProps) {
  const { location, contact, menu } = restaurant;
  const showTel = hasDialablePhone(contact.phone);
  const showWa = hasWhatsAppLink(contact.whatsapp);
  const showMap = hasMapCoordinates(location.coordinates);
  const whatsappNumber = whatsAppDigitsFromInput(contact.whatsapp);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`;
  const menuUrl = menu?.url?.trim();
  const menuLabel = menu?.label?.trim() || "Ver menú";

  const count = [showTel, showWa, showMap, Boolean(menuUrl)].filter(Boolean).length;

  if (count === 0) {
    return (
      <p className="text-sm text-zinc-600">
        Aún no hay teléfono, WhatsApp ni mapa verificados para mostrar aquí.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {showTel ? (
        <a
          href={telUriFromInput(contact.phone)}
          className="inline-flex min-w-[8.5rem] flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-zinc-700 sm:min-w-0 sm:flex-1"
        >
          <PhoneIcon className="h-5 w-5 shrink-0" />
          Llamar
        </a>
      ) : null}
      {showWa ? (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-w-[8.5rem] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700 sm:min-w-0 sm:flex-1"
        >
          <WhatsAppIcon className="h-5 w-5 shrink-0" />
          WhatsApp
        </a>
      ) : null}
      {showMap ? (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-w-[8.5rem] flex-1 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-3 text-center text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 sm:min-w-0 sm:flex-1"
        >
          Cómo llegar
        </a>
      ) : null}
      {menuUrl ? (
        <a
          href={menuUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-w-[8.5rem] flex-1 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 sm:min-w-0 sm:flex-1"
        >
          {menuLabel}
        </a>
      ) : null}
    </div>
  );
}
