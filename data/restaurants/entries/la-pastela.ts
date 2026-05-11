import type { Restaurant } from "@/types/restaurant";

const slug = "la-pastela" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=3891544416499841830&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/lapastelahn/"
 * Referencias: ["https://www.google.com/maps/place/La+Pastela/@14.6004895,-87.8465955,17z/data=!3m1!4b1!4m6!3m5!1s0x8f6595002e65d061:0x36018b074d20bb26!8m2!3d14.6004843!4d-87.8440206!16s%2Fg%2F11lth9qph8?entry=tts&g_ep=EgoyMDI2MDQyMC4wIPu8ASoASAFQAw%3D%3D&skid=f60b9780-7853-44ed-8e56-21987d3bcb29","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=3891544416499841830&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantLaPastela: Restaurant = {
  identity: {
    name: "La Pastela",
    slug,
  },
  classification: {
    category: "cafe",
    priceRange: "$$",
    featured: true,
  },
  copy: {
    summary: "La Pastela en Siguatepeque, opción agradable para café y conversación tranquila; con datos de contacto u horario parcialmente verificados.",
  },
  location: {
    address: "J524+2GM, Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.6004843, lng: -87.8440206 },
  },
  contact: {
    phone: "+504 9582-4361",
    whatsapp: "+504 9582-4361",
  },
  hours: {
    scheduleLabel: "Monday: 8:30 AM – 6:30 PM · Tuesday: 8:30 AM – 6:30 PM · Wednesday: 8:30 AM – 6:30 PM · Thursday: 8:30 AM – 6:30 PM · Friday: 8:30 AM – 6:30 PM · Saturday: 8:30 AM – 6:30 PM · Sunday: 8:30 AM – 6:30 PM",
    structured: [{"day":"Lunes","open":"8:30 AM","close":"6:30 PM"},{"day":"Martes","open":"8:30 AM","close":"6:30 PM"},{"day":"Miercoles","open":"8:30 AM","close":"6:30 PM"},{"day":"Jueves","open":"8:30 AM","close":"6:30 PM"},{"day":"Viernes","open":"8:30 AM","close":"6:30 PM"},{"day":"Sabado","open":"8:30 AM","close":"6:30 PM"},{"day":"Domingo","open":"8:30 AM","close":"6:30 PM"}],
  },
  media: {
    hero: "/restaurants/la-pastela/hero.jpg",
    gallery: ["/restaurants/la-pastela/gallery-1.jpg","/restaurants/la-pastela/gallery-2.jpg","/restaurants/la-pastela/gallery-3.jpg","/restaurants/la-pastela/gallery-4.jpg","/restaurants/la-pastela/gallery-5.jpg","/restaurants/la-pastela/gallery-6.jpg","/restaurants/la-pastela/gallery-7.jpg","/restaurants/la-pastela/gallery-8.jpg","/restaurants/la-pastela/gallery-9.jpg","/restaurants/la-pastela/gallery-10.jpg"],
  },
  ratings: {
    average: 4.6,
    reviewsCount: 51,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [],
};
