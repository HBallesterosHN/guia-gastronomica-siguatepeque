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
import { restaurantTipicosGuancasco } from "@/data/restaurants/entries/tipicos-guancasco";

import { restaurantElDeArriba } from "@/data/restaurants/entries/el-de-arriba";
import { restaurantSavoyCafeX301 } from "@/data/restaurants/entries/savoy-cafe-x301";
import { restaurantPupuseriaIrma } from "@/data/restaurants/entries/pupuseria-irma";
import { restaurantCampingElOvejo } from "@/data/restaurants/entries/camping-el-ovejo";
import { restaurantRetroCafe } from "@/data/restaurants/entries/retro-cafe";
import { restaurantCafeElGranizo } from "@/data/restaurants/entries/cafe-el-granizo";
import { restaurantGoldenGrill } from "@/data/restaurants/entries/golden-grill";
import { restaurantChinaWeng } from "@/data/restaurants/entries/china-weng";
import { restaurantCafeJuanCruz } from "@/data/restaurants/entries/cafe-juan-cruz";
import { restaurantSiguaCoffee } from "@/data/restaurants/entries/sigua-coffee";
import { restaurantRestauranteRosquillasPaola } from "@/data/restaurants/entries/restaurante-rosquillas-paola";
import { restaurantRestauranteVillaVerde } from "@/data/restaurants/entries/restaurante-villa-verde";
import { restaurantBouquetCoffeeBistro } from "@/data/restaurants/entries/bouquet-coffee-bistro";
import { restaurantLosJarrosCafeRestaurante } from "@/data/restaurants/entries/los-jarros-cafe-restaurante";
import { restaurantSavoySanJuan } from "@/data/restaurants/entries/savoy-san-juan";
import { restaurantRestauranteDelCorral } from "@/data/restaurants/entries/restaurante-del-corral";
import type { Restaurant } from "@/types/restaurant";

export const restaurants: Restaurant[] = [
  restaurantLaPastela,
  restaurantTipicosGuancasco,
  restaurantCasaPinar,
  restaurantHabanaMex,
  restaurantElToritoSteakHouse,
  restaurantElDeArriba,
  restaurantSavoyCafeX301,
  restaurantPupuseriaIrma,
  restaurantCampingElOvejo,
  restaurantRetroCafe,
  restaurantCafeElGranizo,
  restaurantGoldenGrill,
  restaurantChinaWeng,
  restaurantCafeJuanCruz,
  restaurantSiguaCoffee,
  restaurantRestauranteRosquillasPaola,
  restaurantRestauranteVillaVerde,
  restaurantBouquetCoffeeBistro,
  restaurantLosJarrosCafeRestaurante,
  restaurantSavoySanJuan,
  restaurantRestauranteDelCorral,
];
