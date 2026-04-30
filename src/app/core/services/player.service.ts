import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Player } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/players`;

  readonly players = signal<Player[]>([]);
  readonly isLoading = signal(false);
}
