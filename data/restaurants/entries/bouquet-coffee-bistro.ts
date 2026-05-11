import type { Restaurant } from "@/types/restaurant";

const slug = "bouquet-coffee-bistro" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=16362252536462625594&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/bouquetcoffeebistro/"
 * Referencias: ["https://www.google.com/maps/place/Bouquet+Coffee+%26+Bistro/@14.5824226,-87.8508603,17z/data=!3m1!4b1!4m6!3m5!1s0x8f65951965f0ed93:0xe31265fdb116cb3a!8m2!3d14.5824175!4d-87.8459894!16s%2Fg%2F11trzkjflc?entry=tts&g_ep=EgoyMDI2MDQyMS4wIPu8ASoASAFQAw%3D%3D&skid=414d3955-4099-40d4-87bf-bf82f1fde6ac","https://www.instagram.com/bouquetcoffeebistro/","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=16362252536462625594&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantBouquetCoffeeBistro: Restaurant = {
  identity: {
    name: "Bouquet Coffee & Bistro",
    slug,
  },
  classification: {
    category: "cafe",
    priceRange: "$$",
    featured: false,
  },
  copy: {
    summary:
      "Bouquet Coffee & Bistro en Siguatepeque; café, pastelería y pausa tranquila en un solo lugar.",
  },
  location: {
    address: "Carretera CA-5, contiguo, a El Torito, 12111 Siguatepeque, Comayagua, Honduras",
    coordinates: { lat: 14.5824175, lng: -87.8459894 },
  },
  contact: {
    phone: "+504 9299-6305",
    whatsapp: "+504 9299-6305",
  },
  hours: {
    scheduleLabel: "Monday: 10:30 AM – 8:00 PM · Tuesday: 10:30 AM – 8:00 PM · Wednesday: 9:00 AM – 9:00 PM · Thursday: 9:00 AM – 9:00 PM · Friday: 9:00 AM – 9:00 PM · Saturday: 9:00 AM – 9:00 PM · Sunday: 9:00 AM – 9:00 PM",
    structured: [{"day":"Lunes","open":"10:30 AM","close":"8:00 PM"},{"day":"Martes","open":"10:30 AM","close":"8:00 PM"},{"day":"Miércoles","open":"9:00 AM","close":"9:00 PM"},{"day":"Jueves","open":"9:00 AM","close":"9:00 PM"},{"day":"Viernes","open":"9:00 AM","close":"9:00 PM"},{"day":"Sábado","open":"9:00 AM","close":"9:00 PM"},{"day":"Domingo","open":"9:00 AM","close":"9:00 PM"}],
  },
  media: {
    hero: "/restaurants/bouquet-coffee-bistro/hero.jpg",
    gallery: ["/restaurants/bouquet-coffee-bistro/gallery-1.jpg","/restaurants/bouquet-coffee-bistro/gallery-2.jpg","/restaurants/bouquet-coffee-bistro/gallery-3.jpg","/restaurants/bouquet-coffee-bistro/gallery-4.jpg","/restaurants/bouquet-coffee-bistro/gallery-5.jpg","/restaurants/bouquet-coffee-bistro/gallery-6.jpg","/restaurants/bouquet-coffee-bistro/gallery-7.jpg","/restaurants/bouquet-coffee-bistro/gallery-8.jpg","/restaurants/bouquet-coffee-bistro/gallery-9.jpg","/restaurants/bouquet-coffee-bistro/gallery-10.jpg"],
  },
  ratings: {
    average: 5,
    reviewsCount: 18,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [],
};
