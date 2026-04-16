import type { Restaurant } from "@/types/restaurant";

const slug = "tipicos-guancasco" as const;

export const restaurantTipicosGuancasco: Restaurant = {
  identity: {
    name: "Tipicos Guancasco",
    slug,
  },
  classification: {
    category: "comida-tipica",
    priceRange: "$$",
    featured: true,
  },
  copy: {
    summary:
      "Cocina tipica hondurena con ambiente familiar, platos tradicionales y porciones para compartir.",
  },
  location: {
    address: "Restaurante Tipico's Guancasco, Siguatepeque, Comayagua, Honduras.",
    coordinates: { lat: 14.5842687, lng: -87.901026 },
  },
  contact: {
    phone: "+504 3198-0556",
    whatsapp: "+504 3198-0556",
  },
  hours: {
    scheduleLabel:
      "Lunes a domingo, desde las 8:00 AM.",
  },
  media: {
    hero: "/restaurants/tipicos-guancasco/hero.jpg",
    gallery: [
      "/restaurants/tipicos-guancasco/gallery-1.jpg",
      "/restaurants/tipicos-guancasco/gallery-2.jpg",
    ],
  },
  ratings: {
    average: 4.6,
    reviewsCount: 58,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: true,
  },
  reviews: [
    {
      id: "tg-1",
      author: "Comensal local",
      rating: 5,
      comment: "Comida tipica muy rica y porciones abundantes.",
      date: "2026-04-10",
    },
  ],
};
