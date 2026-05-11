import type { Restaurant } from "@/types/restaurant";

const slug = "casa-pinar" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=6755211983131679936&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/casa_pinar_/"
 * Referencias: ["https://www.google.com/maps/place/Restaurante+Casa+Pinar+steak+and+grill/@14.5796146,-87.8432497,17z/data=!3m1!4b1!4m6!3m5!1s0x8f659561021adb87:0x5dbf55820d069cc0!8m2!3d14.5796094!4d-87.8406748!16s%2Fg%2F11pd2ty_lp?entry=tts&g_ep=EgoyMDI2MDQyMC4wIPu8ASoASAFQAw%3D%3D&skid=00568dc9-2df4-46d6-894c-04eeade5d964","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=6755211983131679936&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantCasaPinar: Restaurant = {
  identity: {
    name: "Restaurante Casa Pinar steak and grill",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: true,
  },
  copy: {
    summary:
      "Casa Pinar (steak and grill) en Siguatepeque; parrilla y cortes en espacio amplio para grupo o familia.",
  },
  location: {
    address: "Carretera CA5 Una cuadra adelante de, mecanizaciones altiplano, Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.5796094, lng: -87.8406748 },
  },
  contact: {
    phone: "+504 9432-2346",
    whatsapp: "+504 9432-2346",
  },
  hours: {
    scheduleLabel: "Monday: 11:00 AM – 9:00 PM · Tuesday: 11:00 AM – 9:00 PM · Wednesday: 11:00 AM – 9:00 PM · Thursday: 11:00 AM – 9:00 PM · Friday: 11:00 AM – 9:00 PM · Saturday: 11:00 AM – 9:00 PM · Sunday: 11:00 AM – 9:00 PM",
    structured: [{"day":"Lunes","open":"11:00 AM","close":"9:00 PM"},{"day":"Martes","open":"11:00 AM","close":"9:00 PM"},{"day":"Miércoles","open":"11:00 AM","close":"9:00 PM"},{"day":"Jueves","open":"11:00 AM","close":"9:00 PM"},{"day":"Viernes","open":"11:00 AM","close":"9:00 PM"},{"day":"Sábado","open":"11:00 AM","close":"9:00 PM"},{"day":"Domingo","open":"11:00 AM","close":"9:00 PM"}],
  },
  media: {
    hero: "/restaurants/casa-pinar/hero.jpg",
    gallery: ["/restaurants/casa-pinar/gallery-1.jpg","/restaurants/casa-pinar/gallery-2.jpg","/restaurants/casa-pinar/gallery-3.jpg","/restaurants/casa-pinar/gallery-4.jpg","/restaurants/casa-pinar/gallery-5.jpg","/restaurants/casa-pinar/gallery-6.jpg","/restaurants/casa-pinar/gallery-7.jpg","/restaurants/casa-pinar/gallery-8.jpg","/restaurants/casa-pinar/gallery-9.jpg","/restaurants/casa-pinar/gallery-10.jpg"],
  },
  ratings: {
    average: 4.4,
    reviewsCount: 192,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [],
};
