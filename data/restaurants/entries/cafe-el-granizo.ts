import type { Restaurant } from "@/types/restaurant";

const slug = "cafe-el-granizo" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=4885122439369978940&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/dycfincaelgranizo/"
 * Referencias: ["https://www.google.com/maps/place/D%26C+Coffee+Roasters/@14.5967618,-87.8316326,17z/data=!4m6!3m5!1s0x8f6595ba0ba2d3e1:0x43cb70f9e2eff43c!8m2!3d14.5972521!4d-87.8281555!16s%2Fg%2F11fcqlbj10?entry=tts&g_ep=EgoyMDI2MDQyMC4wIPu8ASoASAFQAw%3D%3D&skid=f44b3e13-d560-42e2-b6e1-0031e2d64976","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=4885122439369978940&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantCafeElGranizo: Restaurant = {
  identity: {
    name: "D&C Coffee Roasters",
    slug,
  },
  classification: {
    category: "cafe",
    priceRange: "$$",
    featured: true,
  },
  copy: {
    summary:
      "D&C Coffee Roasters (Café El Granizo) en Siguatepeque; tueste local y café de especialidad para tomar con tiempo.",
  },
  location: {
    address: "Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.597252099999999, lng: -87.8281555 },
  },
  contact: {
    phone: "+504 3386-5006",
    whatsapp: "+504 3386-5006",
  },
  hours: {
    scheduleLabel: "Monday: 8:00 AM – 7:00 PM · Tuesday: 8:00 AM – 7:00 PM · Wednesday: 8:00 AM – 7:00 PM · Thursday: 8:00 AM – 7:00 PM · Friday: 8:00 AM – 7:00 PM · Saturday: 9:00 AM – 7:00 PM · Sunday: Closed",
    structured: [{"day":"Lunes","open":"8:00 AM","close":"7:00 PM"},{"day":"Martes","open":"8:00 AM","close":"7:00 PM"},{"day":"Miércoles","open":"8:00 AM","close":"7:00 PM"},{"day":"Jueves","open":"8:00 AM","close":"7:00 PM"},{"day":"Viernes","open":"8:00 AM","close":"7:00 PM"},{"day":"Sábado","open":"9:00 AM","close":"7:00 PM"},{"day":"Domingo","open":"Closed","close":"Closed"}],
  },
  media: {
    hero: "/restaurants/cafe-el-granizo/hero.jpg",
    gallery: ["/restaurants/cafe-el-granizo/gallery-1.jpg","/restaurants/cafe-el-granizo/gallery-2.jpg","/restaurants/cafe-el-granizo/gallery-3.jpg","/restaurants/cafe-el-granizo/gallery-4.jpg","/restaurants/cafe-el-granizo/gallery-5.jpg","/restaurants/cafe-el-granizo/gallery-6.jpg","/restaurants/cafe-el-granizo/gallery-7.jpg","/restaurants/cafe-el-granizo/gallery-8.jpg","/restaurants/cafe-el-granizo/gallery-9.jpg"],
  },
  ratings: {
    average: 4.6,
    reviewsCount: 74,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [
    {
      id: "cafe-el-granizo-seed-1",
      author: "Reseña inicial",
      rating: 4,
      comment: "Primera impresión positiva; vale la pena validar menú y horarios en sitio.",
      date: "2026-04-23",
    },
    {
      id: "cafe-el-granizo-seed-2",
      author: "Reseña inicial",
      rating: 4,
      comment: "Ambiente cómodo según señales públicas; recomendable confirmar disponibilidad en hora pico.",
      date: "2026-04-20",
    },
    {
      id: "cafe-el-granizo-seed-3",
      author: "Reseña inicial",
      rating: 4,
      comment: "Experiencia consistente para compartir en familia o con amigos.",
      date: "2026-04-16",
    },
  ],
};
