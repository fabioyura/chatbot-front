// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/services/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/enterprise/pages/enterprise-prompt-finder/enterprise-prompt-finder.component')
      .then(m => m.EnterprisePromptFinderComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'enterprise',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/enterprise/pages/enterprise-list/enterprise-list.component')
      .then(m => m.EnterpriseListComponent)
  },
  {
    path: 'enterprise/:id/prompt',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/enterprise/pages/prompt-editor/prompt-editor.component')
      .then(m => m.PromptEditorComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];