import type { Restaurant } from "@/types/restaurant";

const slug = "el-de-arriba" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=8576855384857748267&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/eldearriba_hn/"
 * Referencias: ["https://www.google.com/maps/place/El+de+Arriba/@14.5913304,-87.8345257,16.16z/data=!4m6!3m5!1s0x8f65953653b777af:0x77071c87c857a32b!8m2!3d14.5943256!4d-87.8315634!16s%2Fg%2F11m_mrnwmk?entry=tts&g_ep=EgoyMDI2MDQxMy4wIPu8ASoASAFQAw%3D%3D&skid=fdb27871-214b-4a88-8a57-16f23885cb5a","https://www.instagram.com/eldearriba_hn/","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=8576855384857748267&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantElDeArriba: Restaurant = {
  identity: {
    name: "El de Arriba",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: true,
  },
  copy: {
    summary: "El de Arriba en Siguatepeque, recomendado para salidas familiares y almuerzos sin complicaciones. Ideal para disfrutar una visita en Siguatepeque.",
  },
  location: {
    address: "Barrio abajo 3ra calle 1 avenida 2 nivel supermercados del corral, 12111 Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.594325600000001, lng: -87.8315634 },
  },
  contact: {
    phone: "+504 3326-9939",
    whatsapp: "+504 3326-9939",
  },
  hours: {
    scheduleLabel: "Monday: 11:30 AM – 9:00 PM · Tuesday: 11:30 AM – 9:00 PM · Wednesday: 11:30 AM – 9:00 PM · Thursday: 11:30 AM – 9:00 PM · Friday: 11:30 AM – 10:00 PM · Saturday: 11:30 AM – 10:00 PM · Sunday: 11:30 AM – 9:00 PM",
    structured: [{"day":"Lunes","open":"11:30 AM","close":"9:00 PM"},{"day":"Martes","open":"11:30 AM","close":"9:00 PM"},{"day":"Miercoles","open":"11:30 AM","close":"9:00 PM"},{"day":"Jueves","open":"11:30 AM","close":"9:00 PM"},{"day":"Viernes","open":"11:30 AM","close":"10:00 PM"},{"day":"Sabado","open":"11:30 AM","close":"10:00 PM"},{"day":"Domingo","open":"11:30 AM","close":"9:00 PM"}],
  },
  media: {
    hero: "/restaurants/el-de-arriba/hero.jpg",
    featured: ["/restaurants/el-de-arriba/gallery-1.jpg","/restaurants/el-de-arriba/gallery-2.jpg","/restaurants/el-de-arriba/gallery-3.jpg"],
    place: ["/restaurants/el-de-arriba/gallery-4.jpg"],
  },
  ratings: {
    average: 4.5,
    reviewsCount: 525,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [
    {
      id: "el-de-arriba-seed-1",
      author: "Reseña inicial",
      rating: 4,
      comment: "Primera impresión positiva; vale la pena validar menú y horarios en sitio.",
      date: "2026-04-23",
    },
    {
      id: "el-de-arriba-seed-2",
      author: "Reseña inicial",
      rating: 4,
      comment: "Ambiente cómodo según señales públicas; recomendable confirmar disponibilidad en hora pico.",
      date: "2026-04-20",
    },
    {
      id: "el-de-arriba-seed-3",
      author: "Reseña inicial",
      rating: 4,
      comment: "Experiencia consistente para compartir en familia o con amigos.",
      date: "2026-04-16",
    },
  ],
};
