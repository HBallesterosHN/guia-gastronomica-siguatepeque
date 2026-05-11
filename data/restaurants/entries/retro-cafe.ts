import type { Restaurant } from "@/types/restaurant";

const slug = "retro-cafe" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=608811554100346294&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/retrocafehn/"
 * Referencias: ["https://www.google.com/maps/place/Retro+Cafe/@14.6024618,-87.8329951,17z/data=!3m1!4b1!4m6!3m5!1s0x8f659509ff56432d:0x872eee2014dfdb6!8m2!3d14.6024566!4d-87.8304202!16s%2Fg%2F11gbw5v_s4?entry=tts&g_ep=EgoyMDI2MDQyMC4wIPu8ASoASAFQAw%3D%3D&skid=ff4b7e8e-4e8a-49a2-8869-00d50f4fc277","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=608811554100346294&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantRetroCafe: Restaurant = {
  identity: {
    name: "Retro Coffee",
    slug,
  },
  classification: {
    category: "cafe",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary:
      "Retro Coffee en Siguatepeque; café y espacio cómodo para trabajo ligero o plática sin prisa.",
  },
  location: {
    address: "11001 Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.602456599999998, lng: -87.83042019999999 },
  },
  contact: {
    phone: "+504 9633-4168",
    whatsapp: "+504 9633-4168",
  },
  hours: {
    scheduleLabel: "Monday: 7:00 AM – 8:00 PM · Tuesday: 7:00 AM – 8:00 PM · Wednesday: 7:00 AM – 8:00 PM · Thursday: 7:00 AM – 8:00 PM · Friday: 7:00 AM – 8:00 PM · Saturday: 7:00 AM – 8:00 PM · Sunday: 1:30 – 6:00 PM",
    structured: [{"day":"Lunes","open":"7:00 AM","close":"8:00 PM"},{"day":"Martes","open":"7:00 AM","close":"8:00 PM"},{"day":"Miércoles","open":"7:00 AM","close":"8:00 PM"},{"day":"Jueves","open":"7:00 AM","close":"8:00 PM"},{"day":"Viernes","open":"7:00 AM","close":"8:00 PM"},{"day":"Sábado","open":"7:00 AM","close":"8:00 PM"},{"day":"Domingo","open":"1:30","close":"6:00 PM"}],
  },
  media: {
    hero: "/restaurants/retro-cafe/hero.jpg",
    gallery: ["/restaurants/retro-cafe/gallery-1.jpg","/restaurants/retro-cafe/gallery-2.jpg","/restaurants/retro-cafe/gallery-3.jpg","/restaurants/retro-cafe/gallery-4.jpg","/restaurants/retro-cafe/gallery-5.jpg","/restaurants/retro-cafe/gallery-6.jpg","/restaurants/retro-cafe/gallery-7.jpg","/restaurants/retro-cafe/gallery-8.jpg","/restaurants/retro-cafe/gallery-9.jpg"],
  },
  ratings: {
    average: 4.6,
    reviewsCount: 352,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [
    {
      id: "retro-cafe-seed-1",
      author: "Reseña inicial",
      rating: 4,
      comment: "Primera impresión positiva; vale la pena validar menú y horarios en sitio.",
      date: "2026-04-23",
    },
    {
      id: "retro-cafe-seed-2",
      author: "Reseña inicial",
      rating: 4,
      comment: "Ambiente cómodo según señales públicas; recomendable confirmar disponibilidad en hora pico.",
      date: "2026-04-20",
    },
    {
      id: "retro-cafe-seed-3",
      author: "Reseña inicial",
      rating: 4,
      comment: "Experiencia consistente para compartir en familia o con amigos.",
      date: "2026-04-16",
    },
  ],
};
