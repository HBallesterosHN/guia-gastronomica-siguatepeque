import type { Restaurant } from "@/types/restaurant";

const slug = "habana-mex" as const;

export const restaurantHabanaMex: Restaurant = {
  identity: {
    name: "Habana Mex",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary:
      "Restaurante con influencia mexicana y carta donde destacan las sopas; la sopa de mondongo es la especialidad de la casa.",
  },
  location: {
    address: "Siguatepeque, Comayagua, Honduras.",
    coordinates: { lat: 14.5997, lng: -87.8336 },
  },
  contact: {
    phone: "+504 8829-7216",
    whatsapp: "+504 8829-7216",
  },
  hours: {
    scheduleLabel: "Consultar horario por telefono.",
  },
  media: {
    hero: "/restaurants/habana-mex/hero.jpg",
    gallery: [],
  },
  ratings: {
    average: 4.5,
    reviewsCount: 0,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [
    {
      id: "hm-1",
      author: "Comensal",
      rating: 5,
      comment: "La sopa de mondongo es de las mas completas que he probado en la ciudad.",
      date: "2026-04-14",
    },
  ],
};
