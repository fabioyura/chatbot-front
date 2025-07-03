// src/app/shared/components/conversation-detail-modal/conversation-detail-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';
import { Conversation, Message } from '../../../../core/models/conversation.model';
import { EnterpriseService } from '../../../../core/services/enterprise.service';


@Component({
  selector: 'app-conversation-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onClose()" *ngIf="isOpen">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="modal-title">
            <h2>Detalhes da Conversa</h2>
            <button class="close-btn" (click)="onClose()" aria-label="Fechar">
              ×
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="modal-body" *ngIf="conversation">
          <!-- User Info -->
          <div class="user-section">
            <div class="user-header">
              <div class="user-avatar">
                {{ getUserInitials(conversation.userName) }}
              </div>
              <div class="user-info">
                <h3>{{ conversation.userName || 'Usuário Anônimo' }}</h3>
                <p>{{ formatPhone(conversation.userPhone) }}</p>
              </div>
              <div class="conversation-controls">
  <div class="conversation-status">
    <span 
      class="status-badge"
      [class.active]="conversation.isActive"
      [class.inactive]="!conversation.isActive">
      {{ conversation.isActive ? 'Bot Ativo' : 'Bot Desativado' }}
    </span>
  </div>
  
  <button 
    class="btn btn-toggle"
    [class.btn-deactivate]="conversation.isActive"
    [class.btn-activate]="!conversation.isActive"
    [disabled]="isTogglingStatus"
    (click)="toggleConversationStatus()"
    [title]="conversation.isActive ? 'Desativar bot para esta conversa' : 'Ativar bot para esta conversa'">
    <span *ngIf="isTogglingStatus" class="spinner-sm"></span>
    <span *ngIf="!isTogglingStatus">
      {{ conversation.isActive ? 'Desativar Bot' : 'Ativar Bot' }}
    </span>
  </button>
</div>
            </div>

            <div class="conversation-meta">
              <div class="meta-item">
                <span class="meta-label">Iniciada em:</span>
                <span class="meta-value">{{ formatDate(conversation.startedAt) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Última interação:</span>
                <span class="meta-value">{{ formatDate(conversation.lastInteractionAt) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Total de mensagens:</span>
                <span class="meta-value">{{ conversation.messageCount }}</span>
              </div>
            </div>
          </div>

          <!-- Lead Qualification -->
          <div class="lead-section" *ngIf="conversation.leadQualification">
            <h4>Qualificação do Lead</h4>
            
            <div class="lead-status">
              <span 
                class="lead-badge"
                [attr.data-status]="getLeadStatusText(conversation.leadQualification.status)">
                {{ getLeadStatusText(conversation.leadQualification.status).toUpperCase() }}
              </span>
              <span class="lead-score">Score: {{ conversation.leadQualification.score }}</span>
            </div>

            <div class="lead-summary" *ngIf="conversation.leadQualification.analysisSummary">
              <h5>Resumo da Análise</h5>
              <p>{{ conversation.leadQualification.analysisSummary }}</p>
            </div>

            <div class="lead-tags" *ngIf="conversation.leadQualification.tags?.length">
              <h5>Tags</h5>
              <div class="tags-container">
                <span 
                  *ngFor="let tag of conversation.leadQualification.tags" 
                  class="tag">
                  <strong>{{ tag.key }}:</strong> {{ tag.value }}
                </span>
              </div>
            </div>
          </div>

          <!-- Messages Section -->
          <div class="messages-section">
            <div class="messages-header">
              <h4>Mensagens</h4>
              <button 
                class="btn btn-outline"
                (click)="toggleMessages()"
                [disabled]="isLoadingMessages">
                <span *ngIf="isLoadingMessages" class="spinner-sm"></span>
                {{ showMessages ? 'Ocultar Mensagens' : 'Carregar Mensagens' }}
              </button>
            </div>

            <!-- Loading Messages -->
            <div *ngIf="isLoadingMessages" class="loading-messages">
              <div class="spinner"></div>
              <p>Carregando mensagens...</p>
            </div>

            <!-- Messages List -->
            <div *ngIf="showMessages && !isLoadingMessages" class="messages-list">
              <div *ngIf="conversation.messages?.length === 0" class="no-messages">
                <p>Nenhuma mensagem encontrada.</p>
              </div>
              
              <div 
                *ngFor="let message of conversation.messages; trackBy: trackByMessageId"
                class="message-item"
                [class.user-message]="message.role === 1"
                [class.bot-message]="message.role === 2">
                
                <div class="message-header">
                  <span class="message-role">
                    {{ message.role === 1 ? 'Usuário' : 'Assistente' }}
                  </span>
                  <span class="message-time">
                    {{ formatDateTime(message.createdAt) }}
                  </span>
                </div>
                
                <div class="message-body">
                  {{ message.body }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onClose()">
            Fechar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .modal-content {
      background: var(--background-primary);
      border-radius: var(--radius-lg);
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 1px solid var(--border-color);
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      background: var(--background-secondary);
    }

    .modal-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title h2 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background-color: var(--background-tertiary);
      color: var(--text-primary);
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      max-height: calc(90vh - 160px);
    }

    .user-section {
      margin-bottom: 2rem;
    }

    .user-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .user-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.3rem;
    }

    .user-info h3 {
      margin: 0 0 0.25rem 0;
      color: var(--text-primary);
      font-size: 1.25rem;
    }

    .user-info p {
      margin: 0;
      color: var(--text-secondary);
    }

    .conversation-status {
      margin-left: auto;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: var(--radius-full);
      font-size: 0.875rem;
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

    .conversation-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 1rem;
      background-color: var(--background-secondary);
      border-radius: var(--radius-md);
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .meta-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .meta-value {
      color: var(--text-primary);
      font-weight: 600;
    }

    .lead-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background-color: var(--background-secondary);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
    }

    .lead-section h4 {
      margin: 0 0 1rem 0;
      color: var(--text-primary);
      font-size: 1.25rem;
    }

    .lead-status {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .lead-badge {
      padding: 0.5rem 1rem;
      border-radius: var(--radius-full);
      font-size: 0.875rem;
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

    .lead-score {
      padding: 0.5rem 1rem;
      background-color: var(--background-tertiary);
      border-radius: var(--radius-md);
      font-weight: 600;
      color: var(--text-primary);
    }

    .lead-summary {
      margin-bottom: 1.5rem;
    }

    .lead-summary h5 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
      font-size: 1rem;
    }

    .lead-summary p {
      margin: 0;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .lead-tags h5 {
      margin: 0 0 0.75rem 0;
      color: var(--text-primary);
      font-size: 1rem;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
      padding: 0.5rem 1rem;
      background-color: var(--background-tertiary);
      border-radius: var(--radius-full);
      font-size: 0.875rem;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }

    .messages-section {
      margin-bottom: 1rem;
    }

    .messages-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .messages-header h4 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.25rem;
    }

    .loading-messages {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
    }

    .messages-list {
      max-height: 400px;
      overflow-y: auto;
      padding: 1rem;
      background-color: var(--background-secondary);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
    }

    .no-messages {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
    }

    .message-item {
      margin-bottom: 1rem;
      padding: 1rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
    }

    .message-item.user-message {
      background-color: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.2);
      margin-left: 2rem;
    }

    .message-item.bot-message {
      background-color: var(--background-tertiary);
      margin-right: 2rem;
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .message-role {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-primary);
    }

    .message-time {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .message-body {
      color: var(--text-primary);
      line-height: 1.5;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid var(--border-color);
      background: var(--background-secondary);
      display: flex;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-outline {
      background-color: transparent;
      color: var(--primary-color);
      border: 1px solid var(--primary-color);
    }

    .btn-outline:hover {
      background-color: var(--primary-color);
      color: white;
    }

    .btn-secondary {
      background-color: var(--text-secondary);
      color: white;
    }

    .btn-secondary:hover {
      background-color: var(--text-primary);
    }

    .spinner, .spinner-sm {
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner {
      width: 24px;
      height: 24px;
    }

    .spinner-sm {
      width: 16px;
      height: 16px;
    }

    .conversation-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

.btn-toggle {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  min-width: 120px;
  justify-content: center;
}

.btn-activate {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
  border-color: var(--success-color);
}

.btn-activate:hover:not(:disabled) {
  background-color: var(--success-color);
  color: white;
}

.btn-deactivate {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
  border-color: var(--error-color);
}

.btn-deactivate:hover:not(:disabled) {
  background-color: var(--error-color);
  color: white;
}

.btn-toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        max-height: 95vh;
      }

      .modal-body {
        padding: 1rem;
      }

      .conversation-meta {
        grid-template-columns: 1fr;
      }

      .user-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .conversation-status {
        margin-left: 0;
      }

      .lead-status {
        flex-direction: column;
        align-items: flex-start;
      }

      .messages-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .message-item.user-message {
        margin-left: 0;
      }

      .message-item.bot-message {
        margin-right: 0;
      }

      .conversation-controls {
    flex-direction: column;
    align-items: stretch;
    margin-left: 0;
    gap: 0.75rem;
  }
  
  .btn-toggle {
    width: 100%;
  }
    }
  `]
})
export class ConversationDetailModalComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() conversationId: string = '';
  @Input() enterpriseId: string = '';
  @Output() closeModal = new EventEmitter<void>();

  conversation: Conversation | null = null;
  showMessages: boolean = false;
  isLoadingMessages: boolean = false;
  isTogglingStatus: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(private enterpriseService: EnterpriseService) {}

  ngOnInit(): void {
    if (this.isOpen && this.conversationId) {
      this.loadConversationDetails();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadConversationDetails(): void {
    this.enterpriseService.getConversationById(this.conversationId, true, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (conversation) => {
          this.conversation = conversation;
        },
        error: (error) => {
          console.error('Erro ao carregar detalhes da conversa:', error);
        }
      });
  }

  toggleMessages(): void {
    this.showMessages = !this.showMessages;
    
    if (this.showMessages && (!this.conversation?.messages || this.conversation.messages.length === 0)) {
      this.loadMessages();
    }
  }

  private loadMessages(): void {
    if (!this.conversationId) return;
    
    this.isLoadingMessages = true;
    
    this.enterpriseService.getConversationById(this.conversationId, true, true)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingMessages = false)
      )
      .subscribe({
        next: (conversation) => {
          if (this.conversation) {
            this.conversation.messages = conversation.messages;
          }
        },
        error: (error) => {
          console.error('Erro ao carregar mensagens:', error);
        }
      });
  }

  onClose(): void {
    this.closeModal.emit();
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
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
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 13 && cleaned.startsWith('55')) {
      return `+55 ${cleaned.substring(2, 4)} ${cleaned.substring(4, 9)}-${cleaned.substring(9)}`;
    } else if (cleaned.length === 11) {
      return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    }
    
    return phone;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Data não disponível';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'Data não disponível';
    
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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

  toggleConversationStatus(): void {
    if (!this.conversation || !this.enterpriseId || this.isTogglingStatus) return;
    
    this.isTogglingStatus = true;
    
    this.enterpriseService.toggleConversationStatus(this.conversation.id, this.enterpriseId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isTogglingStatus = false)
      )
      .subscribe({
        next: () => {
          if (this.conversation) {
            this.conversation.isActive = !this.conversation.isActive;
          }
        },
        error: (error) => {
          console.error('Erro ao alterar status da conversa:', error);
        }
      });
    }
}