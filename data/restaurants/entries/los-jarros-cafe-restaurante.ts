import type { Restaurant } from "@/types/restaurant";

const slug = "los-jarros-cafe-restaurante" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=13007715618499032766&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/los_jarrosrestaurant/"
 * Referencias: ["https://www.google.com/maps/place/Los+Jarros/@23.2632723,-103.0190081,5z/data=!4m7!3m6!1s0x8f65958c047d09c5:0xb484b06febef76be!8m2!3d14.5844255!4d-87.8496103!15sChZsb3MgamFycm9zIHJlc3RhdXJhbnRlWhgiFmxvcyBqYXJyb3MgcmVzdGF1cmFudGWSAQ1iYXJfYW5kX2dyaWxsmgEkQ2hkRFNVaE5NRzluUzBWSlEwRm5TVU40TlRScFVWOUJSUkFC4AEA-gEECAAQOQ!16s%2Fg%2F11c5fbm_3q?entry=tts&g_ep=EgoyMDI2MDQyMS4wIPu8ASoASAFQAw%3D%3D&skid=366d8d35-dcb6-4c8a-87d1-2d5256ddd4bd","https://www.instagram.com/los_jarrosrestaurant/","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=13007715618499032766&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantLosJarrosCafeRestaurante: Restaurant = {
  identity: {
    name: "Los Jarros",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary:
      "Los Jarros (café-restaurante) en Siguatepeque; mezcla de cafetería y comida casera para almuerzo o tarde.",
  },
  location: {
    address: "Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.584425500000002, lng: -87.8496103 },
  },
  contact: {
    phone: "Por confirmar",
    whatsapp: "Por confirmar",
  },
  hours: {
    scheduleLabel: "Monday: 7:00 AM – 9:00 PM · Tuesday: 7:00 AM – 9:00 PM · Wednesday: 7:00 AM – 9:00 PM · Thursday: 7:00 AM – 9:00 PM · Friday: 7:00 AM – 9:00 PM · Saturday: 7:00 AM – 9:00 PM · Sunday: 7:00 AM – 9:00 PM",
    structured: [{"day":"Lunes","open":"7:00 AM","close":"9:00 PM"},{"day":"Martes","open":"7:00 AM","close":"9:00 PM"},{"day":"Miércoles","open":"7:00 AM","close":"9:00 PM"},{"day":"Jueves","open":"7:00 AM","close":"9:00 PM"},{"day":"Viernes","open":"7:00 AM","close":"9:00 PM"},{"day":"Sábado","open":"7:00 AM","close":"9:00 PM"},{"day":"Domingo","open":"7:00 AM","close":"9:00 PM"}],
  },
  media: {
    hero: "/restaurants/los-jarros-cafe-restaurante/hero.jpg",
    gallery: ["/restaurants/los-jarros-cafe-restaurante/gallery-1.jpg","/restaurants/los-jarros-cafe-restaurante/gallery-2.jpg","/restaurants/los-jarros-cafe-restaurante/gallery-3.jpg","/restaurants/los-jarros-cafe-restaurante/gallery-4.jpg","/restaurants/los-jarros-cafe-restaurante/gallery-5.jpg","/restaurants/los-jarros-cafe-restaurante/gallery-6.jpg","/restaurants/los-jarros-cafe-restaurante/gallery-7.jpg","/restaurants/los-jarros-cafe-restaurante/gallery-8.jpg","/restaurants/los-jarros-cafe-restaurante/gallery-9.jpg","/restaurants/los-jarros-cafe-restaurante/gallery-10.webp"],
  },
  ratings: {
    average: 4.3,
    reviewsCount: 813,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [],
};
