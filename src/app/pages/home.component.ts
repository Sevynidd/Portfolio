import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor() {
    inject(SeoService).update({
      title: 'Startseite',
      description: 'Full-Stack Softwareentwicklerin — Portfolio mit Projekten, Lebenslauf und Kontaktmöglichkeit.',
      path: '/'
    });
  }
}
