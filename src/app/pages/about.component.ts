import { Component, OnInit, inject, isDevMode, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ImmichImage, ImmichService } from '../services/immich.service';
import { IMMICH_SHARE_KEYS } from '../services/immich.config';

/**
 * Local placeholder photos shown only in dev builds when the real Immich
 * fetch comes back empty (expected in local dev, since CORS is scoped to
 * the production origin) - lets the gallery layout be checked without a
 * live connection to Immich.
 */
function createMockHaekelnImages(count: number): ImmichImage[] {
  const colors = ['#e879f9', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

  return Array.from({ length: count }, (_, i) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="200" height="200" fill="${colors[i % colors.length]}"/>
      <text x="50%" y="50%" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif">#${i + 1}</text>
    </svg>`;

    return {
      id: `mock-${i}`,
      thumbUrl: `data:image/svg+xml,${encodeURIComponent(svg)}`,
      altText: `Platzhalter Häkelbild ${i + 1}`
    };
  });
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  private readonly immich = inject(ImmichService);

  readonly haekelnImages = signal<ImmichImage[]>([]);

  ngOnInit(): void {
    this.immich
      .getSharedAlbumImages(IMMICH_SHARE_KEYS.haekeln, 'Häkelarbeit')
      .subscribe((images) => {
        if (images.length === 0 && isDevMode()) {
          this.haekelnImages.set(createMockHaekelnImages(8));
        } else {
          this.haekelnImages.set(images);
        }
      });
  }
}
