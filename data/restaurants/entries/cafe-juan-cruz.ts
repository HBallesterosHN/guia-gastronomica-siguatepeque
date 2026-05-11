import type { Restaurant } from "@/types/restaurant";

const slug = "cafe-juan-cruz" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=3675960341566051098&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/juancruzcafe/"
 * Referencias: ["https://www.google.com/maps/place/Juan+Cruz+Caf%C3%A9/@14.5779925,-87.8410337,17z/data=!3m1!4b1!4m6!3m5!1s0x8f6595eaba11c539:0x3303a2745f77d31a!8m2!3d14.5779874!4d-87.8361628!16s%2Fg%2F11fy4lp31s?entry=tts&g_ep=EgoyMDI2MDQyMC4wIPu8ASoASAFQAw%3D%3D&skid=9ceba5d2-c2f7-4eaa-9aba-28ae94ffa648","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=3675960341566051098&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantCafeJuanCruz: Restaurant = {
  identity: {
    name: "Juan Cruz Cafe",
    slug,
  },
  classification: {
    category: "cafe",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary: "Juan Cruz Cafe en Siguatepeque, opción agradable para café y conversación tranquila; con datos de contacto u horario parcialmente verificados.",
  },
  location: {
    address: "Barrio Calan 2 nivel de Texaco Cruz, 12111 Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.5779874, lng: -87.83616280000001 },
  },
  contact: {
    phone: "+504 3298-9595",
    whatsapp: "+504 3298-9595",
  },
  hours: {
    scheduleLabel: "Monday: 7:00 AM – 8:00 PM · Tuesday: 7:00 AM – 8:00 PM · Wednesday: 7:00 AM – 8:00 PM · Thursday: 7:00 AM – 8:00 PM · Friday: 7:00 AM – 9:00 PM · Saturday: 7:00 AM – 9:00 PM · Sunday: 7:00 AM – 8:00 PM",
    structured: [{"day":"Lunes","open":"7:00 AM","close":"8:00 PM"},{"day":"Martes","open":"7:00 AM","close":"8:00 PM"},{"day":"Miercoles","open":"7:00 AM","close":"8:00 PM"},{"day":"Jueves","open":"7:00 AM","close":"8:00 PM"},{"day":"Viernes","open":"7:00 AM","close":"9:00 PM"},{"day":"Sabado","open":"7:00 AM","close":"9:00 PM"},{"day":"Domingo","open":"7:00 AM","close":"8:00 PM"}],
  },
  media: {
    hero: "/restaurants/cafe-juan-cruz/hero.jpg",
    gallery: ["/restaurants/cafe-juan-cruz/gallery-1.jpg","/restaurants/cafe-juan-cruz/gallery-2.jpg","/restaurants/cafe-juan-cruz/gallery-3.jpg","/restaurants/cafe-juan-cruz/gallery-4.jpg","/restaurants/cafe-juan-cruz/gallery-5.jpg","/restaurants/cafe-juan-cruz/gallery-6.jpg","/restaurants/cafe-juan-cruz/gallery-7.jpg","/restaurants/cafe-juan-cruz/gallery-8.jpg","/restaurants/cafe-juan-cruz/gallery-9.jpg","/restaurants/cafe-juan-cruz/gallery-10.jpg"],
  },
  ratings: {
    average: 4.6,
    reviewsCount: 999,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [
    {
      id: "cafe-juan-cruz-seed-1",
      author: "Reseña inicial",
      rating: 4,
      comment: "Primera impresión positiva; vale la pena validar menú y horarios en sitio.",
      date: "2026-04-23",
    },
    {
      id: "cafe-juan-cruz-seed-2",
      author: "Reseña inicial",
      rating: 4,
      comment: "Ambiente cómodo según señales públicas; recomendable confirmar disponibilidad en hora pico.",
      date: "2026-04-20",
    },
    {
      id: "cafe-juan-cruz-seed-3",
      author: "Reseña inicial",
      rating: 4,
      comment: "Experiencia consistente para compartir en familia o con amigos.",
      date: "2026-04-16",
    },
  ],
};
