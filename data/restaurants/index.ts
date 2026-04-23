/**
 * Lista maestra de restaurantes (editable por codigo, sin base de datos).
 *
 * Para agregar uno nuevo:
 * 1. Crea public/restaurants/{slug}/hero.jpg (o .webp / .png) y opcionalmente galeria.
 * 2. Copia un archivo en entries/ y ajusta identity.slug para que coincida con la carpeta.
 * 3. Importa el nuevo objeto aqui y anadelo al array `restaurants`.
 */
import { restaurantCasaPinar } from "@/data/restaurants/entries/casa-pinar";
import { restaurantElToritoSteakHouse } from "@/data/restaurants/entries/el-torito-steak-house";
import { restaurantHabanaMex } from "@/data/restaurants/entries/habana-mex";
import { restaurantLaPastela } from "@/data/restaurants/entries/la-pastela";
import { restaurantRosquillasPaola } from "@/data/restaurants/entries/restaurante-rosquillas-paola";
import { restaurantTipicosGuancasco } from "@/data/restaurants/entries/tipicos-guancasco";
import { restaurantVillaVerde } from "@/data/restaurants/entries/restaurante-villa-verde";

import { restaurantElDeArriba } from "@/data/restaurants/entries/el-de-arriba";
import type { Restaurant } from "@/types/restaurant";

export const restaurants: Restaurant[] = [
  restaurantLaPastela,
  restaurantTipicosGuancasco,
  restaurantCasaPinar,
  restaurantRosquillasPaola,
  restaurantVillaVerde,
  restaurantHabanaMex,
  restaurantElToritoSteakHouse,  restaurantElDeArriba,
];
