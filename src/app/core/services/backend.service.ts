import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export type BackendKind = 'mean' | 'spring';

const STORAGE_KEY = 'playerhub.active-backend';

/**
 * Mantiene cuál de los dos backends está activo (Node/MEAN o Spring/Java).
 * El frontend consume "el backend activo" sin saber cuál es; cambiarlo
 * es un click en la UI.
 *
 * Persiste la elección en localStorage para que sobreviva recargas.
 */
@Injectable({ providedIn: 'root' })
export class BackendService {
  // Si hay valor en localStorage, lo usamos; si no, MEAN por defecto.
  private readonly initial: BackendKind =
    (typeof localStorage !== 'undefined' &&
      (localStorage.getItem(STORAGE_KEY) as BackendKind)) ||
    'mean';

  readonly active = signal<BackendKind>(this.initial);

  setBackend(kind: BackendKind) {
    this.active.set(kind);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, kind);
    }
  }

  /** URL base del backend activo (sin path de recurso). */
  getBaseUrl(): string {
    return environment.apiUrls[this.active()];
  }

  /**
   * Devuelve la URL completa para una operación sobre players.
   * Hace transparente la diferencia entre:
   *   MEAN  → /players/{path}
   *   Spring → /{path}    (su controller está montado en la raíz)
   *
   * Ejemplo: buildPlayersUrl('123/comments')
   *   MEAN  → https://.../players/123/comments
   *   Spring → https://.../123/comments
   */
  buildPlayersUrl(path: string = ''): string {
    const base = this.getBaseUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (this.active() === 'mean') {
      return `${base}/players${path ? cleanPath : ''}`;
    }
    return `${base}${path ? cleanPath : '/'}`;
  }
}
