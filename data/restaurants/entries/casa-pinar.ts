import type { Restaurant } from "@/types/restaurant";

const slug = "casa-pinar" as const;

export const restaurantCasaPinar: Restaurant = {
  identity: {
    name: "Casa Pinar",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: true,
  },
  copy: {
    summary:
      "Restaurante tradicional en Siguatepeque con menu catracho, ambiente amplio y servicio para reuniones familiares.",
  },
  location: {
    address:
      "Restaurante Casa Pinar Steak and Grill, Siguatepeque, Comayagua, Honduras.",
    coordinates: { lat: 14.5796094, lng: -87.8406748 },
  },
  contact: {
    phone: "+504 9667-2419",
    whatsapp: "+504 9667-2419",
  },
  hours: {
    scheduleLabel: "Lunes a domingo, desde las 11:00 AM.",
  },
  media: {
    hero: "/restaurants/casa-pinar/hero.jpg",
    gallery: [
      "/restaurants/casa-pinar/gallery-1.jpg",
      "/restaurants/casa-pinar/gallery-2.jpg",
    ],
  },
  ratings: {
    average: 4.5,
    reviewsCount: 71,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: true,
  },
  reviews: [
    {
      id: "cp-1",
      author: "Visitante",
      rating: 5,
      comment: "Buen sabor casero y atencion amable.",
      date: "2026-04-09",
    },
  ],
};
