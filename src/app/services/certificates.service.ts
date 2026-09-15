import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, shareReplay } from 'rxjs';

export interface CertificateFile {
  name: string;
  size: number;
  lastModified: string | null;
}

const LIST_ENDPOINT = '/api/certificates';

@Injectable({ providedIn: 'root' })
export class CertificatesService {
  private readonly http = inject(HttpClient);

  // Proxied through the portfolio's own Cloudflare Worker (same-origin) so the
  // WebDAV credentials never reach the browser. Only reachable on the real
  // deployed domain - resolves to the graceful "unavailable" state in local dev.
  private readonly certificates$: Observable<CertificateFile[] | null> = this.http
    .get<CertificateFile[]>(LIST_ENDPOINT)
    .pipe(
      catchError(() => of(null)),
      shareReplay(1)
    );

  getCertificates(): Observable<CertificateFile[] | null> {
    return this.certificates$;
  }

  downloadUrl(name: string): string {
    return `${LIST_ENDPOINT}/${encodeURIComponent(name)}`;
  }
}
