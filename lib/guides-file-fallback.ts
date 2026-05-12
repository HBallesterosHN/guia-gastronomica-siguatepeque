/**
 * Definición de guías que viven en código hasta migrarlas a Neon.
 * Si existe una fila en `Guide` con el mismo `slug`, gana la base de datos.
 */
export type FileGuideEntryDef = {
  restaurantSlug: string;
  emoji?: string;
  /** Línea corta junto al número (ej. plato o categoría). */
  label: string;
  /** Título de la tarjeta si difiere del nombre del restaurante en ficha. */
  headline?: string;
  /** Texto editorial largo. */
  note: string;
  rank: number;
};

export type FileGuideDefinition = {
  slug: string;
  title: string;
  subtitle?: string;
  /** Párrafo bajo el título en la ficha de la guía. */
  intro: string;
  /** Resumen para listado / tarjeta en /guias. */
  description: string;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  coverImageUrl?: string;
  entries: FileGuideEntryDef[];
};

export const FILE_GUIDE_DEFINITIONS: FileGuideDefinition[] = [
  {
    slug: "mejores-sopas-en-siguatepeque",
    title: "🍲 Sopas en Siguatepeque que pedimos cuando el frío pega",
    intro:
      "En Siguatepeque el frío se siente en la piel y en la mesa: la sopa no es moda, es costumbre de almuerzo, de domingo con familia o de ese día en que uno solo quiere un caldo honesto. Estas son cuatro sopas que seguimos recomendando, en el orden en que nosotros las pediríamos; toca cada ficha para ver horarios, ubicación y el perfil completo del restaurante.",
    description:
      "Una selección local para días frescos: gallina india, marinera, sopa de res y mondongo.",
    featured: true,
    seoTitle: "Sopas en Siguatepeque cuando pega el frío",
    seoDescription:
      "Gallina india, marinera, sopa de res y mondongo: cuatro sopas que seguimos pidiendo en Siguatepeque y dónde pedirlas.",
    entries: [
      {
        rank: 0,
        restaurantSlug: "tipicos-guancasco",
        emoji: "🐔",
        label: "Gallina india",
        headline: "Tipicos Guancasco",
        note:
          "Para nosotros esta va primero porque es la sopa que encaja con un almuerzo familiar en Siguatepeque: cocina típica hondureña, mesa llena y ese caldo de gallina india que te quita el frío de golpe. • Es el plato que uno pide cuando quiere sabor de casa, sin rodeos. • Si te toca día nublado o tarde larga, aquí encontramos el consuelo clásico.",
      },
      {
        rank: 1,
        restaurantSlug: "el-torito-steak-house",
        emoji: "🐟",
        label: "Marinera",
        headline: "El Torito Steak House",
        note:
          "La dejamos en segundo lugar porque cuando ya vienes de mucha sopa de tierra, en El Torito la marinera cambia el chip: caldo de pescado y mariscos, en la CA-5 frente a Uniplaza, en un local donde también se pide parrilla y mariscos. • Sirve para el antojo de mar sin complicarse. • Si quieres algo caliente pero distinto al caldo de siempre, esta es nuestra apuesta.",
      },
      {
        rank: 2,
        restaurantSlug: "restaurante-rosquillas-paola",
        emoji: "🥩",
        label: "Sopa de res",
        headline: "Restaurante Rosquillas Paola",
        note:
          "Va tercera porque, en la misma CA-5, en Rosquillas Paola, la sopa de res nos remite a lo tradicional de carretera: sabor fuerte, plato lleno y ese ambiente de restaurante y rosquillería donde uno se siente en confianza. • Es la sopa de res que pedimos cuando queremos algo contundente y sencillo. • Si vas en grupo o con hambre de verdad, aquí no quedamos con el plato a medias.",
      },
      {
        rank: 3,
        restaurantSlug: "habana-mex",
        emoji: "🥣",
        label: "Mondongo",
        headline: "Habana Mex",
        note:
          "La cerramos en cuarto no porque falte sabor, sino porque el ranking va de lo más típico de almuerzo hondureño hacia un perfil con sazón mexicana; en Habana Mex el mondongo es de los platos que la gente pide seguido. • Si te gusta el mondongo bien cocido y con sazón, aquí lo pedimos sin pena. • Es el cierre cuando ya recorriste las otras y quieres un caldo distinto pero igual de llenador.",
      },
    ],
  },
  {
    slug: "mejores-desayunos-en-siguatepeque",
    title: "🍽️ Mejores desayunos en Siguatepeque para empezar bien el día",
    intro:
      "En Siguatepeque, el desayuno muchas veces marca el ritmo del día: salida temprano, parada en carretera o mesa en familia antes de arrancar. En esta guía dejamos una recomendación concreta que sí sugerimos cuando alguien pregunta dónde desayunar bien.",
    description:
      "Una guía práctica para empezar el día con buen sabor y opciones que sí recomendamos.",
    featured: true,
    seoTitle: "Mejores desayunos en Siguatepeque",
    seoDescription: "Dónde desayunar bien en Siguatepeque: guía editorial con Villa Verde y criterio local.",
    entries: [
      {
        rank: 0,
        restaurantSlug: "restaurante-villa-verde",
        emoji: "🌄",
        label: "Desayuno completo",
        headline: "Restaurante Villa Verde",
        note:
          "Villa Verde abre esta guía porque en la práctica es de esos lugares donde la gente ya llega temprano por la CA-5: mesa campestre, desayuno sin estrés y espacio para ir en familia. • Cuando quieres empezar el día con aire de campo y café caliente, aquí encaja. • También sirve de parada si vienes de camino y necesitas algo sólido antes de seguir.",
      },
    ],
  },
  {
    slug: "cafes-recomendados-en-siguatepeque",
    title: "☕ Cafés recomendados en Siguatepeque",
    intro:
      "En Siguatepeque el café se toma en serio: aquí van los lugares que hoy sí sugerimos para una pausa con buena taza, conversación tranquila y ambiente agradable.",
    description: "Lugares ideales para conversar, trabajar o hacer una pausa con buen café.",
    featured: true,
    seoTitle: "Cafés recomendados en Siguatepeque",
    seoDescription:
      "Dónde tomar café en Siguatepeque con calma: guía editorial con recomendaciones concretas.",
    entries: [
      {
        rank: 0,
        restaurantSlug: "la-pastela",
        emoji: "☕",
        label: "Café y repostería",
        headline: "La Pastela",
        note:
          "La Pastela es nuestra primera recomendación en esta guía: abre temprano, el ambiente invita a quedarse y sirve bien para una mañana de café y repostería o una tarde de plática sin prisa. • Cuando alguien nos pide un café tranquilo en el centro, es de los nombres que salen. • También funciona si necesitas un espacio cómodo para una reunión corta o un café antes de seguir el día.",
      },
    ],
  },
];

const FILE_BY_SLUG = new Map(FILE_GUIDE_DEFINITIONS.map((g) => [g.slug, g]));

export function getFileGuideBySlug(slug: string): FileGuideDefinition | undefined {
  return FILE_BY_SLUG.get(slug);
}

export function getAllFileGuideSlugs(): string[] {
  return FILE_GUIDE_DEFINITIONS.map((g) => g.slug);
}
