import type { Restaurant } from "@/types/restaurant";

const slug = "china-weng" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=12378404984455088546&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/restaurantechinaweng/"
 * Referencias: ["https://www.google.com/maps/place/Restaurante+China+Weng/@14.5915155,-87.8796439,14z/data=!4m7!3m6!1s0x8f65954409887fc7:0xabc8edbff05ec9a2!8m2!3d14.5863704!4d-87.8507766!15sCgpjaGluYSB3YW5nWgwiCmNoaW5hIHdhbmeSARJjaGluZXNlX3Jlc3RhdXJhbnSaASRDaGREU1VoTk1HOW5TMFZKUTBGblNVTjRjSEJ1ZGpGM1JSQULgAQD6AQQIABAp!16s%2Fg%2F11rhqjxh4w?entry=tts&g_ep=EgoyMDI2MDQyMC4wIPu8ASoASAFQAw%3D%3D&skid=cd7c4408-de0b-410e-b27c-9db93fc917fe","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=12378404984455088546&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantChinaWeng: Restaurant = {
  identity: {
    name: "Restaurante China Weng",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary: "Restaurante China Weng en Siguatepeque, opción cómoda para comer en plan familiar; con datos de contacto u horario parcialmente verificados.",
  },
  location: {
    address: "CA-5, 12111 Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.5863704, lng: -87.85077659999999 },
  },
  contact: {
    phone: "+504 9616-8866",
    whatsapp: "+504 9616-8866",
  },
  hours: {
    scheduleLabel: "Monday: 9:00 AM – 9:00 PM · Tuesday: 9:00 AM – 9:00 PM · Wednesday: 9:00 AM – 9:00 PM · Thursday: 9:00 AM – 9:00 PM · Friday: 9:00 AM – 9:00 PM · Saturday: 9:00 AM – 9:00 PM · Sunday: 9:00 AM – 9:00 PM",
    structured: [{"day":"Lunes","open":"9:00 AM","close":"9:00 PM"},{"day":"Martes","open":"9:00 AM","close":"9:00 PM"},{"day":"Miercoles","open":"9:00 AM","close":"9:00 PM"},{"day":"Jueves","open":"9:00 AM","close":"9:00 PM"},{"day":"Viernes","open":"9:00 AM","close":"9:00 PM"},{"day":"Sabado","open":"9:00 AM","close":"9:00 PM"},{"day":"Domingo","open":"9:00 AM","close":"9:00 PM"}],
  },
  media: {
    hero: "/restaurants/china-weng/hero.jpg",
    gallery: ["/restaurants/china-weng/gallery-1.jpg","/restaurants/china-weng/gallery-2.jpg","/restaurants/china-weng/gallery-3.jpg","/restaurants/china-weng/gallery-4.jpg","/restaurants/china-weng/gallery-5.jpg","/restaurants/china-weng/gallery-6.jpg","/restaurants/china-weng/gallery-7.jpg","/restaurants/china-weng/gallery-8.jpg","/restaurants/china-weng/gallery-9.jpg","/restaurants/china-weng/gallery-10.jpg"],
  },
  ratings: {
    average: 4.4,
    reviewsCount: 185,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [
    {
      id: "china-weng-seed-1",
      author: "Reseña inicial",
      rating: 4,
      comment: "Primera impresión positiva; vale la pena validar menú y horarios en sitio.",
      date: "2026-04-23",
    },
    {
      id: "china-weng-seed-2",
      author: "Reseña inicial",
      rating: 4,
      comment: "Ambiente cómodo según señales públicas; recomendable confirmar disponibilidad en hora pico.",
      date: "2026-04-20",
    },
    {
      id: "china-weng-seed-3",
      author: "Reseña inicial",
      rating: 4,
      comment: "Experiencia consistente para compartir en familia o con amigos.",
      date: "2026-04-16",
    },
  ],
};
