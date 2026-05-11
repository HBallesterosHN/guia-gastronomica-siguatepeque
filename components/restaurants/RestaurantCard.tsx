import Image from "next/image";
import Link from "next/link";
import type { Restaurant } from "@/types/restaurant";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons/ContactIcons";
import { StarRating } from "@/components/restaurants/StarRating";
import { categoryLabels } from "@/lib/category";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { identity, classification, copy, location, contact, media, ratings } =
    restaurant;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`;
  const whatsappNumber = contact.whatsapp.replace(/\D/g, "");

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/restaurantes/${identity.slug}`} className="block">
        <div className="group relative h-48 w-full">
          <Image
            src={media.hero}
            alt={identity.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/35 to-transparent" />
        </div>
      </Link>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/restaurantes/${identity.slug}`}
            className="text-xl font-semibold text-zinc-900 hover:underline"
          >
            {identity.name}
          </Link>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            {classification.priceRange}
          </span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {categoryLabels[classification.category]}
        </p>
        <p className="min-h-12 text-sm leading-6 text-zinc-600">{copy.summary}</p>
        {ratings.reviewsCount > 0 ? (
          <StarRating rating={ratings.average} reviewCount={ratings.reviewsCount} />
        ) : ratings.average > 0 ? (
          <p className="text-sm text-zinc-600">
            ~{ratings.average.toFixed(1)}/5 público (sin conteo en ficha; ver Maps)
          </p>
        ) : (
          <p className="text-sm text-zinc-500">Valoración pública: pendiente</p>
        )}
        <p className="line-clamp-2 text-sm text-zinc-500">{location.address}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <a
            href={`tel:${contact.phone}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            <PhoneIcon className="h-4 w-4 shrink-0" />
            Llamar
          </a>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0" />
            WhatsApp
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
          >
            Cómo llegar
          </a>
        </div>
        <Link
          href={`/restaurantes/${identity.slug}`}
          className="inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Ver perfil →
        </Link>
      </div>
    </article>
  );
}
