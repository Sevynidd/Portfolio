import { Component, OnInit, inject, isDevMode, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ImmichImage, ImmichService } from '../services/immich.service';
import { IMMICH_SHARE_KEYS } from '../services/immich.config';
import { LightboxService } from '../services/lightbox.service';

/**
 * Local placeholder photos shown only in dev builds when the real Immich
 * fetch comes back empty (expected in local dev, since CORS is scoped to
 * the production origin) - lets the gallery layout be checked without a
 * live connection to Immich.
 */
function createMockImages(count: number, label: string): ImmichImage[] {
  const colors = ['#e879f9', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

  return Array.from({ length: count }, (_, i) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="200" height="200" fill="${colors[i % colors.length]}"/>
      <text x="50%" y="50%" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif">#${i + 1}</text>
    </svg>`;

    const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;

    return {
      id: `mock-${label}-${i}`,
      thumbUrl: dataUrl,
      fullUrl: dataUrl,
      altText: `Platzhalter ${label} ${i + 1}`
    };
  });
}

interface SkillEra {
  range: string;
  context: string;
  title: string;
  skills: string[];
}

interface WorkingPrinciple {
  title: string;
  description: string;
}

interface ReadingItem {
  type: string;
  title: string;
  description: string;
  url?: string;
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
  protected readonly lightbox = inject(LightboxService);

  readonly haekelnImages = signal<ImmichImage[]>([]);
  readonly zeichnenImages = signal<ImmichImage[]>([]);

  readonly profilePicUrl = signal<string | null>(null);

  readonly workingPrinciples: WorkingPrinciple[] = [
    {
      title: 'Pragmatisch statt perfekt',
      description: 'Ich liefere lieber eine funktionierende Lösung, die ich danach iterativ verbessere, als lange auf die perfekte Architektur zu warten.',
    },
    {
      title: 'Code für Menschen',
      description: 'Lesbarer, klar strukturierter Code ist mir wichtiger als clevere Einzeiler — vor allem, wenn andere ihn später warten müssen.',
    },
    {
      title: 'Neugier als Werkzeug',
      description: 'Neue Frameworks und Sprachen probiere ich am liebsten direkt an einem kleinen Hobby-Projekt aus, bevor ich sie produktiv einsetze.',
    },
    {
      title: 'Kommunikation zählt',
      description: 'Ob im Scrum-Team oder in der Zusammenarbeit an Lumi — kurze Feedbackschleifen sparen am Ende allen Beteiligten Zeit.',
    },
  ];

  readonly skillsTimeline: SkillEra[] = [
    {
      range: '2018 – 2021',
      context: 'August-Griese-Berufskolleg',
      title: 'Grundlagen',
      skills: ['Informatik-Grundlagen', 'Datenbanken', 'Mikrocontrollertechnik'],
    },
    {
      range: '2021 – 2024',
      context: 'SP_Data GmbH · Ausbildung',
      title: 'Fachinformatikerin Anwendungsentwicklung',
      skills: ['Delphi / Pascal', 'MS SQL Server', 'Software-Wartung'],
    },
    {
      range: 'Seit 2024',
      context: 'SP_Data GmbH',
      title: 'Full-Stack Softwareentwicklerin',
      skills: ['Python', 'Kotlin', 'Angular', 'Tailwind CSS'],
    },
  ];

  readonly readingList: ReadingItem[] = [
    {
      type: 'Doku',
      title: 'Angular Signals & Zoneless Change Detection',
      description: 'Vertiefung in den reaktiven Ansatz von Angular, um ihn in kommenden Projekten konsequenter zu nutzen.',
      url: 'https://angular.dev/guide/signals',
    },
    {
      type: 'Praxis',
      title: 'Kotlin Coroutines',
      description: 'Asynchrone Datenverarbeitung abseits von Jetpack Compose — relevant für den nächsten BolusManager-Ausbau.',
      url: 'https://kotlinlang.org/docs/coroutines-overview.html',
    },
    {
      type: 'Konzept',
      title: 'Clean Architecture in kleinen Projekten',
      description: 'Wie viel Struktur sich für Hobby-Projekte lohnt, ohne sie zu überladen.',
    },
  ];

  ngOnInit(): void {
    this.loadGallery(IMMICH_SHARE_KEYS.haekeln, 'Häkelarbeit', this.haekelnImages);
    this.loadGallery(IMMICH_SHARE_KEYS.zeichnen, 'Zeichnung', this.zeichnenImages);

    this.immich.getSharedImages(IMMICH_SHARE_KEYS.profilePic, 'Profilbild', 'preview').subscribe((images) => {
      if (images.length > 0) {
        this.profilePicUrl.set(images[0].thumbUrl);
      }
    });
  }

  private loadGallery(
    shareKey: string,
    label: string,
    target: ReturnType<typeof signal<ImmichImage[]>>
  ): void {
    this.immich.getSharedImages(shareKey, label).subscribe((images) => {
      if (images.length === 0 && isDevMode()) {
        target.set(createMockImages(8, label));
      } else {
        target.set(images);
      }
    });
  }
}
