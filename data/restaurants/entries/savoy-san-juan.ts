import type { Restaurant } from "@/types/restaurant";

const slug = "savoy-san-juan" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=4428290648166336107&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/savoy.hn/"
 * Referencias: ["https://www.google.com/maps/place/Plaza+Savoy/@22.590868,-103.0230165,5z/data=!4m7!3m6!1s0x8f6595bd2bbdefc3:0x3d7472e1e623866b!8m2!3d14.5902625!4d-87.8331546!15sCgVzYXZveZIBD3Nob3BwaW5nX2NlbnRlcuABAA!16s%2Fg%2F11c1s21n5g?entry=tts&g_ep=EgoyMDI2MDQyMS4wIPu8ASoASAFQAw%3D%3D&skid=f8d046bc-094f-4321-b3b7-bbb70a627047","https://www.instagram.com/savoy.hn/","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=4428290648166336107&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantSavoySanJuan: Restaurant = {
  identity: {
    name: "Plaza Savoy",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary:
      "Plaza Savoy en Siguatepeque; comedor amplio estilo salón, práctico para almuerzo de negocio o grupo grande.",
  },
  location: {
    address: "Cementerio San Juan, Blvd. Morazan, 12111 Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.5902625, lng: -87.8331546 },
  },
  contact: {
    phone: "Por confirmar",
    whatsapp: "Por confirmar",
  },
  hours: {
    scheduleLabel: "Monday: 8:00 AM – 6:00 PM · Tuesday: 8:00 AM – 6:00 PM · Wednesday: 8:00 AM – 6:00 PM · Thursday: 8:00 AM – 6:00 PM · Friday: 8:00 AM – 6:00 PM · Saturday: 8:00 AM – 12:00 PM · Sunday: Closed",
    structured: [{"day":"Lunes","open":"8:00 AM","close":"6:00 PM"},{"day":"Martes","open":"8:00 AM","close":"6:00 PM"},{"day":"Miércoles","open":"8:00 AM","close":"6:00 PM"},{"day":"Jueves","open":"8:00 AM","close":"6:00 PM"},{"day":"Viernes","open":"8:00 AM","close":"6:00 PM"},{"day":"Sábado","open":"8:00 AM","close":"12:00 PM"},{"day":"Domingo","open":"Closed","close":"Closed"}],
  },
  media: {
    hero: "/restaurants/savoy-san-juan/hero.jpg",
    gallery: ["/restaurants/savoy-san-juan/gallery-1.jpg","/restaurants/savoy-san-juan/gallery-2.jpg","/restaurants/savoy-san-juan/gallery-3.jpg","/restaurants/savoy-san-juan/gallery-4.jpg","/restaurants/savoy-san-juan/gallery-5.jpg","/restaurants/savoy-san-juan/gallery-6.jpg","/restaurants/savoy-san-juan/gallery-7.jpg","/restaurants/savoy-san-juan/gallery-8.jpg","/restaurants/savoy-san-juan/gallery-9.jpg","/restaurants/savoy-san-juan/gallery-10.webp"],
  },
  ratings: {
    average: 4.2,
    reviewsCount: 106,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [],
};
