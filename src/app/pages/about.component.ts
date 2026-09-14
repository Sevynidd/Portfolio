import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ImmichImage, ImmichService } from '../services/immich.service';
import { IMMICH_SHARE_KEYS } from '../services/immich.config';

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
      .subscribe((images) => this.haekelnImages.set(images));
  }
}
