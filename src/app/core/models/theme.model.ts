// src/app/core/models/theme.model.ts
export type Theme = 'light' | 'dark';

export interface ThemeConfig {
  theme: Theme;
  autoDetect: boolean;
}