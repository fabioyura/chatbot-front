// src/app/features/enterprise/pages/prompt-editor/prompt-editor.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { EnterpriseService } from '../../../../core/services/enterprise.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { UpdatePromptRequest } from '../../../../core/models/enterprise.model';
import { Conversation } from '../../../../core/models/conversation.model';
import { QrCodeDisplayComponent } from '../../../../shared/components/qr-code-display/qr-code-display.component';
import { ConversationDetailModalComponent } from '../../components/conversation-detail-modal/conversation-detail-modal.component';

@Component({
  selector: 'app-prompt-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, QrCodeDisplayComponent, ConversationDetailModalComponent],
  template: `
    <div class="container">
      <!-- Conversation Detail Modal -->
      <app-conversation-detail-modal
        *ngIf="isConversationModalOpen"
        [isOpen]="isConversationModalOpen"
        [conversationId]="selectedConversationId"
        [enterpriseId]="enterpriseId"
        (closeModal)="closeConversationModal()">
      </app-conversation-detail-modal>
      <div class="page-header">
        <div class="header-actions">
        
        </div>
        <h1>Painel da Empresa</h1>
        <p *ngIf="enterpriseName">Empresa: <code>{{ enterpriseName }}</code></p>
      </div>

      <div class="main-layout">
        <!-- Left Column - Prompt Editor & Conversations -->
        <div class="left-column">
          <!-- Prompt Editor -->
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
                    rows="8"
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
          <div class="status-messages" *ngIf="successMessage || errorMessage">
            <div class="alert alert-success" *ngIf="successMessage">
              {{ successMessage }}
            </div>
            <div class="alert alert-error" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>
          </div>

          <!-- Conversations Section -->
          <div class="card conversations-card">
            <div class="card-header">
              <h2 class="card-title">Conversas</h2>
              <button 
                class="btn btn-outline"
                (click)="toggleConversations()"
                [disabled]="isLoadingConversations">
                <span *ngIf="isLoadingConversations" class="spinner-sm"></span>
                {{ showConversations ? 'Ocultar' : 'Ver Conversas' }}
              </button>
            </div>
            
            <div class="card-body" *ngIf="showConversations">
              <!-- Loading State -->
              <div *ngIf="isLoadingConversations" class="loading-state">
                <div class="spinner"></div>
                <p>Carregando conversas...</p>
              </div>

              <!-- Empty State -->
              <div *ngIf="!isLoadingConversations && conversations.length === 0" class="empty-state">
                <div class="empty-icon">💬</div>
                <h3>Nenhuma conversa encontrada</h3>
                <p>Quando os clientes começarem a conversar, elas aparecerão aqui.</p>
              </div>

              <!-- Conversations List -->
              <div *ngIf="!isLoadingConversations && conversations.length > 0" class="conversations-list">
                <div 
                  *ngFor="let conversation of conversations; trackBy: trackByConversationId"
                  class="conversation-item"
                  (click)="viewConversationDetails(conversation.id)">
                  
                  <div class="conversation-header">
                    <div class="user-info">
                      <div class="user-avatar">
                        {{ getUserInitials(conversation.userName) }}
                      </div>
                      <div class="user-details">
                        <h4 class="user-name">{{ conversation.userName || 'Usuário Anônimo' }}</h4>
                        <p class="user-phone">{{ formatPhone(conversation.userPhone) }}</p>
                      </div>
                    </div>
                    
                    <div class="conversation-meta">
                      <div class="status-badges">
                        <span 
                          class="status-badge"
                          [class.active]="conversation.isActive"
                          [class.inactive]="!conversation.isActive">
                          {{ conversation.isActive ? 'Ativa' : 'Finalizada' }}
                        </span>
                        <span *ngIf="conversation.leadQualification" 
                              class="lead-badge"
                              [attr.data-status]="getLeadStatusText(conversation.leadQualification.status)">
                          {{ getLeadStatusText(conversation.leadQualification.status) }}
                        </span>
                      </div>
                      <div class="conversation-stats">
                        <span class="message-count">{{ conversation.messageCount }} mensagens</span>
                        <span class="last-interaction">{{ formatDate(conversation.lastInteractionAt) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="conversation-preview" *ngIf="conversation.leadQualification?.analysisSummary">
                    <p class="analysis-summary">{{ conversation.leadQualification?.analysisSummary }}</p>
                    
                    <div class="lead-tags" *ngIf="conversation.leadQualification?.tags?.length">
                      <span 
                        *ngFor="let tag of conversation.leadQualification?.tags?.slice(0, 3)" 
                        class="tag">
                        {{ tag.value }}
                      </span>
                      <span *ngIf="(conversation.leadQualification?.tags?.length || 0) > 3" class="tag-more">
                        +{{ (conversation.leadQualification?.tags?.length || 0) - 3 }}
                      </span>
                    </div>
                  </div>

                  <div class="conversation-actions">
                    <button class="btn-action" (click)="viewConversationDetails(conversation.id); $event.stopPropagation()">
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>

              <!-- Load More (Future Enhancement) -->
              <div *ngIf="conversations.length > 0" class="load-more-section">
                <button class="btn btn-outline load-more-btn" disabled>
                  Carregando mais conversas em breve...
                </button>
              </div>
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

    .main-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
      align-items: start;
    }

    .left-column {
      max-width: 900px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .qr-sidebar {
      position: sticky;
      top: 2rem;
    }

    .form-control {
      resize: vertical;
      min-height: 180px;
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

    /* Conversations Styles */
    .conversations-card .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-secondary);
    }

    .empty-state .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    .conversations-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .conversation-item {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      background-color: var(--background-secondary);
    }

    .conversation-item:hover {
      border-color: var(--primary-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .conversation-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
    }

    .user-details h4 {
      margin: 0 0 0.25rem 0;
      color: var(--text-primary);
      font-size: 1.1rem;
    }

    .user-details p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .conversation-meta {
      text-align: right;
    }

    .status-badges {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      justify-content: flex-end;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.active {
      background-color: rgba(16, 185, 129, 0.2);
      color: var(--success-color);
    }

    .status-badge.inactive {
      background-color: rgba(107, 114, 128, 0.2);
      color: var(--text-secondary);
    }

    .lead-badge {
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .lead-badge[data-status="baixo"] {
      background-color: rgba(239, 68, 68, 0.2);
      color: var(--error-color);
    }

    .lead-badge[data-status="médio"] {
      background-color: rgba(245, 158, 11, 0.2);
      color: #d97706;
    }

    .lead-badge[data-status="alto"] {
      background-color: rgba(16, 185, 129, 0.2);
      color: var(--success-color);
    }

    .conversation-stats {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .conversation-preview {
      margin-bottom: 1rem;
    }

    .analysis-summary {
      margin: 0 0 1rem 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .lead-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
      padding: 0.25rem 0.75rem;
      background-color: var(--background-tertiary);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .tag-more {
      padding: 0.25rem 0.75rem;
      background-color: var(--primary-color);
      color: white;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
    }

    .conversation-actions {
      display: flex;
      justify-content: flex-end;
    }

    .btn-action {
      padding: 0.5rem 1rem;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .btn-action:hover {
      background-color: var(--primary-hover);
    }

    .load-more-section {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .load-more-btn {
      width: 100%;
    }

    .spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      display: inline-block;
      margin-right: 0.5rem;
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
      .main-layout {
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

      .main-layout {
        gap: 1rem;
      }

      .conversation-header {
        flex-direction: column;
        gap: 1rem;
      }

      .conversation-meta {
        text-align: left;
        width: 100%;
      }

      .status-badges {
        justify-content: flex-start;
      }

      .conversations-card .card-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .conversations-card .card-header .btn {
        width: 100%;
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class PromptEditorComponent implements OnInit, OnDestroy {
  enterpriseId: string = '';
  enterpriseName: string = '';
  customPrompt: string = '';
  originalPrompt: string = '';
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  // Conversations
  conversations: Conversation[] = [];
  showConversations: boolean = false;
  isLoadingConversations: boolean = false;

  // Modal de Detalhes da Conversa
  isConversationModalOpen: boolean = false;
  selectedConversationId: string = '';

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
    
    this.enterpriseService.getEnterpriseById(this.enterpriseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (enterprise) => {
          this.enterpriseName = enterprise.name || this.enterpriseId;
        },
        error: () => {
          this.enterpriseName = this.enterpriseId;
        }
      });
    
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

  toggleConversations(): void {
    this.showConversations = !this.showConversations;
    
    if (this.showConversations && this.conversations.length === 0) {
      this.loadConversations();
    }
  }

  private loadConversations(): void {
    this.isLoadingConversations = true;
    
    this.enterpriseService.getConversationsByEnterpriseId(this.enterpriseId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingConversations = false)
      )
      .subscribe({
        next: (conversations) => {
          this.conversations = conversations;
        },
        error: (error) => {
          console.error('Erro ao carregar conversas:', error);
          this.errorMessage = 'Erro ao carregar conversas';
        }
      });
  }

  viewConversationDetails(conversationId: string): void {
    this.selectedConversationId = conversationId;
    this.isConversationModalOpen = true;
  }

  closeConversationModal(): void {
    this.isConversationModalOpen = false;
    this.selectedConversationId = '';
  }

  trackByConversationId(index: number, conversation: Conversation): string {
    return conversation.id;
  }

  getUserInitials(userName: string): string {
    if (!userName) return 'U';
    
    const names = userName.trim().split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  formatPhone(phone: string): string {
    if (!phone) return 'Telefone não informado';
    
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Brazilian phone format
    if (cleaned.length === 13 && cleaned.startsWith('55')) {
      // +55 11 99999-9999
      return `+55 ${cleaned.substring(2, 4)} ${cleaned.substring(4, 9)}-${cleaned.substring(9)}`;
    } else if (cleaned.length === 11) {
      // 11 99999-9999
      return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    }
    
    return phone;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Data não disponível';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora há pouco';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else if (diffInHours < 48) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }

  getLeadStatusText(status: number): string {
    const statusMap: { [key: number]: string } = {
      1: 'baixo',
      2: 'baixo', 
      3: 'médio',
      4: 'alto',
      5: 'alto'
    };
    
    return statusMap[status] || 'desconhecido';
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