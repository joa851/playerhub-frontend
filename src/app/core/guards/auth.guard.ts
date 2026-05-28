import { CanActivateFn } from '@angular/router';

//TODO: por ahora permite todas las rutas
export const authGuard: CanActivateFn = () => {
  return true;
};
