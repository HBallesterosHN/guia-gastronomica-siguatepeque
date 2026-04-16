import type { Restaurant } from "@/types/restaurant";

const slug = "restaurante-villa-verde" as const;

export const restaurantVillaVerde: Restaurant = {
  identity: {
    name: "Restaurante Villa Verde",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary:
      "Restaurante sobre la CA-5 con cocina centroamericana y ambiente campestre para desayuno, almuerzo y cena.",
  },
  location: {
    address: "Restaurante Tipico Villa Verde, Siguatepeque, Comayagua, Honduras.",
    coordinates: { lat: 14.6119171, lng: -87.8888617 },
  },
  contact: {
    phone: "+504 9368-0825",
    whatsapp: "+504 9368-0825",
  },
  hours: {
    scheduleLabel: "Desayuno, almuerzo y cena (consultar horario vigente por WhatsApp).",
  },
  media: {
    hero: "/restaurants/restaurante-villa-verde/hero.jpg",
    gallery: [
      "/restaurants/restaurante-villa-verde/gallery-1.jpg",
      "/restaurants/restaurante-villa-verde/gallery-2.jpg",
    ],
  },
  ratings: {
    average: 4.4,
    reviewsCount: 47,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: true,
  },
  reviews: [
    {
      id: "vv-1",
      author: "Visitante",
      rating: 4,
      comment: "Buena ubicacion y ambiente agradable para la familia.",
      date: "2026-04-07",
    },
  ],
};
