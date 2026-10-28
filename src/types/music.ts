export type Voicing =
  | "SATB"
  | "SSAA"
  | "TTBB"
  | "SAB"
  | "Unísono"
  | "Coro y solista";

export type Accompaniment =
  | "A cappella"
  | "Piano"
  | "Órgano"
  | "Instrumental";

export type Difficulty = "Accesible" | "Intermedia" | "Avanzada";

export interface Work {
  id: string;
  title: string;
  subtitle?: string;
  originalComposer?: string;
  lyricist?: string;
  originalLanguage?: string;
  historicalNotes: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  kicker: string;
  shortDescription: string;
  fullDescription: string;
  order: number;
}

export interface Arrangement {
  id: string;
  workId: string;
  title: string;
  arranger: string;
  voicing: Voicing;
  accompaniment: Accompaniment;
  collectionIds: string[];
  tonality: string;
  meter: string;
  tempo: string;
  difficulty: Difficulty;
  duration: string;
}
