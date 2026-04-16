import type { Restaurant } from "@/types/restaurant";

const slug = "restaurante-rosquillas-paola" as const;

export const restaurantRosquillasPaola: Restaurant = {
  identity: {
    name: "Restaurante Rosquillas Paola",
    slug,
  },
  classification: {
    category: "comida-tipica",
    priceRange: "$$",
    featured: true,
  },
  copy: {
    summary:
      "Restaurante y rosquilleria sobre la CA-5 con sabor tradicional, parrilladas y productos para llevar.",
  },
  location: {
    address:
      "Restaurante y Rosquilleria Paola, Siguatepeque, Comayagua, Honduras.",
    coordinates: { lat: 14.6204357, lng: -87.9007292 },
  },
  contact: {
    phone: "+504 9557-7301",
    whatsapp: "+504 9557-7301",
  },
  hours: {
    scheduleLabel: "Todos los dias (confirmar horario por WhatsApp).",
  },
  media: {
    hero: "/restaurants/restaurante-rosquillas-paola/hero.jpg",
    gallery: [
      "/restaurants/restaurante-rosquillas-paola/gallery-1.jpg",
      "/restaurants/restaurante-rosquillas-paola/gallery-2.jpg",
    ],
  },
  ratings: {
    average: 4.6,
    reviewsCount: 64,
  },
  services: {
    offersDelivery: true,
    acceptsReservations: false,
  },
  reviews: [
    {
      id: "rp-1",
      author: "Cliente frecuente",
      rating: 5,
      comment: "Las rosquillas son de las mejores de la zona central.",
      date: "2026-04-08",
    },
  ],
};
