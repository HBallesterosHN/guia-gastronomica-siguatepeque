import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { OwnerProfileUpdateCta } from "@/components/restaurants/OwnerProfileUpdateCta";
import { RestaurantActions } from "@/components/restaurants/RestaurantActions";
import { GalleryLightbox } from "@/components/restaurants/GalleryLightbox";
import { ReviewList } from "@/components/restaurants/ReviewList";
import { StarRating } from "@/components/restaurants/StarRating";
import { categoryLabels } from "@/lib/category";
import { getTrustedEditorialReviews } from "@/lib/review-trust";
import {
  getAllRestaurants,
  getRestaurantBySlug,
  getRestaurantInstagramUrlBySlug,
} from "@/lib/restaurants";
import { hasDialablePhone, hasWhatsAppLink } from "@/lib/contact-validation";
import { ogPublicImagePath } from "@/lib/og-metadata";
import { SITE_BRAND_NAME, SITE_PAGE_TITLE_SUFFIX } from "@/lib/site-brand";

interface RestaurantDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const all = await getAllRestaurants();
  return all.map((restaurant) => ({
    slug: restaurant.identity.slug,
  }));
}

export async function generateMetadata({
  params,
}: RestaurantDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return {
      title: "Restaurante no encontrado",
    };
  }

  const title = `${restaurant.identity.name} ${SITE_PAGE_TITLE_SUFFIX}`;
  const description = restaurant.copy.summary;
  const heroUrl = ogPublicImagePath(restaurant.media.hero);

  return {
    title,
    description,
    alternates: {
      canonical: `/restaurantes/${slug}`,
    },
    openGraph: {
      type: "website",
      locale: "es_HN",
      siteName: SITE_BRAND_NAME,
      title,
      description,
      url: `/restaurantes/${slug}`,
      images: [{ url: heroUrl, alt: restaurant.identity.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [heroUrl],
    },
  };
}

export default async function RestaurantDetailPage({
  params,
}: RestaurantDetailPageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const { identity, classification, copy, location, hours, media, ratings, services } =
    restaurant;
  const galleryImages =
    (media.gallery?.length ?? 0) > 0
      ? media.gallery ?? []
      : [...(media.featured ?? []), ...(media.place ?? [])];
  const structuredHours = hours.structured ?? [];
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
  const todayEs = dayMap[currentDayEnglish] ?? "";
  const trustedReviews = getTrustedEditorialReviews(restaurant.reviews);
  const showEditorialReviews = trustedReviews.length > 0;
  const publicRatingCount = ratings.reviewsCount > 0;
  const instagramUrl = (await getRestaurantInstagramUrlBySlug(identity.slug)) ?? "";
  const showPhoneBlock = hasDialablePhone(restaurant.contact.phone);
  const showWhatsappBlock = hasWhatsAppLink(restaurant.contact.whatsapp);
  const instagramHandle = (() => {
    if (!instagramUrl) return "";
    try {
      const parsed = new URL(instagramUrl);
      const first = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
      return first ? `@${first.replace(/^@/, "")}` : "";
    } catch {
      return "";
    }
  })();

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10 sm:px-6">
      <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
        <div className="relative h-[460px] w-full">
          <Image
            src={media.hero}
            alt={identity.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/35 to-zinc-950/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <div className="w-fit max-w-3xl rounded-2xl bg-zinc-950/40 p-4 backdrop-blur-sm sm:p-5">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  {categoryLabels[classification.category]}
                </span>
                <span className="rounded-full bg-zinc-950/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {classification.priceRange}
                </span>
                {publicRatingCount ? (
                  <span className="rounded-full bg-zinc-950/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    {ratings.reviewsCount.toLocaleString("es-HN")} valoraciones públicas
                  </span>
                ) : null}
                {restaurant.profileStatus?.verified ? (
                  <span
                    className="rounded-full border border-white/35 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/95 backdrop-blur"
                    title={
                      restaurant.profileStatus.lastReviewed
                        ? `Última revisión: ${restaurant.profileStatus.lastReviewed}`
                        : undefined
                    }
                  >
                    Información verificada
                  </span>
                ) : null}
              </div>
              <h1 className="mt-4 text-3xl font-bold text-white sm:text-5xl">
                {identity.name}
              </h1>
              <div className="mt-3">
                {publicRatingCount ? (
                  <StarRating
                    rating={ratings.average}
                    reviewCount={ratings.reviewsCount}
                    className="[&>p]:text-white/90"
                  />
                ) : ratings.average > 0 ? (
                  <p className="text-sm text-white/90">
                    Promedio público ~{ratings.average.toFixed(1)}/5 (sin conteo de valoraciones en
                    esta ficha; ver Google Maps para el detalle).
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-8 p-6 lg:grid-cols-[1.5fr_0.9fr] lg:p-8">
          <section className="space-y-8">
            <div className="space-y-4">
              <p className="max-w-3xl text-lg leading-8 text-zinc-600">
                {copy.summary}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Delivery
                  </p>
                  <p className="mt-2 text-base font-semibold text-zinc-900">
                    {services.offersDelivery ? "Disponible" : "No disponible"}
                  </p>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Reservas
                  </p>
                  <p className="mt-2 text-base font-semibold text-zinc-900">
                    {services.acceptsReservations ? "Aceptadas" : "No disponibles"}
                  </p>
                </div>
                <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Precio
                  </p>
                  <p className="mt-2 text-base font-semibold text-zinc-900">
                    {classification.priceRange}
                  </p>
                </div>
              </div>
            </div>

            <GalleryLightbox images={galleryImages} restaurantName={identity.name} />
            {instagramUrl ? (
              <div className="pt-1">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
                >
                  Ver más fotos en Instagram
                </a>
              </div>
            ) : null}

            {showEditorialReviews ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-zinc-900">
                      Notas del equipo (texto propio)
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Solo publicamos comentarios que el equipo haya verificado con criterio
                      editorial. No son valoraciones de Google ni reseñas generadas por máquina.
                    </p>
                  </div>
                </div>
                <ReviewList reviews={trustedReviews} />
              </section>
            ) : null}
          </section>

          <aside className="h-fit space-y-6 rounded-[1.75rem] border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 p-6 shadow-sm">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Información útil
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-900">
                Antes de ir
              </h2>
            </div>

            <RestaurantActions restaurant={restaurant} />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Delivery
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-900">
                  {services.offersDelivery ? "Sí, disponible" : "No disponible"}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Reservas
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-900">
                  {services.acceptsReservations
                    ? "Sí, acepta reservas"
                    : "No acepta reservas"}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-zinc-700">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Categoría
                </p>
                <p className="mt-2 font-semibold text-zinc-900">
                  {categoryLabels[classification.category]}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Dirección completa
                </p>
                <p className="mt-2 leading-6 text-zinc-900">{location.address}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Horario
                </p>
                {structuredHours.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {structuredHours.map((item) => {
                      const isToday = item.day === todayEs;
                      return (
                        <div
                          key={`${item.day}-${item.open}-${item.close}`}
                          className={`flex items-center justify-between gap-3 rounded-lg px-2 py-1 ${
                            isToday ? "bg-emerald-50 text-emerald-800" : "text-zinc-900"
                          }`}
                        >
                          <span className="font-medium">{item.day}</span>
                          <span className="text-right">{item.open} - {item.close}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-2 leading-6 text-zinc-900">{hours.scheduleLabel}</p>
                )}
              </div>
              {showPhoneBlock ? (
                <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Teléfono
                  </p>
                  <p className="mt-2 font-semibold text-zinc-900">
                    {restaurant.contact.phone}
                  </p>
                </div>
              ) : null}
              {showWhatsappBlock ? (
                <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    WhatsApp
                  </p>
                  <p className="mt-2 font-semibold text-zinc-900">
                    {restaurant.contact.whatsapp}
                  </p>
                </div>
              ) : null}
              {instagramUrl ? (
                <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Instagram
                  </p>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    {instagramHandle || "Ver perfil"}
                  </a>
                </div>
              ) : null}
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Valoración pública
                </p>
                <p className="mt-2 font-semibold text-zinc-900">
                  {publicRatingCount || ratings.average > 0
                    ? `Promedio ${ratings.average.toFixed(1)} / 5`
                    : "Sin dato aún"}
                </p>
                {publicRatingCount ? (
                  <p className="mt-1 text-sm text-zinc-600">
                    Agregado de {ratings.reviewsCount.toLocaleString("es-HN")} valoraciones públicas
                    (p. ej. Google Maps). No son comentarios escritos por esta guía.
                  </p>
                ) : ratings.average > 0 ? (
                  <p className="mt-1 text-sm text-zinc-600">
                    Tenemos el promedio pero aún no el conteo en esta ficha; conviene confirmar en
                    Google Maps.
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-zinc-600">
                    Aún no publicamos promedio ni conteo de valoraciones públicas para este perfil.
                  </p>
                )}
              </div>
            </div>

            <OwnerProfileUpdateCta />
          </aside>
        </div>
      </section>
    </main>
  );
}
