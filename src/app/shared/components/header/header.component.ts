// src/app/shared/components/header/header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';
import { Theme } from '../../../core/models/theme.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="brand">
            <a routerLink="/" class="brand-link">
              <div class="logo">
                <span class="logo-icon">🏢</span>
                <span class="logo-text">ChatBot</span>
              </div>
            </a>
          </div>
          
          <nav class="nav" [class.nav-open]="isNavOpen">
            <a 
              routerLink="/enterprise" 
              routerLinkActive="active" 
              class="nav-link"
              (click)="closeNav()">
              <span class="nav-icon">🏢</span>
              Empresas
            </a>
          </nav>
          
          <div class="actions">
            <button 
              class="theme-toggle btn btn-secondary" 
              (click)="toggleTheme()"
              [attr.aria-label]="getThemeToggleLabel()"
              [title]="getThemeToggleLabel()">
              <span class="theme-icon">{{ getThemeIcon() }}</span>
              <span class="theme-text">{{ getThemeText() }}</span>
            </button>
            
            <button 
              class="mobile-menu-toggle btn btn-secondary"
              (click)="toggleNav()"
              [attr.aria-label]="isNavOpen ? 'Fechar menu' : 'Abrir menu'"
              [class.active]="isNavOpen">
              <span class="hamburger"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: var(--background-secondary);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 100;
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 0;
      gap: 2rem;
      position: relative;
    }

    /* Brand */
    .brand-link {
      text-decoration: none;
      color: inherit;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 1.75rem;
      line-height: 1;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
    }

    /* Navigation */
    .nav {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .nav-link {
      color: var(--text-secondary);
      text-decoration: none;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
      
      &:hover {
        color: var(--text-primary);
        background-color: var(--background-tertiary);
      }
      
      &.active {
        color: var(--primary-color);
        background-color: rgba(37, 99, 235, 0.1);
        font-weight: 600;
      }
    }

    .nav-icon {
      font-size: 1.1rem;
    }

    /* Actions */
    .actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: auto;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .theme-icon {
      font-size: 1.1rem;
    }

    .theme-text {
      font-size: 0.875rem;
    }

    /* Mobile Menu Toggle */
    .mobile-menu-toggle {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 2.5rem;
      height: 2.5rem;
      padding: 0;
      background: none;
      border: 1px solid var(--border-color);
    }

    .hamburger {
      position: relative;
      width: 18px;
      height: 2px;
      background-color: var(--text-primary);
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
      
      &::before,
      &::after {
        content: '';
        position: absolute;
        width: 18px;
        height: 2px;
        background-color: var(--text-primary);
        transition: all 0.3s ease;
      }
      
      &::before {
        top: -6px;
      }
      
      &::after {
        bottom: -6px;
      }
    }

    .mobile-menu-toggle.active .hamburger {
      background-color: transparent;
      
      &::before {
        top: 0;
        transform: rotate(45deg);
      }
      
      &::after {
        bottom: 0;
        transform: rotate(-45deg);
      }
    }

    /* Mobile Styles */
    @media (max-width: 768px) {
      .header-content {
        flex-wrap: nowrap;
        gap: 1rem;
      }
      
      .logo-text {
        font-size: 1.25rem;
      }
      
      .theme-text {
        display: none;
      }
      
      .theme-toggle {
        padding: 0.5rem;
        min-width: 2.5rem;
      }
      
      .mobile-menu-toggle {
        display: flex;
      }
      
      .nav {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: var(--background-secondary);
        border-top: 1px solid var(--border-color);
        flex-direction: column;
        gap: 0;
        padding: 1rem 0;
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        box-shadow: var(--shadow-md);
      }
      
      .nav.nav-open {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }
      
      .nav-link {
        padding: 1rem 1.5rem;
        border-radius: 0;
        justify-content: flex-start;
        width: 100%;
        
        &:hover {
          background-color: var(--background-tertiary);
        }
      }
    }

    @media (max-width: 480px) {
      .logo-text {
        display: none;
      }
      
      .header-content {
        padding: 0.75rem 0;
      }
    }

    /* Focus styles for accessibility */
    .brand-link:focus,
    .nav-link:focus,
    .theme-toggle:focus,
    .mobile-menu-toggle:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .nav,
      .hamburger,
      .hamburger::before,
      .hamburger::after {
        transition: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentTheme: Theme = 'light';
  isNavOpen = false;
  private destroy$ = new Subject<void>();

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
      });

    // Close mobile nav when clicking outside
    document.addEventListener('click', this.handleDocumentClick.bind(this));
    
    // Close mobile nav on escape key
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleNav(): void {
    this.isNavOpen = !this.isNavOpen;
  }

  closeNav(): void {
    this.isNavOpen = false;
  }

  getThemeIcon(): string {
    return this.currentTheme === 'light' ? '🌙' : '☀️';
  }

  getThemeText(): string {
    return this.currentTheme === 'light' ? 'Escuro' : 'Claro';
  }

  getThemeToggleLabel(): string {
    return `Alternar para tema ${this.currentTheme === 'light' ? 'escuro' : 'claro'}`;
  }

  private handleDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const header = target.closest('.header');
    
    if (!header && this.isNavOpen) {
      this.closeNav();
    }
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isNavOpen) {
      this.closeNav();
    }
  }
}