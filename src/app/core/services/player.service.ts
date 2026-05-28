import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Player, PlayerFilters } from '../models/player.model';
import { Comment } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/players`;

  readonly players = signal<Player[]>([]);
  readonly isLoading = signal(false);

  // ─── CRUD local ─────────────────────────────────────────────────────

  list(filters: PlayerFilters = {}): Observable<Player[]> {
    let params = new HttpParams();
    if (filters.name)   params = params.set('name', filters.name);
    if (filters.team)   params = params.set('team', filters.team);
    if (filters.league) params = params.set('league', filters.league);
    if (filters.from)   params = params.set('from', filters.from);
    if (filters.to)     params = params.set('to', filters.to);

    this.isLoading.set(true);
    return this.http.get<Player[]>(this.baseUrl, { params }).pipe(
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
    return this.http.get<Player>(`${this.baseUrl}/${id}`);
  }

  create(player: Partial<Player>): Observable<Player> {
    return this.http.post<Player>(this.baseUrl, player);
  }

  update(id: string, partial: Partial<Player>): Observable<Player> {
    return this.http.put<Player>(`${this.baseUrl}/${id}`, partial);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ─── Comments ─────────────────────────────────────────────

  addComment(playerId: string, comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/${playerId}/comments`, comment);
  }

  deleteComment(playerId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${playerId}/comments/${commentId}`);
  }

  // ─── API-Football ───────────────────────────────────────────────────

  searchExternal(query: string): Observable<unknown[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<unknown[]>(`${this.baseUrl}/external`, { params });
  }

  importExternal(ids: number[]): Observable<Player[]> {
    return this.http.post<Player[]>(`${this.baseUrl}/external/import`, ids);
  }
}
