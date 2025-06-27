// src/app/features/enterprise/pages/prompt-editor/prompt-editor.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { EnterpriseService } from '../../../../core/services/enterprise.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { UpdatePromptRequest } from '../../../../core/models/enterprise.model';
import { QrCodeDisplayComponent } from '../../../../shared/components/qr-code-display/qr-code-display.component';

@Component({
  selector: 'app-prompt-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, QrCodeDisplayComponent],
  template: `
    <div class="container">
      <div class="page-header">
        <div class="header-actions">
          <a routerLink="/enterprise" class="btn btn-secondary">
            ← Voltar
          </a>
        </div>
        <h1>Editor de Prompt</h1>
        <p *ngIf="enterpriseId">Empresa: <code>{{ enterpriseId }}</code></p>
      </div>

      <div class="editor-layout">
        <!-- Left Column - Prompt Editor -->
        <div class="editor-container">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">Prompt Personalizado</h2>
            </div>
            <div class="card-body">
              <form (ngSubmit)="onSave()" #promptForm="ngForm">
                <div class="form-group">
                  <label for="customPrompt" class="form-label">
                    Prompt da Empresa
                  </label>
                  <textarea
                    id="customPrompt"
                    name="customPrompt"
                    [(ngModel)]="customPrompt"
                    class="form-control"
                    rows="10"
                    placeholder="Digite o prompt personalizado para esta empresa..."
                    required>
                  </textarea>
                </div>

                <div class="form-actions">
                  <button 
                    type="button" 
                    class="btn btn-secondary"
                    (click)="onReset()"
                    [disabled]="isSubmitting">
                    Restaurar
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="!promptForm.valid || isSubmitting">
                    <span *ngIf="isSubmitting" class="spinner"></span>
                    {{ isSubmitting ? 'Salvando...' : 'Salvar Prompt' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Status Messages -->
          <div class="status-messages">
            <div class="alert alert-success" *ngIf="successMessage">
              {{ successMessage }}
            </div>
            <div class="alert alert-error" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>
          </div>
        </div>

        <!-- Right Column - QR Code -->
        <div class="qr-sidebar">
          <app-qr-code-display 
            [enterpriseId]="enterpriseId">
          </app-qr-code-display>

          <!-- Connection Tips -->
          <div class="card tips-card">
            <div class="card-header">
              <h3 class="card-title">💡 Dicas de Conexão</h3>
            </div>
            <div class="card-body">
              <ul class="tips-list">
                <li>Mantenha o WhatsApp Web fechado em outros navegadores</li>
                <li>Certifique-se de que seu celular está conectado à internet</li>
                <li>O QR Code expira a cada 20 segundos e é renovado automaticamente</li>
                <li>Após conectar, você pode fechar esta aba</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 2rem;
    }

    .header-actions {
      margin-bottom: 1rem;
    }

    .page-header h1 {
      font-size: 2rem;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--text-secondary);
      margin: 0;
    }

    .page-header code {
      background-color: var(--background-tertiary);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      color: var(--text-primary);
    }

    .editor-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
      align-items: start;
    }

    .editor-container {
      max-width: 800px;
    }

    .qr-sidebar {
      position: sticky;
      top: 2rem;
    }

    .form-control {
      resize: vertical;
      min-height: 200px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      line-height: 1.5;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    .status-messages {
      margin-top: 1rem;
    }

    .alert {
      padding: 1rem;
      border-radius: var(--radius-md);
      margin-bottom: 1rem;
    }

    .alert-success {
      background-color: rgba(16, 185, 129, 0.1);
      color: var(--success-color);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .alert-error {
      background-color: rgba(239, 68, 68, 0.1);
      color: var(--error-color);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .tips-card {
      margin-top: 1.5rem;
    }

    .tips-card .card-title {
      font-size: 1rem;
    }

    .tips-list {
      margin: 0;
      padding-left: 1.5rem;
      list-style-type: none;
    }

    .tips-list li {
      position: relative;
      margin-bottom: 0.75rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .tips-list li:before {
      content: '•';
      color: var(--primary-color);
      font-weight: bold;
      position: absolute;
      left: -1rem;
    }

    .tips-list li:last-child {
      margin-bottom: 0;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .editor-layout {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .qr-sidebar {
        position: static;
        order: -1;
      }
    }

    @media (max-width: 768px) {
      .form-actions {
        flex-direction: column;
      }
      
      .form-actions button {
        width: 100%;
      }

      .editor-layout {
        gap: 1rem;
      }
    }
  `]
})
export class PromptEditorComponent implements OnInit, OnDestroy {
  enterpriseId: string = '';
  customPrompt: string = '';
  originalPrompt: string = '';
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private enterpriseService: EnterpriseService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.enterpriseId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.enterpriseId) {
      this.router.navigate(['/enterprise']);
      return;
    }

    this.loadCustomPrompt();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCustomPrompt(): void {
    this.loadingService.show();
    
    this.enterpriseService.getCustomPrompt(this.enterpriseId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingService.hide())
      )
      .subscribe({
        next: (response) => {
          this.customPrompt = response.customPrompt || '';
          this.originalPrompt = this.customPrompt;
          this.clearMessages();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Erro ao carregar o prompt';
          console.error('Erro ao carregar prompt:', error);
        }
      });
  }

  onSave(): void {
    if (!this.customPrompt.trim()) {
      this.errorMessage = 'O prompt não pode estar vazio';
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    const request: UpdatePromptRequest = {
      customPrompt: this.customPrompt.trim()
    };

    this.enterpriseService.updateCustomPrompt(this.enterpriseId, request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: () => {
          this.originalPrompt = this.customPrompt;
          this.successMessage = 'Prompt salvo com sucesso!';
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Erro ao salvar o prompt';
          console.error('Erro ao salvar prompt:', error);
        }
      });
  }

  onReset(): void {
    this.customPrompt = this.originalPrompt;
    this.clearMessages();
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}