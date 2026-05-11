import type { Restaurant } from "@/types/restaurant";

const slug = "savoy-cafe-x301" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=5012477845457449694&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/savoy.hn/"
 * Referencias: ["https://www.google.com/maps/place/Savoy+Caf%C3%A9/@14.5867752,-87.8540353,17z/data=!3m1!4b1!4m6!3m5!1s0x8f6595891167f2bf:0x458fe60b0f01b2de!8m2!3d14.58677!4d-87.8514604!16s%2Fg%2F11csqjydsj?entry=tts&g_ep=EgoyMDI2MDQxMy4wIPu8ASoASAFQAw%3D%3D&skid=7da1a1f6-4d95-473f-b96c-f254931135bb","https://www.instagram.com/savoy.hn/","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=5012477845457449694&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantSavoyCafeX301: Restaurant = {
  identity: {
    name: "Savoy Cafe",
    slug,
  },
  classification: {
    category: "cafe",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary:
      "Savoy Café (SPS 301) en Siguatepeque; desayunos extendidos y café para salir temprano o reunirse un rato.",
  },
  location: {
    address: "H4PX+PC3, CA-5, Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.586770000000001, lng: -87.8514604 },
  },
  contact: {
    phone: "+504 2773-2861",
    whatsapp: "+504 2773-2861",
  },
  hours: {
    scheduleLabel: "Monday: 8:00 AM – 7:00 PM · Tuesday: 7:00 AM – 7:00 PM · Wednesday: 7:00 AM – 7:00 PM · Thursday: 7:00 AM – 7:00 PM · Friday: 7:00 AM – 7:00 PM · Saturday: 7:00 AM – 7:00 PM · Sunday: 7:00 AM – 7:00 PM",
    structured: [{"day":"Lunes","open":"8:00 AM","close":"7:00 PM"},{"day":"Martes","open":"7:00 AM","close":"7:00 PM"},{"day":"Miércoles","open":"7:00 AM","close":"7:00 PM"},{"day":"Jueves","open":"7:00 AM","close":"7:00 PM"},{"day":"Viernes","open":"7:00 AM","close":"7:00 PM"},{"day":"Sábado","open":"7:00 AM","close":"7:00 PM"},{"day":"Domingo","open":"7:00 AM","close":"7:00 PM"}],
  },
  media: {
    hero: "/restaurants/savoy-cafe-x301/hero.jpg",
    featured: ["/restaurants/savoy-cafe-x301/gallery-1.jpg","/restaurants/savoy-cafe-x301/gallery-2.jpg","/restaurants/savoy-cafe-x301/gallery-3.jpg"],
    place: ["/restaurants/savoy-cafe-x301/gallery-4.jpg"],
  },
  ratings: {
    average: 4.6,
    reviewsCount: 1770,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [
    {
      id: "savoy-cafe-x301-seed-1",
      author: "Reseña inicial",
      rating: 4,
      comment: "Primera impresión positiva; vale la pena validar menú y horarios en sitio.",
      date: "2026-04-23",
    },
    {
      id: "savoy-cafe-x301-seed-2",
      author: "Reseña inicial",
      rating: 4,
      comment: "Ambiente cómodo según señales públicas; recomendable confirmar disponibilidad en hora pico.",
      date: "2026-04-20",
    },
    {
      id: "savoy-cafe-x301-seed-3",
      author: "Reseña inicial",
      rating: 4,
      comment: "Experiencia consistente para compartir en familia o con amigos.",
      date: "2026-04-16",
    },
  ],
};
