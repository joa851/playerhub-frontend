import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Adjunta el Firebase ID token actual en `Authorization: Bearer …`
 * a todas las peticiones cuando el usuario está autenticado.
 *
 * Los endpoints públicos (GET /players, GET /players/:id, ...) lo
 * ignoran; los protegidos por requireAuth en backend lo exigen.
 *
 * Si no hay sesión, la petición sale tal cual (sin header): el
 * backend responderá 401 si tocaba ser protegida y la UI lo manejará.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return from(auth.getIdToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }
      const authed = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(authed);
    }),
  );
};
