import { Component, HostListener, inject } from '@angular/core';

import { LightboxService } from '../services/lightbox.service';

@Component({
  selector: 'app-lightbox',
  standalone: true,
  templateUrl: './lightbox.component.html'
})
export class LightboxComponent {
  protected readonly lightbox = inject(LightboxService);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.lightbox.close();
  }
}
