import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { LightboxComponent } from './components/lightbox.component';

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Karina Kock',
  url: 'https://portfolio.sevynidd.org',
  jobTitle: 'Full-Stack Softwareentwicklerin',
  worksFor: { '@type': 'Organization', name: 'SP_Data GmbH' },
  sameAs: [
    'https://github.com/Sevynidd',
    'https://www.linkedin.com/in/karina-kock-ab272821a/'
  ]
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LightboxComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly document = inject(DOCUMENT);

  protected readonly title = signal('angular-portfolio');
  protected isMenuOpen = signal(false);
  protected isDark = signal(
    this.document.documentElement.getAttribute('data-theme') === 'dark'
  );

  constructor() {
    this.injectStructuredData();

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', (event) => {
      // Only follow the OS setting live if the visitor never explicitly chose a theme here.
      if (localStorage.getItem('theme')) {
        return;
      }
      this.applyTheme(event.matches);
    });
  }

  toggleTheme() {
    this.applyTheme(!this.isDark());
    localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  private applyTheme(dark: boolean): void {
    this.isDark.set(dark);
    this.document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }

  private injectStructuredData(): void {
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(STRUCTURED_DATA);
    this.document.head.appendChild(script);
  }
}
