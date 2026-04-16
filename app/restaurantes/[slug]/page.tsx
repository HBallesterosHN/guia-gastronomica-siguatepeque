import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { RestaurantActions } from "@/components/restaurants/RestaurantActions";
import { ReviewList } from "@/components/restaurants/ReviewList";
import { StarRating } from "@/components/restaurants/StarRating";
import { categoryLabels } from "@/lib/category";
import { getAllRestaurants, getRestaurantBySlug } from "@/lib/restaurants";

interface RestaurantDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllRestaurants().map((restaurant) => ({
    slug: restaurant.identity.slug,
  }));
}

export async function generateMetadata({
  params,
}: RestaurantDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);

  if (!restaurant) {
    return {
      title: "Restaurante no encontrado",
    };
  }

  return {
    title: `${restaurant.identity.name} | Guia Gastronomica de Siguatepeque`,
    description: restaurant.copy.summary,
  };
}

export default async function RestaurantDetailPage({
  params,
}: RestaurantDetailPageProps) {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const { identity, classification, copy, location, hours, media, ratings, services } =
    restaurant;

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
                <span className="rounded-full bg-zinc-950/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {ratings.reviewsCount} reseñas
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-bold text-white sm:text-5xl">
                {identity.name}
              </h1>
              <div className="mt-3">
                <StarRating
                  rating={ratings.average}
                  reviewCount={ratings.reviewsCount}
                  className="[&>p]:text-white/90"
                />
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

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-zinc-900">Galeria</h2>
                <p className="text-sm text-zinc-500">
                  {media.gallery.length > 0
                    ? `${media.gallery.length} fotos`
                    : "Sin fotos adicionales"}
                </p>
              </div>
              {media.gallery.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {media.gallery.map((image) => (
                    <div key={image} className="relative h-56 w-full overflow-hidden rounded-2xl ring-1 ring-zinc-200">
                      <Image
                        src={image}
                        alt={`Foto de ${identity.name}`}
                        fill
                        className="object-cover transition duration-500 hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
                  Este perfil todavia no tiene galeria adicional.
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-zinc-900">
                    Reseñas destacadas
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Opiniones de visitantes y comensales recientes.
                  </p>
                </div>
              </div>
              <ReviewList reviews={restaurant.reviews} />
            </section>
          </section>

          <aside className="h-fit space-y-6 rounded-[1.75rem] border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 p-6 shadow-sm">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Informacion util
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-900">
                Todo para tu visita
              </h2>
            </div>

            <RestaurantActions restaurant={restaurant} />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Delivery
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-900">
                  {services.offersDelivery ? "Si, disponible" : "No disponible"}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Reservas
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-900">
                  {services.acceptsReservations
                    ? "Si, acepta reservas"
                    : "No acepta reservas"}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-zinc-700">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Categoria
                </p>
                <p className="mt-2 font-semibold text-zinc-900">
                  {categoryLabels[classification.category]}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Direccion completa
                </p>
                <p className="mt-2 leading-6 text-zinc-900">{location.address}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Horario
                </p>
                <p className="mt-2 leading-6 text-zinc-900">{hours.scheduleLabel}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Telefono
                </p>
                <p className="mt-2 font-semibold text-zinc-900">
                  {restaurant.contact.phone}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  WhatsApp
                </p>
                <p className="mt-2 font-semibold text-zinc-900">
                  {restaurant.contact.whatsapp}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Rating promedio
                </p>
                <p className="mt-2 font-semibold text-zinc-900">
                  {ratings.average.toFixed(1)} / 5
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Cantidad de reseñas
                </p>
                <p className="mt-2 font-semibold text-zinc-900">
                  {ratings.reviewsCount}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Coordenadas
                </p>
                <p className="mt-2 leading-6 text-zinc-900">
                  {location.coordinates.lat}, {location.coordinates.lng}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
