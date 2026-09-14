import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';

import { IMMICH_BASE_URL } from './immich.config';

export interface ImmichImage {
  id: string;
  thumbUrl: string;
  altText: string;
}

interface ImmichAsset {
  id: string;
  originalFileName?: string;
}

interface ImmichSharedLinkResponse {
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
   * Shared links of type ALBUM don't include assets inline, so this first
   * resolves the album id, then queries search/metadata for its assets.
   * Resolves to [] on any error (missing key, CORS not configured, etc.).
   */
  getSharedAlbumImages(shareKey: string, fallbackAlt: string): Observable<ImmichImage[]> {
    if (!shareKey) {
      return of([]);
    }

    const keyParam = `key=${encodeURIComponent(shareKey)}`;

    return this.http.get<ImmichSharedLinkResponse>(`${IMMICH_BASE_URL}/api/shared-links/me?${keyParam}`).pipe(
      switchMap((sharedLink) => {
        const albumId = sharedLink.album?.id;
        if (!albumId) {
          return of([]);
        }

        return this.http
          .post<ImmichSearchMetadataResponse>(`${IMMICH_BASE_URL}/api/search/metadata?${keyParam}`, {
            albumIds: [albumId]
          })
          .pipe(
            map((result) =>
              (result.assets?.items ?? []).map((asset) => ({
                id: asset.id,
                thumbUrl: `${IMMICH_BASE_URL}/api/assets/${asset.id}/thumbnail?${keyParam}&size=thumbnail`,
                altText: asset.originalFileName ?? fallbackAlt
              }))
            )
          );
      }),
      catchError(() => of([]))
    );
  }
}
