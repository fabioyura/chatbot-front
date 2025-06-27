// src/app/shared/components/not-found/not-found.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="not-found-content">
        <div class="not-found-icon">404</div>
        <h1>Página não encontrada</h1>
        <p>A página que você está procurando não existe ou foi movida.</p>
        <a routerLink="/" class="btn btn-primary">
          Voltar ao início
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
      gap: 1rem;
    }

    .not-found-icon {
      font-size: 6rem;
      font-weight: 900;
      color: var(--text-muted);
      line-height: 1;
    }

    .not-found-content h1 {
      font-size: 2rem;
      color: var(--text-primary);
      margin: 0;
    }

    .not-found-content p {
      color: var(--text-secondary);
      font-size: 1.125rem;
      max-width: 400px;
      margin: 0;
    }
  `]
})
export class NotFoundComponent {}