import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/pokemon', pathMatch: 'full' },
  { path: 'pokemon', loadComponent: () => import('./pages/pokemon-list/pokemon-list.component').then(m => m.PokemonListComponent) },
  { path: 'pokemon/:id/edit', loadComponent: () => import('./pages/pokemon-edit/pokemon-edit.component').then(m => m.PokemonEditComponent) },
  { path: 'teams', loadComponent: () => import('./pages/teams-list/teams-list.component').then(m => m.TeamsListComponent) },
  { path: 'teams/new', loadComponent: () => import('./pages/team-new/team-new.component').then(m => m.TeamNewComponent) },
  { path: 'teams/:id', loadComponent: () => import('./pages/team-detail/team-detail.component').then(m => m.TeamDetailComponent) },
  { path: 'battle', loadComponent: () => import('./pages/battle/battle.component').then(m => m.BattleComponent) },
];
