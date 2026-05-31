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

  // Players
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
    // Debe ir ANTES de players/:id para que "ideal-team" no se tome como id.
    path: 'players/ideal-team',
    loadComponent: () =>
      import('./features/players/ideal-team/ideal-team.page').then((m) => m.IdealTeamPage),
  },
  {
    path: 'players/:id',
    loadComponent: () =>
      import('./features/players/detail/detail.page').then((m) => m.DetailPage),
  },

  // Default → login (el usuario puede continuar como invitado desde ahí).
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
];
