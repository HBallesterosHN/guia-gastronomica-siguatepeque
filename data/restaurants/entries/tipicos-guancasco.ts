import type { Restaurant } from "@/types/restaurant";

const slug = "tipicos-guancasco" as const;

/**
 * BORRADOR GENERADO POR restaurant:intake.
 * Google Maps: "https://maps.google.com/?cid=1313158523154829522&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 * Instagram: "https://www.instagram.com/tipicosguancasco/"
 * Referencias: ["https://nominatim.openstreetmap.org/search","https://www.google.com/maps/place/Restaurante+Tipico's+Guancasco/@14.5842739,-87.9036009,17z/data=!3m1!4b1!4m6!3m5!1s0x8f65bff2d9a21f07:0x123946b82a6b90d2!8m2!3d14.5842687!4d-87.901026!16s%2Fg%2F11rw7z0vxj?entry=tts&g_ep=EgoyMDI2MDQyMC4wIPu8ASoASAFQAw%3D%3D&skid=3b184678-3c6c-48fc-be7b-eafda6ab03a5","https://nominatim.openstreetmap.org/reverse","Google Places API (New)"]
 * Notas: "Generado por restaurant:intake con fuentes publicas. Revisar antes de publicar. Maps[google_places, confianza alta]: https://maps.google.com/?cid=1313158523154829522&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAIYBCAA"
 */
export const restaurantTipicosGuancasco: Restaurant = {
  identity: {
    name: "Restaurante Tipico's Guancasco",
    slug,
  },
  classification: {
    category: "familiar",
    priceRange: "$$",
    featured: true,
  },
  copy: {
    summary:
      "Tipico's Guancasco en Siguatepeque; cocina casera hondureña fuerte en almuerzos, sopes y caldos.",
  },
  location: {
    address: "H3JW+73, El Porvenir, Comayagua, Honduras",
    coordinates: { lat: 14.5842687, lng: -87.901026 },
  },
  contact: {
    phone: "+504 3198-0556",
    whatsapp: "+504 3198-0556",
  },
  hours: {
    scheduleLabel: "Monday: 8:00 AM – 5:00 PM · Tuesday: 8:00 AM – 5:00 PM · Wednesday: 8:00 AM – 5:00 PM · Thursday: 8:00 AM – 5:00 PM · Friday: 8:00 AM – 5:00 PM · Saturday: 8:00 AM – 5:00 PM · Sunday: 8:00 AM – 5:00 PM",
    structured: [{"day":"Lunes","open":"8:00 AM","close":"5:00 PM"},{"day":"Martes","open":"8:00 AM","close":"5:00 PM"},{"day":"Miércoles","open":"8:00 AM","close":"5:00 PM"},{"day":"Jueves","open":"8:00 AM","close":"5:00 PM"},{"day":"Viernes","open":"8:00 AM","close":"5:00 PM"},{"day":"Sábado","open":"8:00 AM","close":"5:00 PM"},{"day":"Domingo","open":"8:00 AM","close":"5:00 PM"}],
  },
  media: {
    hero: "/restaurants/tipicos-guancasco/hero.jpg",
    gallery: ["/restaurants/tipicos-guancasco/gallery-1.jpg","/restaurants/tipicos-guancasco/gallery-2.jpg","/restaurants/tipicos-guancasco/gallery-3.jpg","/restaurants/tipicos-guancasco/gallery-4.jpg","/restaurants/tipicos-guancasco/gallery-5.jpg","/restaurants/tipicos-guancasco/gallery-6.jpg","/restaurants/tipicos-guancasco/gallery-7.jpg","/restaurants/tipicos-guancasco/gallery-8.jpg","/restaurants/tipicos-guancasco/gallery-9.jpg","/restaurants/tipicos-guancasco/gallery-10.jpg"],
  },
  ratings: {
    average: 4,
    reviewsCount: 98,
  },
  services: {
    offersDelivery: false,
    acceptsReservations: false,
  },
  reviews: [],
};
