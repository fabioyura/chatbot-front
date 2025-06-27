import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-enterprise-prompt-finder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="finder-card">
        <h1>Editor de Prompt</h1>
        <p>Insira o ID da empresa para editar o prompt personalizado.</p>
        <div class="input-group">
          <input 
            type="text" 
            [(ngModel)]="enterpriseId" 
            placeholder="Cole o ID da empresa aqui"
            (keyup.enter)="goToPromptEditor()">
          <button (click)="goToPromptEditor()" [disabled]="!enterpriseId" class="btn btn-primary">
            Editar Prompt
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      padding: 1rem;
    }

    .finder-card {
      background-color: var(--background-primary);
      padding: 3rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-md);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }

    h1 {
      font-size: 2rem;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    p {
      color: var(--text-secondary);
      font-size: 1.125rem;
      margin-bottom: 2rem;
    }

    .input-group {
      display: flex;
      gap: 0.5rem;
    }

    input {
      flex-grow: 1;
    }

    @media (max-width: 600px) {
      .finder-card {
        padding: 2rem;
      }
      .input-group {
        flex-direction: column;
      }
    }
  `]
})
export class EnterprisePromptFinderComponent {
  enterpriseId: string = '';

  constructor(private router: Router) {}

  goToPromptEditor() {
    if (this.enterpriseId && this.enterpriseId.trim() !== '') {
      this.router.navigate(['/enterprise', this.enterpriseId.trim(), 'prompt']);
    }
  }
} 