import type { Restaurant } from "@/types/restaurant";

const slug = "golden-grill" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=1735311195002468895&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/goldengrillhn/"
 * Referencias: ["https://www.google.com/maps/place/Golden+Grill+Buffet/@14.5914697,-87.8616192,17z/data=!3m1!4b1!4m6!3m5!1s0x8f65be28bb355033:0x1815105678e17a1f!8m2!3d14.5914645!4d-87.8590443!16s%2Fg%2F11f2wmfhps?entry=tts&g_ep=EgoyMDI2MDQyMC4wIPu8ASoASAFQAw%3D%3D&skid=7570369a-dae8-4f0b-8918-0913b9f73f1a","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=1735311195002468895&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantGoldenGrill: Restaurant = {
  identity: {
    name: "Golden Grill Buffet",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary: "Golden Grill Buffet en Siguatepeque, opción cómoda para comer en plan familiar; con datos de contacto u horario parcialmente verificados.",
  },
  location: {
    address: "H4RR+H9P, Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.591464499999997, lng: -87.8590443 },
  },
  contact: {
    phone: "+504 9687-4474",
    whatsapp: "+504 9687-4474",
  },
  hours: {
    scheduleLabel: "Monday: 6:00 AM – 9:00 PM · Tuesday: 6:00 AM – 9:00 PM · Wednesday: 6:00 AM – 9:00 PM · Thursday: 6:00 AM – 9:00 PM · Friday: 6:00 AM – 9:00 PM · Saturday: 6:00 AM – 9:00 PM · Sunday: 6:00 AM – 9:00 PM",
    structured: [{"day":"Lunes","open":"6:00 AM","close":"9:00 PM"},{"day":"Martes","open":"6:00 AM","close":"9:00 PM"},{"day":"Miercoles","open":"6:00 AM","close":"9:00 PM"},{"day":"Jueves","open":"6:00 AM","close":"9:00 PM"},{"day":"Viernes","open":"6:00 AM","close":"9:00 PM"},{"day":"Sabado","open":"6:00 AM","close":"9:00 PM"},{"day":"Domingo","open":"6:00 AM","close":"9:00 PM"}],
  },
  media: {
    hero: "/restaurants/golden-grill/hero.jpg",
    gallery: ["/restaurants/golden-grill/gallery-1.jpg","/restaurants/golden-grill/gallery-2.jpg","/restaurants/golden-grill/gallery-3.jpg","/restaurants/golden-grill/gallery-4.jpg","/restaurants/golden-grill/gallery-5.jpg","/restaurants/golden-grill/gallery-6.jpg","/restaurants/golden-grill/gallery-7.jpg","/restaurants/golden-grill/gallery-8.jpg","/restaurants/golden-grill/gallery-9.jpg","/restaurants/golden-grill/gallery-10.jpg"],
  },
  ratings: {
    average: 4.2,
    reviewsCount: 1637,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [
    {
      id: "golden-grill-seed-1",
      author: "Reseña inicial",
      rating: 4,
      comment: "Primera impresión positiva; vale la pena validar menú y horarios en sitio.",
      date: "2026-04-23",
    },
    {
      id: "golden-grill-seed-2",
      author: "Reseña inicial",
      rating: 4,
      comment: "Ambiente cómodo según señales públicas; recomendable confirmar disponibilidad en hora pico.",
      date: "2026-04-20",
    },
    {
      id: "golden-grill-seed-3",
      author: "Reseña inicial",
      rating: 4,
      comment: "Experiencia consistente para compartir en familia o con amigos.",
      date: "2026-04-16",
    },
  ],
};
