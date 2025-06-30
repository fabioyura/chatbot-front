// src/app/features/enterprise/components/qr-code-display/qr-code-display.component.ts
// MUDAR DE PASTA - TIRAR DE SHARED
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize, interval } from 'rxjs';
import { EnterpriseService } from '../../../core/services/enterprise.service';

@Component({
  selector: 'app-qr-code-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qr-code-container">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">QR Code WhatsApp</h3>
          <div class="header-actions">
            <button 
              class="btn btn-sm btn-secondary"
              (click)="refreshQrCode()"
              [disabled]="isLoading">
              <span *ngIf="isLoading" class="spinner-sm"></span>
              <span *ngIf="!isLoading">🔄</span>
              {{ isLoading ? 'Carregando...' : 'Atualizar' }}
            </button>
          </div>
        </div>

        <div class="card-body">
          <!-- Loading State -->
          <div *ngIf="isLoading && !qrCodeData" class="loading-state">
            <div class="spinner"></div>
            <p>Gerando QR Code...</p>
          </div>

          <!-- QR Code Display -->
          <div *ngIf="qrCodeData && !errorMessage" class="qr-code-display">
            <div class="qr-image-container">
              <img 
                [src]="qrCodeData" 
                alt="QR Code WhatsApp"
                class="qr-image"
                (error)="onImageError()"
                (load)="onImageLoad()">
            </div>
            
            <div class="qr-info">
              <p class="info-text">
                <strong>📱 Escaneie com seu WhatsApp</strong>
              </p>
              <p class="subtitle">
                1. Abra o WhatsApp no seu celular<br>
                2. Vá em Configurações > Aparelhos conectados<br>
                3. Toque em "Conectar um aparelho"<br>
                4. Aponte a câmera para este código
              </p>
              
              <div class="status-info">
                <span class="status-badge">
                  <span class="status-dot"></span>
                  {{statusText}}
                </span>
                <small class="last-updated">
                  Gerado em: {{ lastUpdated | date:'dd/MM/yyyy HH:mm:ss' }}
                </small>
              </div>
            </div>
          </div>

          <!-- Connected State -->
<div *ngIf="statusText === 'Conectado' && !qrCodeData" class="connected-state">
  <div class="success-icon">✅</div>
  <h4 class="success-title">WhatsApp Conectado!</h4>
  <p class="success-message">
    Sua instância do WhatsApp está conectada e funcionando.
  </p>
  
  <div class="connection-info">
    <div class="info-item">
      <span class="info-label">Status:</span>
      <span class="status-badge connected">
        <span class="status-dot connected"></span>
        Conectado
      </span>
    </div>
    <div class="info-item">
      <span class="info-label">Última verificação:</span>
      <span class="info-value">{{ lastUpdated | date:'dd/MM/yyyy HH:mm:ss' }}</span>
    </div>
  </div>

  <div class="connected-actions">
    <button class="btn btn-secondary" (click)="refreshQrCode()">
      <span *ngIf="isLoading" class="spinner-sm"></span>
      <span *ngIf="!isLoading">🔄</span>
      {{ isLoading ? 'Verificando...' : 'Verificar Status' }}
    </button>
  </div>
</div>

          <!-- Error State -->
          <div *ngIf="errorMessage" class="error-state">
            <div class="error-icon">⚠️</div>
            <h4>Não foi possível gerar o QR Code</h4>
            <p class="error-message">{{ errorMessage }}</p>
            <button class="btn btn-primary" (click)="refreshQrCode()">
              Tentar novamente
            </button>
          </div>

          <!-- Auto-refresh Info -->
<div *ngIf="autoRefreshEnabled && (qrCodeData || statusText === 'Conectado')" class="auto-refresh-info">
  <small>
    🔄 {{ statusText === 'Conectado' ? 'Verificação' : 'Atualização' }} automática em {{ autoRefreshCountdown }}s
  </small>
</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .qr-code-container {
      max-width: 400px;
      margin: 0 auto;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .card-title {
      margin: 0;
      font-size: 1.25rem;
      color: var(--text-primary);
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .card-body {
      padding: 1.5rem;
    }

    .loading-state {
      text-align: center;
      padding: 2rem;
    }

    .loading-state .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border-color);
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    .qr-code-display {
      text-align: center;
    }

    .qr-image-container {
      background: white;
      padding: 1rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: inline-block;
    }

    .qr-image {
      width: 250px;
      height: 250px;
      display: block;
      border-radius: var(--radius-sm);
    }

    .qr-info {
      text-align: left;
    }

    .info-text {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .status-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: var(--radius-full);
      font-size: 0.875rem;
      color: var(--primary-color);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--primary-color);
      animation: pulse 2s infinite;
    }

    .last-updated {
      color: var(--text-tertiary);
      font-size: 0.75rem;
    }

    .error-state {
      text-align: center;
      padding: 2rem;
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .error-state h4 {
      color: var(--error-color);
      margin-bottom: 0.5rem;
    }

    .error-message {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    .auto-refresh-info {
      text-align: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
      color: var(--text-tertiary);
    }

    .spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @media (max-width: 480px) {
      .qr-code-container {
        max-width: 100%;
      }

      .qr-image {
        width: 200px;
        height: 200px;
      }

      .status-info {
        flex-direction: column;
        align-items: flex-start;
      }

      .connected-state {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05));
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: var(--radius-lg);
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 0.6s ease-in-out;
}

.success-title {
  color: var(--success-color, #16a34a);
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.success-message {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 1rem;
}

.connection-info {
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(34, 197, 94, 0.1);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: var(--text-primary);
}

.info-value {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.status-badge.connected {
  background-color: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: var(--success-color, #16a34a);
}

.status-dot.connected {
  background-color: var(--success-color, #16a34a);
  animation: pulse-success 2s infinite;
}

.connected-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -10px, 0);
  }
  70% {
    transform: translate3d(0, -5px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

@keyframes pulse-success {
  0%, 100% { 
    opacity: 1; 
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% { 
    opacity: 0.7;
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0);
  }
}
    }
  `]
})
export class QrCodeDisplayComponent implements OnInit, OnDestroy {
  @Input() enterpriseId: string = '';
  
  qrCodeData: string = '';
  statusText: string = '';
  statusClass: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  lastUpdated: Date = new Date();
  autoRefreshEnabled: boolean = true;
  autoRefreshCountdown: number = 20;

  private destroy$ = new Subject<void>();
  private autoRefreshTimer$ = new Subject<void>();

  constructor(private enterpriseService: EnterpriseService) {}

  ngOnInit(): void {
    if (this.enterpriseId) {
      this.loadQrCode();
      this.startAutoRefresh();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.autoRefreshTimer$.next();
    this.autoRefreshTimer$.complete();
  }

  loadQrCode(): void {
    if (!this.enterpriseId) {
      this.errorMessage = 'ID da empresa não fornecido';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.enterpriseService.getQrCode(this.enterpriseId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
  next: (response) => {
    if (response.connected) {
      this.errorMessage = '';
      this.qrCodeData = '';
      this.statusText = 'Conectado';
      this.statusClass = 'connected';
    }
    else if (response.qrCodeBase64) {
      this.errorMessage = '';
      this.qrCodeData = response.qrCodeBase64;
      this.lastUpdated = new Date();
      this.statusText = 'Aguardando conexão';
      this.statusClass = 'waiting';
    }
    else {
      this.errorMessage = 'QR Code não disponível';
    }
  },
        error: (error) => {
          this.errorMessage = error.message || 'Erro ao carregar QR Code';
          this.qrCodeData = '';
          console.error('Erro ao carregar QR Code:', error);
        }
      });
  }

  refreshQrCode(): void {
    this.loadQrCode();
    this.resetAutoRefreshTimer();
  }

  onImageError(): void {
    this.errorMessage = 'Erro ao carregar a imagem do QR Code';
    this.qrCodeData = '';
  }

  onImageLoad(): void {
    // QR code carregado com sucesso
  }

private startAutoRefresh(): void {
  if (!this.autoRefreshEnabled) return;

  // Timer de countdown
  interval(1000)
    .pipe(takeUntil(this.autoRefreshTimer$))
    .subscribe(() => {
      this.autoRefreshCountdown--;
      
      if (this.autoRefreshCountdown <= 0) {
        this.loadQrCode();
        // Se conectado, usar intervalo maior para economizar recursos
        const refreshInterval = this.statusText === 'Conectado' ? 60 : 30;
        this.resetAutoRefreshTimer(refreshInterval);
      }
    });
}
private resetAutoRefreshTimer(interval: number = 30): void {
  this.autoRefreshCountdown = interval;
  this.autoRefreshTimer$.next();
  
  if (this.autoRefreshEnabled) {
    this.startAutoRefresh();
  }
}
}