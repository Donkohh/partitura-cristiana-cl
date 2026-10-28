import type {
  Arrangement,
  Collection,
  Voicing,
  Work,
} from "@/types/music";

export const VOICING_OPTIONS: Voicing[] = [
  "SATB",
  "SSAA",
  "TTBB",
  "SAB",
  "Unísono",
  "Coro y solista",
];

export const demoCollections: Collection[] = [
  {
    id: "himnario-tradicional",
    slug: "himnario-tradicional",
    name: "Himnario tradicional",
    kicker: "El pulso de la asamblea",
    shortDescription:
      "Himnos que han acompañado la vida de las iglesias chilenas, reunidos en versiones claras para coro y congregación.",
    fullDescription:
      "Esta colección reúne himnos de larga memoria congregacional en transcripciones cuidadas, pensadas para que varias generaciones puedan cantar desde el mismo papel. Conviven aquí armonizaciones sencillas, versiones de concierto y adaptaciones para formaciones pequeñas.",
    order: 1,
  },
  {
    id: "voces-mixtas",
    slug: "voces-mixtas",
    name: "Voces mixtas",
    kicker: "Cantos para encontrarse",
    shortDescription:
      "Arreglos versátiles para coros mixtos, con versiones que van desde la asamblea hasta el escenario.",
    fullDescription:
      "Una puerta de entrada al repertorio coral para agrupaciones que reúnen distintas voces y experiencias. Las versiones priorizan líneas cantables, apoyos instrumentales flexibles y una escritura que permite crecer sin perder el carácter de la obra.",
    order: 2,
  },
  {
    id: "polifonia-sacra",
    slug: "polifonia-sacra",
    name: "Polifonía sacra",
    kicker: "La escucha atenta",
    shortDescription:
      "Motetes, himnos y armonizaciones de concierto para coros que buscan un trabajo vocal más detallado.",
    fullDescription:
      "El repertorio de concierto y de escucha contemplativa dentro del archivo. Aquí se reúnen obras de mayor densidad armónica, con interés en la independencia de las líneas y en la construcción del sonido colectivo. Cada versión incluye información de tesitura, tonalidad y carácter.",
    order: 3,
  },
  {
    id: "adviento-navidad",
    slug: "adviento-navidad",
    name: "Adviento y Navidad",
    kicker: "El tiempo de la espera",
    shortDescription:
      "Cantos de espera, anunciación y nacimiento para acompañar el ciclo de Adviento y las celebraciones de Navidad.",
    fullDescription:
      "Un recorrido musical por el tiempo de la espera: desde la súplica de Emmanuel hasta el nacimiento en Belén. Las versiones están disponibles para distintos tamaños de coro y combinan el canto a cappella con acompañamientos sencillos de piano u órgano.",
    order: 4,
  },
];

export const demoWorks: Work[] = [
  {
    id: "cuan-grande-es-el",
    title: "Cuán grande es él",
    subtitle: "O store Gud",
    originalComposer: "Melodía popular sueca",
    lyricist: "Carl Boberg · versión española de Stuart K. Hine",
    originalLanguage: "Sueco",
    historicalNotes:
      "Un himno de admiración y gratitud que atraviesa generaciones y confesiones. Su fuerza está en el contraste entre la sencillez de la melodía y la amplitud de su texto, lo que permite versiones íntimas y también solemnemente corales.",
  },
  {
    id: "castillo-fuerte",
    title: "Castillo fuerte es nuestro Dios",
    subtitle: "Ein feste Burg ist unser Gott",
    originalComposer: "Martín Lutero",
    lyricist: "Martín Lutero · versión de Juan Bautista Cabrera",
    originalLanguage: "Alemán",
    historicalNotes:
      "Himno de la Reforma y una de las melodías más reconocibles del canto cristiano. Su escritura firme y procesional ha invitado históricamente a armonizaciones con órgano, metales y coro amplio.",
  },
  {
    id: "sublime-gracia",
    title: "Sublime gracia",
    subtitle: "Amazing Grace",
    originalComposer: "Melodía tradicional estadounidense · New Britain",
    lyricist: "John Newton",
    originalLanguage: "Inglés",
    historicalNotes:
      "Un canto de conversión y esperanza que se ha extendido mucho más allá de la iglesia. La melodía pentatónica admite arreglos austeros, versiones congregacionales y relecturas corales de gran expresividad.",
  },
  {
    id: "grande-es-tu-fidelidad",
    title: "Grande es tu fidelidad",
    subtitle: "Great Is Thy Faithfulness",
    originalComposer: "William M. Runyan",
    lyricist: "Thomas O. Chisholm",
    originalLanguage: "Inglés",
    historicalNotes:
      "Escrito como un canto de confianza en la providencia, este himno combina una melodía cálida con un texto de gratitud cotidiana. Funciona especialmente bien en versiones corales con acompañamiento de piano.",
  },
  {
    id: "oh-que-amigo",
    title: "¡Oh, qué amigo nos es Cristo!",
    subtitle: "What a Friend We Have in Jesus",
    originalComposer: "Charles C. Converse",
    lyricist: "Joseph M. Scriven",
    originalLanguage: "Inglés",
    historicalNotes:
      "Un himno pastoral sobre la oración y el consuelo, muy presente en reuniones pequeñas y cultos de acompañamiento. Su carácter cercano permite arreglos de textura simple y también versiones masculinas de gran calidez.",
  },
  {
    id: "cerca-de-ti",
    title: "Cerca de ti, Señor",
    subtitle: "Nearer, My God, to Thee",
    originalComposer: "Lowell Mason",
    lyricist: "Sarah F. Adams",
    originalLanguage: "Inglés",
    historicalNotes:
      "Inspirado en el relato de Jacob en Betel, el himno expresa el deseo de cercanía en medio de la prueba. Su melodía ascendente y serena se presta para cierres de culto y momentos de recogimiento.",
  },
  {
    id: "ven-emmanuel",
    title: "Ven, Emmanuel",
    subtitle: "O Come, O Come, Emmanuel",
    originalComposer: "Canto llano medieval",
    lyricist: "Antífona latina · versión tradicional",
    originalLanguage: "Latín",
    historicalNotes:
      "Las antífonas de Adviento dieron forma a este canto de espera que atraviesa siglos. La modalidad antigua de la melodía ofrece un color distinto dentro del repertorio navideño y pide un trabajo coral atento a la resonancia.",
  },
  {
    id: "noche-de-paz",
    title: "Noche de paz",
    subtitle: "Stille Nacht",
    originalComposer: "Franz Xaver Gruber",
    lyricist: "Joseph Mohr",
    originalLanguage: "Alemán",
    historicalNotes:
      "Estrenado en una pequeña iglesia austríaca, este villancico se convirtió en un símbolo universal de la Navidad. Su sencillez es también su exigencia: afinación limpia, frases largas y un sonido sereno.",
  },
  {
    id: "angeles-cantando",
    title: "Ángeles cantando están",
    subtitle: "Angels We Have Heard on High",
    originalComposer: "Melodía francesa tradicional",
    lyricist: "Anónimo · versión tradicional",
    originalLanguage: "Francés",
    historicalNotes:
      "Un villancico de carácter jubiloso, conocido por el largo melisma del estribillo. Es una pieza eficaz para abrir celebraciones navideñas y para integrar al coro con la asamblea.",
  },
  {
    id: "ven-espiritu-santo",
    title: "Ven, Espíritu Santo",
    subtitle: "Veni Creator Spiritus",
    originalComposer: "Canto llano medieval",
    lyricist: "Himno latino del siglo IX",
    originalLanguage: "Latín",
    historicalNotes:
      "Uno de los himnos más antiguos del repertorio cristiano, invocado en ordenaciones y celebraciones de discernimiento. Las versiones corales buscan conservar la respiración del canto llano sin renunciar a una escritura contemporánea.",
  },
];

export const demoArrangements: Arrangement[] = [
  {
    id: "cuan-satb-piano",
    workId: "cuan-grande-es-el",
    title: "Versión coral con piano",
    arranger: "Equipo editorial Donko",
    voicing: "SATB",
    accompaniment: "Piano",
    collectionIds: ["himnario-tradicional", "voces-mixtas"],
    tonality: "Si bemol mayor",
    meter: "4/4",
    tempo: "Andante maestoso",
    difficulty: "Intermedia",
    duration: "4:10",
  },
  {
    id: "cuan-satb-acapella",
    workId: "cuan-grande-es-el",
    title: "Armonización a cappella",
    arranger: "Equipo editorial Donko",
    voicing: "SATB",
    accompaniment: "A cappella",
    collectionIds: ["himnario-tradicional", "polifonia-sacra"],
    tonality: "Do mayor",
    meter: "4/4",
    tempo: "Moderato",
    difficulty: "Accesible",
    duration: "3:50",
  },
  {
    id: "cuan-ttbb",
    workId: "cuan-grande-es-el",
    title: "Versión para voces graves",
    arranger: "Adaptación del archivo",
    voicing: "TTBB",
    accompaniment: "A cappella",
    collectionIds: ["polifonia-sacra"],
    tonality: "La bemol mayor",
    meter: "4/4",
    tempo: "Lento expresivo",
    difficulty: "Avanzada",
    duration: "4:25",
  },
  {
    id: "castillo-satb-organo",
    workId: "castillo-fuerte",
    title: "Coral con órgano",
    arranger: "Equipo editorial Donko",
    voicing: "SATB",
    accompaniment: "Órgano",
    collectionIds: ["polifonia-sacra", "himnario-tradicional"],
    tonality: "Re menor",
    meter: "4/4",
    tempo: "Maestoso",
    difficulty: "Intermedia",
    duration: "3:35",
  },
  {
    id: "castillo-sab",
    workId: "castillo-fuerte",
    title: "Versión abreviada para tres voces",
    arranger: "Adaptación del archivo",
    voicing: "SAB",
    accompaniment: "A cappella",
    collectionIds: ["voces-mixtas"],
    tonality: "Re menor",
    meter: "4/4",
    tempo: "Con firmeza",
    difficulty: "Accesible",
    duration: "3:20",
  },
  {
    id: "sublime-satb-acapella",
    workId: "sublime-gracia",
    title: "Versión coral a cappella",
    arranger: "Equipo editorial Donko",
    voicing: "SATB",
    accompaniment: "A cappella",
    collectionIds: ["himnario-tradicional", "polifonia-sacra"],
    tonality: "Sol mayor",
    meter: "3/4",
    tempo: "Lento",
    difficulty: "Accesible",
    duration: "3:15",
  },
  {
    id: "sublime-unisono",
    workId: "sublime-gracia",
    title: "Versión congregacional",
    arranger: "Equipo editorial Donko",
    voicing: "Unísono",
    accompaniment: "Piano",
    collectionIds: ["himnario-tradicional", "voces-mixtas"],
    tonality: "Sol mayor",
    meter: "3/4",
    tempo: "Tranquilo",
    difficulty: "Accesible",
    duration: "2:50",
  },
  {
    id: "fidelidad-satb-piano",
    workId: "grande-es-tu-fidelidad",
    title: "Versión lírica con piano",
    arranger: "Equipo editorial Donko",
    voicing: "SATB",
    accompaniment: "Piano",
    collectionIds: ["himnario-tradicional", "voces-mixtas"],
    tonality: "Mi bemol mayor",
    meter: "3/4",
    tempo: "Espressivo",
    difficulty: "Intermedia",
    duration: "3:40",
  },
  {
    id: "fidelidad-ssaa",
    workId: "grande-es-tu-fidelidad",
    title: "Versión para voces blancas",
    arranger: "Adaptación del archivo",
    voicing: "SSAA",
    accompaniment: "A cappella",
    collectionIds: ["polifonia-sacra"],
    tonality: "Re bemol mayor",
    meter: "3/4",
    tempo: "Cálido",
    difficulty: "Intermedia",
    duration: "3:30",
  },
  {
    id: "amigo-satb-piano",
    workId: "oh-que-amigo",
    title: "Versión pastoral con piano",
    arranger: "Equipo editorial Donko",
    voicing: "SATB",
    accompaniment: "Piano",
    collectionIds: ["himnario-tradicional", "voces-mixtas"],
    tonality: "Fa mayor",
    meter: "4/4",
    tempo: "Con calma",
    difficulty: "Accesible",
    duration: "3:05",
  },
  {
    id: "amigo-ttbb",
    workId: "oh-que-amigo",
    title: "Armonización para voces graves",
    arranger: "Adaptación del archivo",
    voicing: "TTBB",
    accompaniment: "A cappella",
    collectionIds: ["polifonia-sacra"],
    tonality: "Mi bemol mayor",
    meter: "4/4",
    tempo: "Sostenido",
    difficulty: "Intermedia",
    duration: "3:20",
  },
  {
    id: "cerca-satb-piano",
    workId: "cerca-de-ti",
    title: "Versión coral con piano",
    arranger: "Equipo editorial Donko",
    voicing: "SATB",
    accompaniment: "Piano",
    collectionIds: ["himnario-tradicional", "voces-mixtas"],
    tonality: "Sol mayor",
    meter: "4/4",
    tempo: "Sereno",
    difficulty: "Accesible",
    duration: "3:10",
  },
  {
    id: "cerca-sab",
    workId: "cerca-de-ti",
    title: "Versión para coro pequeño",
    arranger: "Adaptación del archivo",
    voicing: "SAB",
    accompaniment: "Piano",
    collectionIds: ["voces-mixtas"],
    tonality: "Fa mayor",
    meter: "4/4",
    tempo: "Íntimo",
    difficulty: "Accesible",
    duration: "2:55",
  },
  {
    id: "emmanuel-satb-acapella",
    workId: "ven-emmanuel",
    title: "Versión modal a cappella",
    arranger: "Equipo editorial Donko",
    voicing: "SATB",
    accompaniment: "A cappella",
    collectionIds: ["adviento-navidad", "polifonia-sacra"],
    tonality: "Mi menor",
    meter: "4/4",
    tempo: "Con espera",
    difficulty: "Intermedia",
    duration: "4:05",
  },
  {
    id: "emmanuel-solista",
    workId: "ven-emmanuel",
    title: "Coro y solista con piano",
    arranger: "Adaptación del archivo",
    voicing: "Coro y solista",
    accompaniment: "Piano",
    collectionIds: ["adviento-navidad", "voces-mixtas"],
    tonality: "Re menor",
    meter: "4/4",
    tempo: "Recogido",
    difficulty: "Intermedia",
    duration: "4:20",
  },
  {
    id: "noche-satb-acapella",
    workId: "noche-de-paz",
    title: "Versión a cappella",
    arranger: "Equipo editorial Donko",
    voicing: "SATB",
    accompaniment: "A cappella",
    collectionIds: ["adviento-navidad", "polifonia-sacra"],
    tonality: "Do mayor",
    meter: "6/8",
    tempo: "Muy tranquilo",
    difficulty: "Intermedia",
    duration: "3:25",
  },
  {
    id: "noche-ssaa",
    workId: "noche-de-paz",
    title: "Versión para voces blancas",
    arranger: "Adaptación del archivo",
    voicing: "SSAA",
    accompaniment: "A cappella",
    collectionIds: ["adviento-navidad", "voces-mixtas"],
    tonality: "Sol mayor",
    meter: "6/8",
    tempo: "Flotante",
    difficulty: "Intermedia",
    duration: "3:30",
  },
  {
    id: "noche-solista",
    workId: "noche-de-paz",
    title: "Solo, coro y piano",
    arranger: "Equipo editorial Donko",
    voicing: "Coro y solista",
    accompaniment: "Piano",
    collectionIds: ["adviento-navidad", "voces-mixtas"],
    tonality: "Do mayor",
    meter: "6/8",
    tempo: "Dulce",
    difficulty: "Accesible",
    duration: "3:45",
  },
  {
    id: "angeles-satb-piano",
    workId: "angeles-cantando",
    title: "Versión festiva con piano",
    arranger: "Equipo editorial Donko",
    voicing: "SATB",
    accompaniment: "Piano",
    collectionIds: ["adviento-navidad", "voces-mixtas"],
    tonality: "Fa mayor",
    meter: "4/4",
    tempo: "Alegre",
    difficulty: "Intermedia",
    duration: "3:15",
  },
  {
    id: "angeles-sab",
    workId: "angeles-cantando",
    title: "Versión para tres voces",
    arranger: "Adaptación del archivo",
    voicing: "SAB",
    accompaniment: "Piano",
    collectionIds: ["adviento-navidad", "voces-mixtas"],
    tonality: "Sol mayor",
    meter: "4/4",
    tempo: "Jubiloso",
    difficulty: "Accesible",
    duration: "3:00",
  },
  {
    id: "espiritu-satb-organo",
    workId: "ven-espiritu-santo",
    title: "Himno con órgano",
    arranger: "Equipo editorial Donko",
    voicing: "SATB",
    accompaniment: "Órgano",
    collectionIds: ["polifonia-sacra"],
    tonality: "Modo VIII",
    meter: "4/4",
    tempo: "Solemne",
    difficulty: "Avanzada",
    duration: "4:35",
  },
  {
    id: "espiritu-solista",
    workId: "ven-espiritu-santo",
    title: "Coro y solista a cappella",
    arranger: "Adaptación del archivo",
    voicing: "Coro y solista",
    accompaniment: "A cappella",
    collectionIds: ["polifonia-sacra", "himnario-tradicional"],
    tonality: "Re menor",
    meter: "4/4",
    tempo: "Contemplativo",
    difficulty: "Avanzada",
    duration: "4:50",
  },
];

export interface CatalogEntry {
  work: Work;
  arrangements: Arrangement[];
}

export interface CollectionEntry extends CatalogEntry {
  matchingArrangements: Arrangement[];
}

const worksById = new Map(demoWorks.map((work) => [work.id, work]));
const collectionsById = new Map(
  demoCollections.map((collection) => [collection.id, collection])
);
const arrangementsByWork = new Map<string, Arrangement[]>();

for (const arrangement of demoArrangements) {
  const current = arrangementsByWork.get(arrangement.workId) ?? [];
  current.push(arrangement);
  arrangementsByWork.set(arrangement.workId, current);
}

export const demoCatalogEntries: CatalogEntry[] = [...demoWorks]
  .sort((a, b) => a.title.localeCompare(b.title, "es"))
  .map((work) => ({
    work,
    arrangements: arrangementsByWork.get(work.id) ?? [],
  }));

export function getWorkById(id: string): Work | undefined {
  return worksById.get(id);
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return demoCollections.find((collection) => collection.slug === slug);
}

export function getArrangementsForWork(workId: string): Arrangement[] {
  return arrangementsByWork.get(workId) ?? [];
}

export function getCollectionsForArrangement(
  arrangement: Arrangement
): Collection[] {
  return arrangement.collectionIds
    .map((id) => collectionsById.get(id))
    .filter((collection): collection is Collection => collection !== undefined);
}

export function getCollectionEntries(collectionId: string): CollectionEntry[] {
  return demoWorks
    .map((work) => {
      const matchingArrangements = getArrangementsForWork(work.id).filter(
        (arrangement) => arrangement.collectionIds.includes(collectionId)
      );

      return {
        work,
        arrangements: arrangementsByWork.get(work.id) ?? [],
        matchingArrangements,
      };
    })
    .filter((entry) => entry.matchingArrangements.length > 0)
    .sort((a, b) => a.work.title.localeCompare(b.work.title, "es"));
}

export function getCollectionStats(collectionId: string) {
  const entries = getCollectionEntries(collectionId);
  const arrangements = entries.flatMap((entry) => entry.matchingArrangements);
  const voicings = new Set(arrangements.map((arrangement) => arrangement.voicing));

  return {
    works: entries.length,
    arrangements: arrangements.length,
    voicings: voicings.size,
  };
}

export function getRelatedWorks(workId: string, limit = 3): CatalogEntry[] {
  const current = getWorkById(workId);
  if (!current) return [];

  const currentCollections = new Set(
    getArrangementsForWork(workId).flatMap((arrangement) => arrangement.collectionIds)
  );

  return demoCatalogEntries
    .filter((entry) => entry.work.id !== workId)
    .map((entry) => {
      const shared = entry.arrangements
        .flatMap((arrangement) => arrangement.collectionIds)
        .filter((collectionId) => currentCollections.has(collectionId)).length;

      return { entry, shared };
    })
    .sort((a, b) => {
      if (b.shared !== a.shared) return b.shared - a.shared;
      return a.entry.work.title.localeCompare(b.entry.work.title, "es");
    })
    .slice(0, limit)
    .map(({ entry }) => entry);
}

export const catalogStats = {
  works: demoWorks.length,
  arrangements: demoArrangements.length,
  collections: demoCollections.length,
  voicings: new Set(demoArrangements.map((arrangement) => arrangement.voicing))
    .size,
};
