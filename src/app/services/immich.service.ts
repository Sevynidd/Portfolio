import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';

import { IMMICH_BASE_URL } from './immich.config';

export interface ImmichImage {
  id: string;
  thumbUrl: string;
  fullUrl: string;
  altText: string;
}

interface ImmichAsset {
  id: string;
  originalFileName?: string;
}

interface ImmichSharedLinkResponse {
  assets?: ImmichAsset[];
  album?: { id: string };
}

interface ImmichSearchMetadataResponse {
  assets: { items: ImmichAsset[] };
}

@Injectable({ providedIn: 'root' })
export class ImmichService {
  private readonly http = inject(HttpClient);

  /**
   * Fetches the assets behind a public Immich shared-link key.
   * INDIVIDUAL-type links include their assets inline; ALBUM-type links
   * don't, so those are resolved via a second search/metadata call.
   * Resolves to [] on any error (missing key, CORS not configured, etc.).
   */
  getSharedImages(
    shareKey: string,
    fallbackAlt: string,
    size: 'thumbnail' | 'preview' = 'thumbnail'
  ): Observable<ImmichImage[]> {
    if (!shareKey) {
      return of([]);
    }

    const keyParam = `key=${encodeURIComponent(shareKey)}`;
    const toImage = (asset: ImmichAsset): ImmichImage => ({
      id: asset.id,
      thumbUrl: `${IMMICH_BASE_URL}/api/assets/${asset.id}/thumbnail?${keyParam}&size=${size}`,
      fullUrl: `${IMMICH_BASE_URL}/api/assets/${asset.id}/thumbnail?${keyParam}&size=preview`,
      altText: asset.originalFileName ?? fallbackAlt
    });

    return this.http.get<ImmichSharedLinkResponse>(`${IMMICH_BASE_URL}/api/shared-links/me?${keyParam}`).pipe(
      switchMap((sharedLink) => {
        if (sharedLink.assets?.length) {
          return of(sharedLink.assets.map(toImage));
        }

        const albumId = sharedLink.album?.id;
        if (!albumId) {
          return of([]);
        }

        return this.http
          .post<ImmichSearchMetadataResponse>(`${IMMICH_BASE_URL}/api/search/metadata?${keyParam}`, {
            albumIds: [albumId]
          })
          .pipe(map((result) => (result.assets?.items ?? []).map(toImage)));
      }),
      catchError(() => of([]))
    );
  }
}
