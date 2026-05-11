import type { Restaurant } from "@/types/restaurant";

const slug = "sigua-coffee" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=10305028382395643012&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/siguacoffee/"
 * Referencias: ["https://nominatim.openstreetmap.org/search","https://www.google.com/maps/place/Sigua+Coffee/@14.5856896,-87.8524647,17z/data=!3m1!4b1!4m6!3m5!1s0x8f659589497dfb81:0x8f02d0b72502b484!8m2!3d14.5856844!4d-87.8498898!16s%2Fg%2F11b7gsw5r0?entry=tts&g_ep=EgoyMDI2MDQxMy4wIPu8ASoASAFQAw%3D%3D&skid=bdae085d-ee8f-44fa-bd5a-ce83c9b9d447","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=10305028382395643012&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantSiguaCoffee: Restaurant = {
  identity: {
    name: "Sigua Coffee",
    slug,
  },
  classification: {
    category: "cafe",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary: "Sigua Coffee en Siguatepeque, opción agradable para café y conversación tranquila; con datos de contacto u horario parcialmente verificados.",
  },
  location: {
    address: "H5P2+72H, CA-5, Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.585684400000002, lng: -87.8498898 },
  },
  contact: {
    phone: "+504 2773-0935",
    whatsapp: "+504 2773-0935",
  },
  hours: {
    scheduleLabel: "Monday: 7:00 AM – 8:00 PM · Tuesday: 7:00 AM – 8:00 PM · Wednesday: 7:00 AM – 8:00 PM · Thursday: 7:00 AM – 8:00 PM · Friday: 7:00 AM – 8:00 PM · Saturday: 7:00 AM – 8:00 PM · Sunday: 7:00 AM – 8:00 PM",
    structured: [{"day":"Lunes","open":"7:00 AM","close":"8:00 PM"},{"day":"Martes","open":"7:00 AM","close":"8:00 PM"},{"day":"Miercoles","open":"7:00 AM","close":"8:00 PM"},{"day":"Jueves","open":"7:00 AM","close":"8:00 PM"},{"day":"Viernes","open":"7:00 AM","close":"8:00 PM"},{"day":"Sabado","open":"7:00 AM","close":"8:00 PM"},{"day":"Domingo","open":"7:00 AM","close":"8:00 PM"}],
  },
  media: {
    hero: "/restaurants/sigua-coffee/hero.jpg",
    gallery: ["/restaurants/sigua-coffee/gallery-1.jpg","/restaurants/sigua-coffee/gallery-2.jpg","/restaurants/sigua-coffee/gallery-3.jpg","/restaurants/sigua-coffee/gallery-4.jpg","/restaurants/sigua-coffee/gallery-5.jpg","/restaurants/sigua-coffee/gallery-6.jpg","/restaurants/sigua-coffee/gallery-7.jpg","/restaurants/sigua-coffee/gallery-8.jpg","/restaurants/sigua-coffee/gallery-9.jpg","/restaurants/sigua-coffee/gallery-10.jpg"],
  },
  ratings: {
    average: 4.3,
    reviewsCount: 1413,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [
    {
      id: "sigua-coffee-seed-1",
      author: "Reseña inicial",
      rating: 4,
      comment: "Primera impresión positiva; vale la pena validar menú y horarios en sitio.",
      date: "2026-04-23",
    },
    {
      id: "sigua-coffee-seed-2",
      author: "Reseña inicial",
      rating: 4,
      comment: "Ambiente cómodo según señales públicas; recomendable confirmar disponibilidad en hora pico.",
      date: "2026-04-20",
    },
    {
      id: "sigua-coffee-seed-3",
      author: "Reseña inicial",
      rating: 4,
      comment: "Experiencia consistente para compartir en familia o con amigos.",
      date: "2026-04-16",
    },
  ],
};
