// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/enterprise/pages/enterprise-prompt-finder/enterprise-prompt-finder.component')
      .then(m => m.EnterprisePromptFinderComponent)
  },
  {
    path: 'enterprise',
    loadComponent: () => import('./features/enterprise/pages/enterprise-list/enterprise-list.component')
      .then(m => m.EnterpriseListComponent)
  },
  {
    path: 'enterprise/:id/prompt',
    loadComponent: () => import('./features/enterprise/pages/prompt-editor/prompt-editor.component')
      .then(m => m.PromptEditorComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];