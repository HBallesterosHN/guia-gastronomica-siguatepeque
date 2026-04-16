import type { Restaurant } from "@/types/restaurant";

const slug = "la-pastela" as const;

export const restaurantLaPastela: Restaurant = {
  identity: {
    name: "La Pastela",
    slug,
  },
  classification: {
    category: "cafe",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary:
      "Reposteria artesanal en Siguatepeque con pasteles personalizados, postres para eventos y opciones sin gluten.",
  },
  location: {
    address:
      "La Pastela, Siguatepeque, Comayagua, Honduras.",
    coordinates: { lat: 14.6004843, lng: -87.8440206 },
  },
  contact: {
    phone: "+504 9582-4361",
    whatsapp: "+504 9582-4361",
  },
  hours: {
    scheduleLabel:
      "Lunes a sabado, 8:00 AM - 7:00 PM. Domingo, 9:00 AM - 7:00 PM.",
  },
  media: {
    hero: "/restaurants/la-pastela/hero.jpg?v=20260414",
    gallery: [
      "/restaurants/la-pastela/gallery-1.jpg?v=20260414",
      "/restaurants/la-pastela/gallery-2.jpg?v=20260414",
      "/restaurants/la-pastela/gallery-3.jpg?v=20260414",
    ],
  },
  ratings: {
    average: 4.7,
    reviewsCount: 23,
  },
  services: {
    offersDelivery: true,
    acceptsReservations: false,
  },
  reviews: [
    {
      id: "lp-1",
      author: "Cliente en linea",
      rating: 5,
      comment:
        "Muy responsable con la entrega; calidad y sabor excelentes, los recomiendo.",
      date: "2026-01-10",
    },
    {
      id: "lp-2",
      author: "M. R.",
      rating: 5,
      comment:
        "Atencion muy amable, producto de alta calidad y decoracion impecable en el pedido.",
      date: "2026-02-02",
    },
    {
      id: "lp-3",
      author: "L. F.",
      rating: 5,
      comment: "Trabajo detallado, buen gusto y muy responsables con los tiempos.",
      date: "2026-03-18",
    },
  ],
};
