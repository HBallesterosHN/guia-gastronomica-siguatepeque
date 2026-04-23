import type { Restaurant } from "@/types/restaurant";

const slug = "el-de-arriba" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://www.google.com/maps/place/El+de+Arriba/@14.5913304,-87.8345257,16.16z/data=!4m6!3m5!1s0x8f65953653b777af:0x77071c87c857a32b!8m2!3d14.5943256!4d-87.8315634!16s%2Fg%2F11m_mrnwmk?entry=tts&g_ep=EgoyMDI2MDQxMy4wIPu8ASoASAFQAw%3D%3D&skid=fdb27871-214b-4a88-8a57-16f23885cb5a"
 * Instagram: "https://www.instagram.com/eldearriba_hn/"
 * Referencias: ["https://www.google.com/maps/place/El+de+Arriba/@14.5913304,-87.8345257,16.16z/data=!4m6!3m5!1s0x8f65953653b777af:0x77071c87c857a32b!8m2!3d14.5943256!4d-87.8315634!16s%2Fg%2F11m_mrnwmk?entry=tts&g_ep=EgoyMDI2MDQxMy4wIPu8ASoASAFQAw%3D%3D&skid=fdb27871-214b-4a88-8a57-16f23885cb5a","https://www.instagram.com/eldearriba_hn/","https://nominatim.openstreetmap.org/reverse"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[cli, confianza alta]: https://www.google.com/maps/place/El+de+Arriba/@14.5913304,-87.8345257,16.16z/data=!4m6!3m5!1s0x8f65953653b777af:0x77071c87c857a32b!8m2!3d14.5943256!4d-87.8315634!16s%2Fg%2F11m_mrnwmk?entry=tts&g_ep=EgoyMDI2MDQxMy4wIPu8ASoASAFQAw%3D%3D&skid=fdb27871-214b-4a88-8a57-16f23885cb5a"
 */
export const restaurantElDeArriba: Restaurant = {
  identity: {
    name: "El de Arriba",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary: "El de Arriba en Siguatepeque, recomendado para salidas familiares y almuerzos sin complicaciones. Borrador enriquecido: revisar datos finales antes de publicar.",
  },
  location: {
    address: "Avenida Francisco Morazán, Siguatepeque, Comayagua, 12111, Honduras",
    coordinates: { lat: 14.5943256, lng: -87.8315634 },
  },
  contact: {
    phone: "Por confirmar",
    whatsapp: "Por confirmar",
  },
  hours: {
    scheduleLabel: "Horario por confirmar.",
  },
  media: {
    hero: "/restaurants/el-de-arriba/hero.jpg",
    gallery: [],
  },
  ratings: {
    average: 0,
    reviewsCount: 0,
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
      comment: "Borrador neutral mientras se agregan reseñas verificadas de clientes.",
      date: "2026-04-16",
    },
  ],
};
