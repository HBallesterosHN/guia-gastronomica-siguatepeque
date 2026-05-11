import type { Restaurant } from "@/types/restaurant";

const slug = "el-torito-steak-house" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=3126330033276556367&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/eltorito_steakhouse/"
 * Referencias: ["https://www.google.com/maps/place/El+Torito+Steak+House+Siguatepeque/@14.5825019,-87.8486708,17z/data=!3m1!4b1!4m6!3m5!1s0x8f65950616c26597:0x2b62f499ec15944f!8m2!3d14.5824967!4d-87.8460959!16s%2Fg%2F11j8hjpx0_?entry=tts&g_ep=EgoyMDI2MDQyMS4wIPu8ASoASAFQAw%3D%3D&skid=39a8b8db-0426-44be-ab64-b3769939d9da","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=3126330033276556367&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantElToritoSteakHouse: Restaurant = {
  identity: {
    name: "El Torito Steak House Siguatepeque",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary: "El Torito Steak House Siguatepeque en Siguatepeque, recomendado para salidas familiares y almuerzos sin complicaciones.",
  },
  location: {
    address: "Esquina opuesta a Wendy's, CA-5, 12111 Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.5824967, lng: -87.8460959 },
  },
  contact: {
    phone: "+504 2773-3500",
    whatsapp: "+504 2773-3500",
  },
  hours: {
    scheduleLabel: "Monday: 11:30 AM – 9:00 PM · Tuesday: 11:30 AM – 9:00 PM · Wednesday: 11:30 AM – 9:00 PM · Thursday: 11:30 AM – 9:00 PM · Friday: 11:30 AM – 9:00 PM · Saturday: 11:30 AM – 9:00 PM · Sunday: 11:30 AM – 8:00 PM",
    structured: [{"day":"Lunes","open":"11:30 AM","close":"9:00 PM"},{"day":"Martes","open":"11:30 AM","close":"9:00 PM"},{"day":"Miercoles","open":"11:30 AM","close":"9:00 PM"},{"day":"Jueves","open":"11:30 AM","close":"9:00 PM"},{"day":"Viernes","open":"11:30 AM","close":"9:00 PM"},{"day":"Sabado","open":"11:30 AM","close":"9:00 PM"},{"day":"Domingo","open":"11:30 AM","close":"8:00 PM"}],
  },
  media: {
    hero: "/restaurants/el-torito-steak-house/hero.jpg",
    gallery: ["/restaurants/el-torito-steak-house/gallery-1.jpg","/restaurants/el-torito-steak-house/gallery-2.jpg","/restaurants/el-torito-steak-house/gallery-3.jpg","/restaurants/el-torito-steak-house/gallery-4.jpg","/restaurants/el-torito-steak-house/gallery-5.jpg","/restaurants/el-torito-steak-house/gallery-6.jpg","/restaurants/el-torito-steak-house/gallery-7.jpg","/restaurants/el-torito-steak-house/gallery-8.jpg","/restaurants/el-torito-steak-house/gallery-9.jpg","/restaurants/el-torito-steak-house/gallery-10.jpg"],
  },
  ratings: {
    average: 4.6,
    reviewsCount: 580,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [],
};
