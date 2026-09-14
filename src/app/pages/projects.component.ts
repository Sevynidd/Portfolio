import { Component, inject } from '@angular/core';

import { LightboxService } from '../services/lightbox.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  protected readonly lightbox = inject(LightboxService);
}
