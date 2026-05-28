import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Auth
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.page').then((m) => m.RegisterPage),
  },

  // Players: listado y detalle son públicos (spec: anónimos pueden listar y buscar).
  // OJO: 'new' antes de ':id' para que Express… digo Angular Router lo case primero.
  {
    path: 'players',
    loadComponent: () =>
      import('./features/players/list/list.page').then((m) => m.ListPage),
  },
  {
    path: 'players/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/players/create/create.page').then((m) => m.CreatePage),
  },
  {
    path: 'players/:id',
    loadComponent: () =>
      import('./features/players/detail/detail.page').then((m) => m.DetailPage),
  },

  // Default → listado.
  { path: '', redirectTo: 'players', pathMatch: 'full' },
];
