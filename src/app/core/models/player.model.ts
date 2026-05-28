import { Comment } from './comment.model';

export interface Location {
  latitude?: number;
  longitude?: number;
}

export interface Birth {
  date?: string;
  place?: string;
  country?: string;
}

export interface Player {
  _id?: string;             // id local Mongo (Mongo usa _id, no id)
  externalId?: number;      // id en API-Football (solo si fue importado)

  name: string;
  firstname?: string;
  lastname?: string;
  age?: number;
  birth?: Birth;
  nationality?: string;
  height?: string;
  weight?: string;
  number?: number;
  position?: string;
  photo?: string;
  team?: string;
  league?: string;
  location?: Location;

  comments?: Comment[];     // embebidos en Mongo

  createdAt?: string;       // ISO date
  updatedAt?: string;
}

/** Filtros opcionales para GET /players. */
export interface PlayerFilters {
  name?: string;
  team?: string;
  league?: string;
  from?: string;   // ISO date
  to?: string;
}
