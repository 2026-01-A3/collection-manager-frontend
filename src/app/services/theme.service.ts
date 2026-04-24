import { Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'acervo-theme';
  readonly theme = signal<Theme>('light');

  constructor() {
    const saved = this.readStored();
    const initial: Theme = saved ?? (this.prefersDark() ? 'dark' : 'light');
    this.apply(initial, { persist: saved !== null });
  }

  toggle(): void {
    this.apply(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.apply(theme);
  }

  private apply(theme: Theme, opts: { persist?: boolean } = { persist: true }): void {
    this.theme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (opts.persist !== false) {
      try {
        localStorage.setItem(this.STORAGE_KEY, theme);
      } catch {}
    }
  }

  private readStored(): Theme | null {
    try {
      const v = localStorage.getItem(this.STORAGE_KEY);
      return v === 'dark' || v === 'light' ? v : null;
    } catch {
      return null;
    }
  }

  private prefersDark(): boolean {
    return typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
