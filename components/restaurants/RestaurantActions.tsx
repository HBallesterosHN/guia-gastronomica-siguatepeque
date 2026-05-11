import type { Restaurant } from "@/types/restaurant";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons/ContactIcons";

interface RestaurantActionsProps {
  restaurant: Restaurant;
}

export function RestaurantActions({ restaurant }: RestaurantActionsProps) {
  const { location, contact, menu } = restaurant;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`;
  const whatsappNumber = contact.whatsapp.replace(/\D/g, "");
  const menuUrl = menu?.url?.trim();
  const menuLabel = menu?.label?.trim() || "Ver menú";

  return (
    <div
      className={`grid gap-3 ${menuUrl ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}
    >
      <a
        href={`tel:${contact.phone}`}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-zinc-700"
      >
        <PhoneIcon className="h-5 w-5 shrink-0" />
        Llamar
      </a>
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        <WhatsAppIcon className="h-5 w-5 shrink-0" />
        WhatsApp
      </a>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-center text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
      >
        Cómo llegar
      </a>
      {menuUrl ? (
        <a
          href={menuUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
        >
          {menuLabel}
        </a>
      ) : null}
    </div>
  );
}
