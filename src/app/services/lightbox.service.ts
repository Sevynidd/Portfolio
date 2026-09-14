import { Injectable, signal } from '@angular/core';

export interface LightboxImage {
  src: string;
  alt: string;
}

@Injectable({ providedIn: 'root' })
export class LightboxService {
  readonly image = signal<LightboxImage | null>(null);

  open(src: string, alt: string): void {
    this.image.set({ src, alt });
  }

  close(): void {
    this.image.set(null);
  }
}
