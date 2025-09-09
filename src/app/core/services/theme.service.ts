import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private key = 'theme';

  constructor(@Inject(DOCUMENT) private doc: Document) {
    const initial = (localStorage.getItem(this.key) as Theme | null) || this.prefers();
    this.apply(initial);
  }

  toggle(): void {
    const next: Theme = this.current() === 'dark' ? 'light' : 'dark';
    this.apply(next);
  }

  current(): Theme {
    const t = (this.doc.documentElement.getAttribute('data-theme') as Theme | null) || 'light';
    return t === 'dark' ? 'dark' : 'light';
  }

  private prefers(): Theme {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private apply(theme: Theme): void {
    this.doc.documentElement.setAttribute('data-theme', theme);
    this.doc.documentElement.style.colorScheme = theme;
    localStorage.setItem(this.key, theme);
  }
}
