import type { Restaurant } from "@/types/restaurant";

const slug = "restaurante-del-corral" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=10672660458660782140&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/jjrestaurante_hn/"
 * Referencias: ["https://www.google.com/maps/place/Restaurante+J%26J+%E2%80%A2+Supermercados+Del+Corral/@14.5943368,-87.8360682,17z/data=!3m1!4b1!4m6!3m5!1s0x8f6595a393d4e753:0x941ce82416d5603c!8m2!3d14.5943317!4d-87.8311973!16s%2Fg%2F11xfb7xx3?entry=tts&g_ep=EgoyMDI2MDQyMS4wIPu8ASoASAFQAw%3D%3D&skid=d5909492-e56a-490a-a0ec-71729046aca9","https://www.instagram.com/jjrestaurante_hn/","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=10672660458660782140&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantRestauranteDelCorral: Restaurant = {
  identity: {
    name: "J&J Restaurante",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary:
      "J&J Restaurante Del Corral en Siguatepeque; comida mixta y lugar concurrido para almuerzo de entre semana cerca de la CA-5.",
  },
  location: {
    address: "H5V9+PGM Supermercados Del Corral, Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.5943317, lng: -87.8311973 },
  },
  contact: {
    phone: "+504 2773-4477",
    whatsapp: "+504 2773-4477",
  },
  hours: {
    scheduleLabel: "Monday: 7:00 AM – 9:00 PM · Tuesday: 7:00 AM – 9:00 PM · Wednesday: 7:00 AM – 9:00 PM · Thursday: 7:00 AM – 9:00 PM · Friday: 7:00 AM – 9:00 PM · Saturday: 7:00 AM – 9:00 PM · Sunday: 7:00 AM – 9:00 PM",
    structured: [{"day":"Lunes","open":"7:00 AM","close":"9:00 PM"},{"day":"Martes","open":"7:00 AM","close":"9:00 PM"},{"day":"Miércoles","open":"7:00 AM","close":"9:00 PM"},{"day":"Jueves","open":"7:00 AM","close":"9:00 PM"},{"day":"Viernes","open":"7:00 AM","close":"9:00 PM"},{"day":"Sábado","open":"7:00 AM","close":"9:00 PM"},{"day":"Domingo","open":"7:00 AM","close":"9:00 PM"}],
  },
  media: {
    hero: "/restaurants/restaurante-del-corral/hero.jpg",
    gallery: ["/restaurants/restaurante-del-corral/gallery-1.jpg","/restaurants/restaurante-del-corral/gallery-2.jpg","/restaurants/restaurante-del-corral/gallery-3.jpg","/restaurants/restaurante-del-corral/gallery-4.jpg","/restaurants/restaurante-del-corral/gallery-5.jpg","/restaurants/restaurante-del-corral/gallery-6.jpg","/restaurants/restaurante-del-corral/gallery-7.jpg","/restaurants/restaurante-del-corral/gallery-8.jpg","/restaurants/restaurante-del-corral/gallery-9.jpg","/restaurants/restaurante-del-corral/gallery-10.webp"],
  },
  ratings: {
    average: 4.4,
    reviewsCount: 999,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [],
};
