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

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  HTML: '#e34c26',
  CSS: '#663399',
  SCSS: '#c6538c',
  Kotlin: '#a97bff',
  Java: '#b07219',
  Python: '#3572a5',
  Pascal: '#e3f171',
  'C#': '#178600',
  Shell: '#89e051'
};

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


  isVisible(id: string): boolean {
    return this.visibleIds().has(id);
  }

  /** Number of projects in a category, independent of the active filter. */
  categoryCount(category: string): number {
    return category === 'Alle' ? PROJECTS_META.length : PROJECTS_META.filter((p) => p.category === category).length;
  }

  /** GitHub-style dot colour for a language name from the GitHub API. */
  languageColor(language: string | null): string {
    return LANGUAGE_COLORS[language ?? ''] ?? '#8b93a7';
  }

  /** Opens the screenshot matching the active theme in the lightbox. */
  openShot(base: string, alt: string): void {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    this.lightbox.open(`assets/images/projects/${base}_${dark ? 'dark' : 'light'}.png`, alt);
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
