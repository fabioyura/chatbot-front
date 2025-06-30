import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingService } from '../../../../core/services/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container">
      <div class="login-card">
        <h1>Login</h1>
        <form (ngSubmit)="onLogin()" #loginForm="ngForm" autocomplete="off">
          <div class="form-group">
            <label for="emailOrCpf">E-mail ou CPF</label>
            <input
              id="emailOrCpf"
              name="emailOrCpf"
              type="text"
              [(ngModel)]="emailOrCpf"
              required
              autocomplete="username"
              [class.invalid]="submitted && !emailOrCpf"
              placeholder="Digite seu e-mail ou CPF" />
          </div>
          <div class="form-group">
            <label for="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              [(ngModel)]="password"
              required
              minlength="8"
              autocomplete="current-password"
              [class.invalid]="submitted && !isPasswordValid()"
              placeholder="Digite sua senha" />
            <small *ngIf="submitted && !isPasswordValid()" class="error-text">
              A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número.
            </small>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="loadingService.isLoading">
              Entrar
            </button>
          </div>
          <div *ngIf="errorMessage" class="alert alert-error">{{ errorMessage }}</div>
        </form>
      </div>
      <app-loading-spinner></app-loading-spinner>
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
      height: 100vh;
      padding: 1rem;
    }
    .login-card {
      background-color: var(--background-primary);
      padding: 3rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-md);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    h1 {
      font-size: 2rem;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
      text-align: left;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    input {
      width: 100%;
      padding: 0.75rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--gray-400);
      font-size: 1rem;
      color: var(--text-primary);
      background: var(--background-secondary);
      transition: border-color 0.2s;
    }
    input.invalid {
      border-color: var(--error-color);
    }
    .form-actions {
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .btn.btn-primary {
      width: 100%;
      padding: 0.75rem;
      font-size: 1rem;
      border-radius: var(--radius-md);
      background: var(--red-to-pink-to-purple-horizontal-gradient);
      color: #fff;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn.btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .alert.alert-error {
      background-color: rgba(239, 68, 68, 0.1);
      color: var(--error-color);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: var(--radius-md);
      padding: 0.75rem;
      margin-top: 1rem;
      font-size: 0.95rem;
    }
    .error-text {
      color: var(--error-color);
      font-size: 0.85rem;
      margin-top: 0.25rem;
      display: block;
    }
    @media (max-width: 600px) {
      .login-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class EnterprisePromptFinderComponent {
  emailOrCpf = '';
  password = '';
  errorMessage = '';
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    public loadingService: LoadingService
  ) {}

  isPasswordValid(): boolean {
    const value = this.password;
    return (
      value.length >= 8 /*&&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value)*/
    );
  }

  onLogin() {
    this.submitted = true;
    this.errorMessage = '';
    if (!this.emailOrCpf || !this.isPasswordValid()) {
      return;
    }
    this.loadingService.show();
    this.authService.login(this.emailOrCpf, this.password).subscribe({
      next: (res: any) => {
        this.loadingService.hide();
        this.router.navigate(['/enterprise', res.enterpriseId, 'prompt']);
      },
      error: (err: any) => {
        this.loadingService.hide();
        this.errorMessage = err?.error?.message || 'Falha ao autenticar. Verifique suas credenciais.';
      }
    });
  }
} 