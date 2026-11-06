import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent {
  protected readonly path = inject(Router).url;

  constructor() {
    inject(SeoService).update({
      title: 'Seite nicht gefunden',
      description: 'Diese Seite existiert nicht.',
      path: '/404'
    });
  }
}
