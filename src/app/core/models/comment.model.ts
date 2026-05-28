import { Location } from './player.model';


export interface Comment {
  _id?: string;
  author: string;
  text: string;       // máx 1000 chars
  rating: number;     // 0-5
  location?: Location;
  createdAt?: string;
  updatedAt?: string;
}
