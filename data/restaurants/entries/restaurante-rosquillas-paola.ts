import type { Restaurant } from "@/types/restaurant";

const slug = "restaurante-rosquillas-paola" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=13585134709104298453&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/restaurantepaola/"
 * Referencias: ["https://www.google.com/maps/place/Restaurante+y+rosquilleria+Paola/@14.6204408,-87.9056001,17z/data=!3m1!4b1!4m6!3m5!1s0x8f65bf0c26d99645:0xbc88180a71fdc9d5!8m2!3d14.6204357!4d-87.9007292!16s%2Fg%2F11fx7wtdtd?entry=tts&g_ep=EgoyMDI2MDQyMS4wIPu8ASoASAFQAw%3D%3D&skid=9a4c9155-fba0-47b4-ab3a-5865c339c142","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=13585134709104298453&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantRestauranteRosquillasPaola: Restaurant = {
  identity: {
    name: "Restaurante y rosquilleria Paola",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary:
      "Restaurante y rosquillería Paola sobre la CA-5; caldos, carne y mesa de carretera con sabor a hogar.",
  },
  location: {
    address: "J3CX+5PC, El Socorro, Comayagua, Honduras",
    coordinates: { lat: 14.6204357, lng: -87.9007292 },
  },
  contact: {
    phone: "+504 9576-9360",
    whatsapp: "+504 9576-9360",
  },
  hours: {
    scheduleLabel: "Monday: 7:00 AM – 5:30 PM · Tuesday: 7:00 AM – 5:30 PM · Wednesday: 7:00 AM – 5:30 PM · Thursday: 7:00 AM – 5:30 PM · Friday: 7:00 AM – 5:30 PM · Saturday: 7:00 AM – 5:30 PM · Sunday: 7:00 AM – 5:30 PM",
    structured: [{"day":"Lunes","open":"7:00 AM","close":"5:30 PM"},{"day":"Martes","open":"7:00 AM","close":"5:30 PM"},{"day":"Miércoles","open":"7:00 AM","close":"5:30 PM"},{"day":"Jueves","open":"7:00 AM","close":"5:30 PM"},{"day":"Viernes","open":"7:00 AM","close":"5:30 PM"},{"day":"Sábado","open":"7:00 AM","close":"5:30 PM"},{"day":"Domingo","open":"7:00 AM","close":"5:30 PM"}],
  },
  media: {
    hero: "/restaurants/restaurante-rosquillas-paola/hero.jpg",
    gallery: ["/restaurants/restaurante-rosquillas-paola/gallery-1.jpg","/restaurants/restaurante-rosquillas-paola/gallery-2.jpg","/restaurants/restaurante-rosquillas-paola/gallery-3.jpg","/restaurants/restaurante-rosquillas-paola/gallery-4.jpg","/restaurants/restaurante-rosquillas-paola/gallery-5.jpg","/restaurants/restaurante-rosquillas-paola/gallery-6.jpg","/restaurants/restaurante-rosquillas-paola/gallery-7.jpg","/restaurants/restaurante-rosquillas-paola/gallery-8.jpg","/restaurants/restaurante-rosquillas-paola/gallery-9.jpg","/restaurants/restaurante-rosquillas-paola/gallery-10.jpg"],
  },
  ratings: {
    average: 4.5,
    reviewsCount: 266,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [],
};
