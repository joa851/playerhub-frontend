import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Player, PlayerFilters } from '../models/player.model';
import { Comment } from '../models/comment.model';
import { BackendService } from './backend.service';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly http = inject(HttpClient);
  private readonly backend = inject(BackendService);

  readonly players = signal<Player[]>([]);
  readonly isLoading = signal(false);

  /**
   * Normaliza la diferencia de id entre backends:
   *   MEAN devuelve _id (string ObjectId).
   *   Spring devuelve id (Long numérico).
   * El frontend trabaja siempre con _id.
   */
  private normalize(p: Player & { id?: number | string }): Player {
    if (!p._id && p.id != null) {
      return { ...p, _id: String(p.id) };
    }
    return p;
  }

  // ─── CRUD local ─────────────────────────────────────────────────────

  list(filters: PlayerFilters = {}): Observable<Player[]> {
    let params = new HttpParams();
    if (filters.name)   params = params.set('name', filters.name);
    if (filters.team)   params = params.set('team', filters.team);
    if (filters.league) params = params.set('league', filters.league);
    if (filters.from)   params = params.set('from', filters.from);
    if (filters.to)     params = params.set('to', filters.to);

    this.isLoading.set(true);
    return this.http.get<Player[]>(this.backend.buildPlayersUrl(), { params }).pipe(
      map((arr) => arr.map((p) => this.normalize(p))),
      tap({
        next: (players) => {
          this.players.set(players);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      }),
    );
  }

  getById(id: string): Observable<Player> {
    return this.http.get<Player>(this.backend.buildPlayersUrl(id)).pipe(
      map((p) => this.normalize(p)),
    );
  }

  create(player: Partial<Player>): Observable<Player> {
    return this.http.post<Player>(this.backend.buildPlayersUrl(), player).pipe(
      map((p) => this.normalize(p)),
    );
  }

  update(id: string, partial: Partial<Player>): Observable<Player> {
    return this.http.put<Player>(this.backend.buildPlayersUrl(id), partial).pipe(
      map((p) => this.normalize(p)),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.backend.buildPlayersUrl(id));
  }

  // ─── Comments embebidos (solo MEAN; en Spring no hay endpoint POST/DELETE) ─

  addComment(playerId: string, comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(
      this.backend.buildPlayersUrl(`${playerId}/comments`),
      comment,
    );
  }

  deleteComment(playerId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(
      this.backend.buildPlayersUrl(`${playerId}/comments/${commentId}`),
    );
  }

  // ─── API-Football ───────────────────────────────────────────────────

  searchExternal(query: string): Observable<unknown[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<unknown[]>(
      this.backend.buildPlayersUrl('external'),
      { params },
    );
  }

  importExternal(ids: number[]): Observable<Player[]> {
    return this.http.post<Player[]>(
      this.backend.buildPlayersUrl('external/import'),
      ids,
    ).pipe(
      map((arr) => arr.map((p) => this.normalize(p))),
    );
  }

  // ─── LLM (Equipo Ideal) ──────────────────────────────────────────────

  /**
   * Pide al backend que genere el "Equipo Ideal" con el LLM (Gemini).
   * Devuelve la lista de jugadores en el orden sugerido por el modelo.
   * Funciona en MEAN y en Spring (ambos exponen POST /ideal-team).
   */
  idealTeam(): Observable<Player[]> {
    return this.http.post<Player[]>(
      this.backend.buildPlayersUrl('ideal-team'),
      {},
    ).pipe(
      map((arr) => arr.map((p) => this.normalize(p))),
    );
  }
}
