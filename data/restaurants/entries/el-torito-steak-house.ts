import type { Restaurant } from "@/types/restaurant";

const slug = "el-torito-steak-house" as const;

export const restaurantElToritoSteakHouse: Restaurant = {
  identity: {
    name: "El Torito Steak House",
    slug,
  },
  classification: {
    category: "parrilla",
    priceRange: "$$$",
    featured: false,
  },
  copy: {
    summary:
      "Steak house en Siguatepeque con parrilladas, mariscos y sopas; referencia en la CA-5 frente a Uniplaza. Perfil: https://www.instagram.com/eltorito_steakhouse/",
  },
  location: {
    address: "Carretera CA-5, frente a Uniplaza, Siguatepeque, Comayagua, Honduras.",
    coordinates: { lat: 14.5972, lng: -87.8354 },
  },
  contact: {
    phone: "+504 2773-3500",
    whatsapp: "+504 2773-3500",
  },
  hours: {
    scheduleLabel: "Lunes a sabado, 11:30 AM - 9:00 PM. Domingo, 11:30 AM - 8:00 PM.",
  },
  media: {
    hero: "/restaurants/el-torito-steak-house/hero.jpg",
    gallery: [],
  },
  ratings: {
    average: 4.6,
    reviewsCount: 42,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: true,
  },
  reviews: [
    {
      id: "et-1",
      author: "Visitante",
      rating: 5,
      comment: "Buena carne y ambiente agradable para cenar en familia.",
      date: "2026-04-14",
    },
  ],
};
