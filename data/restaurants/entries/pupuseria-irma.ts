import type { Restaurant } from "@/types/restaurant";

const slug = "pupuseria-irma" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=4727509365835363401&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/pupuseriairma/"
 * Referencias: ["https://www.google.com/maps/place/Pupuseria+Irma/@14.5827164,-87.8376878,17z/data=!3m1!4b1!4m6!3m5!1s0x8f6595184644f859:0x419b7cb886f2f449!8m2!3d14.5827112!4d-87.8351129!16s%2Fg%2F11fwxqkpr0?entry=tts&g_ep=EgoyMDI2MDQxMy4wIPu8ASoASAFQAw%3D%3D&skid=95e339bb-eb12-45e9-a38e-2a5aca467d9e","https://www.instagram.com/pupuseriairma/","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=4727509365835363401&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantPupuseriaIrma: Restaurant = {
  identity: {
    name: "Pupuseria Irma",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary:
      "Pupusería Irma en Siguatepeque; pupusas y platillos rápidos, prácticos para llevar o cenar sin complicación.",
  },
  location: {
    address: "esquina opuesta a, Supermercado Maxi Despensa, 12111 Boulevard Morazán, 12111 Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.582711199999999, lng: -87.8351129 },
  },
  contact: {
    phone: "+504 9762-0647",
    whatsapp: "+504 9762-0647",
  },
  hours: {
    scheduleLabel: "Monday: 8:00 AM – 10:00 PM · Tuesday: 8:00 AM – 10:00 PM · Wednesday: 8:00 AM – 10:00 PM · Thursday: 8:00 AM – 10:00 PM · Friday: 8:00 AM – 10:00 PM · Saturday: 8:00 AM – 10:00 PM · Sunday: 8:00 AM – 10:00 PM",
    structured: [{"day":"Lunes","open":"8:00 AM","close":"10:00 PM"},{"day":"Martes","open":"8:00 AM","close":"10:00 PM"},{"day":"Miércoles","open":"8:00 AM","close":"10:00 PM"},{"day":"Jueves","open":"8:00 AM","close":"10:00 PM"},{"day":"Viernes","open":"8:00 AM","close":"10:00 PM"},{"day":"Sábado","open":"8:00 AM","close":"10:00 PM"},{"day":"Domingo","open":"8:00 AM","close":"10:00 PM"}],
  },
  media: {
    hero: "/restaurants/pupuseria-irma/hero.jpg",
    featured: ["/restaurants/pupuseria-irma/gallery-1.jpg","/restaurants/pupuseria-irma/gallery-2.jpg","/restaurants/pupuseria-irma/gallery-3.jpg","/restaurants/pupuseria-irma/gallery-4.jpg"],
    place: ["/restaurants/pupuseria-irma/gallery-5.jpg","/restaurants/pupuseria-irma/gallery-6.jpg","/restaurants/pupuseria-irma/gallery-7.jpg","/restaurants/pupuseria-irma/gallery-8.jpg","/restaurants/pupuseria-irma/gallery-9.jpg"],
  },
  ratings: {
    average: 4.3,
    reviewsCount: 147,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [
    {
      id: "pupuseria-irma-seed-1",
      author: "Reseña inicial",
      rating: 4,
      comment: "Primera impresión positiva; vale la pena validar menú y horarios en sitio.",
      date: "2026-04-23",
    },
    {
      id: "pupuseria-irma-seed-2",
      author: "Reseña inicial",
      rating: 4,
      comment: "Ambiente cómodo según señales públicas; recomendable confirmar disponibilidad en hora pico.",
      date: "2026-04-20",
    },
    {
      id: "pupuseria-irma-seed-3",
      author: "Reseña inicial",
      rating: 4,
      comment: "Experiencia consistente para compartir en familia o con amigos.",
      date: "2026-04-16",
    },
  ],
};
