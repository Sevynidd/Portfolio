import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { GithubService } from '../services/github.service';
import { LightboxService } from '../services/lightbox.service';
import { SeoService } from '../services/seo.service';

interface ProjectMeta {
  id: string;
  title: string;
  category: string;
  tags: string[];
}

const PROJECTS_META: ProjectMeta[] = [
  { id: 'portfolio', title: 'Dieses Portfolio', category: 'Websites', tags: ['TypeScript', 'Angular', 'Tailwind CSS'] },
  { id: 'lumi', title: 'Lumi Dashboard', category: 'Websites', tags: ['HTML', 'SCSS', 'TypeScript', 'Angular'] },
  { id: 'bolus', title: 'BolusManager', category: 'Mobile Apps', tags: ['Kotlin', 'Jetpack Compose', 'Room'] }
];

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  protected readonly lightbox = inject(LightboxService);
  private readonly githubService = inject(GithubService);

  constructor() {
    inject(SeoService).update({
      title: 'Projekte',
      description: 'Ausgewählte Projekte von Karina Kock — von Web-Dashboards bis zu nativen Android-Apps, mit Case Studies und interaktiven Demos.',
      path: '/projects'
    });
  }

  // ── GitHub-Repositories ──
  protected readonly github = toSignal(this.githubService.getData(), { initialValue: undefined });

  // ── Filter & Suche ──
  protected readonly categories = ['Alle', 'Websites', 'Mobile Apps'];
  protected readonly activeCategory = signal('Alle');
  protected readonly searchTerm = signal('');

  private readonly visibleIds = computed(() => {
    const category = this.activeCategory();
    const term = this.searchTerm().trim().toLowerCase();

    return new Set(
      PROJECTS_META.filter((project) => category === 'Alle' || project.category === category)
        .filter(
          (project) =>
            !term ||
            project.title.toLowerCase().includes(term) ||
            project.tags.some((tag) => tag.toLowerCase().includes(term))
        )
        .map((project) => project.id)
    );
  });

  protected readonly resultCount = computed(() => this.visibleIds().size);
  protected readonly hasResults = computed(() => this.resultCount() > 0);

  protected readonly visibleWebsitesCount = computed(
    () => PROJECTS_META.filter((p) => p.category === 'Websites' && this.visibleIds().has(p.id)).length
  );
  protected readonly visibleMobileCount = computed(
    () => PROJECTS_META.filter((p) => p.category === 'Mobile Apps' && this.visibleIds().has(p.id)).length
  );

  isVisible(id: string): boolean {
    return this.visibleIds().has(id);
  }

  setCategory(category: string): void {
    this.activeCategory.set(category);
  }

  private readonly expanded = signal<Set<string>>(new Set());
  private readonly expandedDemo = signal<Set<string>>(new Set());

  isExpanded(id: string): boolean {
    return this.expanded().has(id);
  }

  toggleCaseStudy(id: string): void {
    const next = new Set(this.expanded());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.expanded.set(next);
  }

  isDemoExpanded(id: string): boolean {
    return this.expandedDemo().has(id);
  }

  toggleDemo(id: string): void {
    const next = new Set(this.expandedDemo());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.expandedDemo.set(next);
  }

  // ── BolusManager: interaktiver Bolus-Rechner (vereinfachte Demo-Logik) ──
  readonly carbs = signal(60);
  readonly breadUnit = signal(12);
  readonly carbMultiplier = signal(2.5);
  readonly currentBg = signal(225);
  readonly targetBg = signal(100);
  readonly correctionFactor = signal(40);

  readonly mealBolus = computed(() => (this.carbs() / this.breadUnit()) * this.carbMultiplier());

  readonly correctionBolus = computed(() => {
    const diff = this.currentBg() - this.targetBg();
    return diff > 0 ? diff / this.correctionFactor() : 0;
  });

  readonly totalBolus = computed(() => this.mealBolus() + this.correctionBolus());

  // ── Lumi Dashboard: interaktive Embed-Vorschau ──
  readonly embedTitle = signal('Willkommen auf dem Server!');
  readonly embedDescription = signal('Lies dir bitte die Regeln durch und hol dir deine Rollen im #rollen-Channel ab.');
  readonly embedColor = signal('#5865f2');
}
