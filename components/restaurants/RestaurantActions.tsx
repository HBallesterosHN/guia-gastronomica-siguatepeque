import type { Restaurant } from "@/types/restaurant";

interface RestaurantActionsProps {
  restaurant: Restaurant;
}

export function RestaurantActions({ restaurant }: RestaurantActionsProps) {
  const { location, contact } = restaurant;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`;
  const whatsappNumber = contact.whatsapp.replace(/\D/g, "");

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <a
        href={`tel:${contact.phone}`}
        className="rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-zinc-700"
      >
        Llamar
      </a>
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        WhatsApp
      </a>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-center text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
      >
        Cómo llegar
      </a>
    </div>
  );
}
