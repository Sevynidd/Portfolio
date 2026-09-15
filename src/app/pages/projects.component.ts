import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { LightboxService } from '../services/lightbox.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  protected readonly lightbox = inject(LightboxService);

  private readonly expanded = signal<Set<string>>(new Set());

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
