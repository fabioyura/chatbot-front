// src/app/features/enterprise/pages/enterprise-list/enterprise-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-enterprise-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Empresas</h1>
        <p>Gerencie os prompts personalizados das suas empresas</p>
      </div>

      <div class="enterprises-grid">
        <div class="card" *ngFor="let enterprise of mockEnterprises">
          <div class="card-body">
            <h3 class="card-title">{{ enterprise.name }}</h3>
            <p class="enterprise-id">ID: {{ enterprise.id }}</p>
            <div class="card-actions">
              <a 
                [routerLink]="['/enterprise', enterprise.id, 'prompt']" 
                class="btn btn-primary">
                Editar Prompt
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .page-header h1 {
      font-size: 2.5rem;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--text-secondary);
      font-size: 1.125rem;
      margin: 0;
    }

    .enterprises-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .card-title {
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .enterprise-id {
      color: var(--text-muted);
      font-size: 0.875rem;
      font-family: monospace;
      margin-bottom: 1rem;
      word-break: break-all;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    @media (max-width: 768px) {
      .enterprises-grid {
        grid-template-columns: 1fr;
      }
      
      .page-header h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class EnterpriseListComponent {
  // Mock data - em produção, isso viria de um serviço
  mockEnterprises = [
    {
      id: '0197124b-ee92-7615-9746-75173dbe2470',
      name: 'Empresa Alpha'
    },
    {
      id: '01978db8-08e1-7ad9-a5ec-f03470a3743a',
      name: 'Empresa Beta'
    },
    {
      id: '01978db8-08e1-7ad9-a5ec-f03470a3743b',
      name: 'Empresa Gamma'
    }
  ];
}

