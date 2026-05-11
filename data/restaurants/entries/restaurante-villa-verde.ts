import type { Restaurant } from "@/types/restaurant";

const slug = "restaurante-villa-verde" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=3258148327697050767&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/villa.verde_km122/"
 * Referencias: ["https://www.google.com/maps/place/Restaurante+T%C3%ADpico+Villa+Verde/@14.6119223,-87.8914366,17z/data=!3m1!4b1!4m6!3m5!1s0x8f65bfaf2ee51895:0x2d3744a441ea6c8f!8m2!3d14.6119171!4d-87.8888617!16s%2Fg%2F11c5868n3f?entry=tts&g_ep=EgoyMDI2MDQyMS4wIPu8ASoASAFQAw%3D%3D&skid=17f21ac2-9e6a-4ada-8682-4e292c43d725","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=3258148327697050767&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantRestauranteVillaVerde: Restaurant = {
  identity: {
    name: "Restaurante Típico Villa Verde",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: true,
  },
  copy: {
    summary: "Restaurante Típico Villa Verde en Siguatepeque, recomendado para salidas familiares y almuerzos sin complicaciones.",
  },
  location: {
    address: "12111 El Socorro, Comayagua, Honduras",
    coordinates: { lat: 14.6119171, lng: -87.88886169999999 },
  },
  contact: {
    phone: "+504 9368-0825",
    whatsapp: "+504 9368-0825",
  },
  hours: {
    scheduleLabel: "Monday: 6:00 AM – 4:00 PM · Tuesday: 6:00 AM – 4:00 PM · Wednesday: 6:00 AM – 4:00 PM · Thursday: 6:00 AM – 4:00 PM · Friday: 6:00 AM – 4:00 PM · Saturday: 6:00 AM – 4:00 PM · Sunday: 6:00 AM – 4:00 PM",
    structured: [{"day":"Lunes","open":"6:00 AM","close":"4:00 PM"},{"day":"Martes","open":"6:00 AM","close":"4:00 PM"},{"day":"Miercoles","open":"6:00 AM","close":"4:00 PM"},{"day":"Jueves","open":"6:00 AM","close":"4:00 PM"},{"day":"Viernes","open":"6:00 AM","close":"4:00 PM"},{"day":"Sabado","open":"6:00 AM","close":"4:00 PM"},{"day":"Domingo","open":"6:00 AM","close":"4:00 PM"}],
  },
  media: {
    hero: "/restaurants/restaurante-villa-verde/hero.jpg",
    gallery: ["/restaurants/restaurante-villa-verde/gallery-1.jpg","/restaurants/restaurante-villa-verde/gallery-2.jpg","/restaurants/restaurante-villa-verde/gallery-3.jpg","/restaurants/restaurante-villa-verde/gallery-4.jpg","/restaurants/restaurante-villa-verde/gallery-5.jpg","/restaurants/restaurante-villa-verde/gallery-6.jpg","/restaurants/restaurante-villa-verde/gallery-7.jpg","/restaurants/restaurante-villa-verde/gallery-8.jpg","/restaurants/restaurante-villa-verde/gallery-9.jpg","/restaurants/restaurante-villa-verde/gallery-10.jpg"],
  },
  ratings: {
    average: 4.6,
    reviewsCount: 1742,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [],
};
