import type { Restaurant } from "@/types/restaurant";

const slug = "camping-el-ovejo" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=17731582110262307700&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "Por confirmar"
 * Referencias: ["https://www.google.com/maps/place/Camping+El+Ovejo/@14.5465797,-87.8315856,17z/data=!3m1!4b1!4m6!3m5!1s0x8f6597352e86d471:0xf6133bfbbbdb2b74!8m2!3d14.5465745!4d-87.8290107!16s%2Fg%2F11p5fr00g7?entry=tts&g_ep=EgoyMDI2MDQxMy4wIPu8ASoASAFQAw%3D%3D&skid=c34e27e9-38d5-4a79-8884-f27783a361f5","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=17731582110262307700&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantCampingElOvejo: Restaurant = {
  identity: {
    name: "Camping El Ovejo",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary: "Camping El Ovejo en Siguatepeque, opción cómoda para comer en plan familiar; con datos de contacto u horario parcialmente verificados.",
  },
  location: {
    address: "Aldea San Isidro, G5WC+J9H, Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.5465745, lng: -87.8290107 },
  },
  contact: {
    phone: "+504 9751-0980",
    whatsapp: "+504 9751-0980",
  },
  hours: {
    scheduleLabel: "Monday: Closed · Tuesday: 12:30 – 7:30 PM · Wednesday: 12:30 – 7:30 PM · Thursday: 8:00 AM – 7:30 PM · Friday: 8:00 AM – 7:30 PM · Saturday: 8:00 AM – 8:00 PM · Sunday: 8:00 AM – 8:00 PM",
    structured: [{"day":"Lunes","open":"Closed","close":"Closed"},{"day":"Martes","open":"12:30","close":"7:30 PM"},{"day":"Miercoles","open":"12:30","close":"7:30 PM"},{"day":"Jueves","open":"8:00 AM","close":"7:30 PM"},{"day":"Viernes","open":"8:00 AM","close":"7:30 PM"},{"day":"Sabado","open":"8:00 AM","close":"8:00 PM"},{"day":"Domingo","open":"8:00 AM","close":"8:00 PM"}],
  },
  media: {
    hero: "/restaurants/camping-el-ovejo/hero.jpg",
    featured: ["/restaurants/camping-el-ovejo/gallery-1.jpg","/restaurants/camping-el-ovejo/gallery-2.jpg","/restaurants/camping-el-ovejo/gallery-3.jpg","/restaurants/camping-el-ovejo/gallery-4.jpg"],
    place: ["/restaurants/camping-el-ovejo/gallery-5.jpg","/restaurants/camping-el-ovejo/gallery-6.jpg","/restaurants/camping-el-ovejo/gallery-7.jpg","/restaurants/camping-el-ovejo/gallery-8.jpg","/restaurants/camping-el-ovejo/gallery-9.jpg"],
  },
  ratings: {
    average: 4.7,
    reviewsCount: 169,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [
    {
      id: "camping-el-ovejo-seed-1",
      author: "Reseña inicial",
      rating: 4,
      comment: "Primera impresión positiva; vale la pena validar menú y horarios en sitio.",
      date: "2026-04-23",
    },
    {
      id: "camping-el-ovejo-seed-2",
      author: "Reseña inicial",
      rating: 4,
      comment: "Ambiente cómodo según señales públicas; recomendable confirmar disponibilidad en hora pico.",
      date: "2026-04-20",
    },
    {
      id: "camping-el-ovejo-seed-3",
      author: "Reseña inicial",
      rating: 4,
      comment: "Experiencia consistente para compartir en familia o con amigos.",
      date: "2026-04-16",
    },
  ],
};
