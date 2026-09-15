import STARTING_HTML from './starting.html';

/**
 * DNS-only (grey-clouded) record pointing at the same origin server as the
 * proxied hostname. Using cf.resolveOverride instead of routing straight to
 * this hostname keeps the original Host header intact, and keeps this fetch
 * from re-entering this same Worker route (which a plain fetch(request)
 * would do, since the request's URL still matches the route).
 */
const ORIGIN_HOSTNAME = 'origin.sevynidd.org';

const RETRYABLE_STATUSES = new Set([502, 503, 504]);

/**
 * Cloudflare-tunnelled hostname for the Synology WebDAV service. Reached the
 * same way any other client would (through Cloudflare's edge + the tunnel),
 * so this fetch sees a normal, publicly-trusted TLS cert regardless of the
 * tunnel's internal noTLSVerify setting for the cloudflared -> NAS hop.
 */
const CERTIFICATES_WEBDAV_URL = 'https://certs.sevynidd.org/certificates';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/api/certificates') {
      return handleListCertificates(env);
    }

    const fileMatch = url.pathname.match(/^\/api\/certificates\/([^/]+)$/);
    if (request.method === 'GET' && fileMatch) {
      return handleDownloadCertificate(decodeURIComponent(fileMatch[1]), env);
    }

    let response;
    try {
      response = await fetch(request, { cf: { resolveOverride: ORIGIN_HOSTNAME } });
    } catch {
      return startingResponse(503);
    }

    if (RETRYABLE_STATUSES.has(response.status)) {
      return startingResponse(response.status);
    }

    if (response.status === 404 && request.method === 'GET' && isNavigationRequest(request, url)) {
      return spaFallback(url);
    }

    return response;
  }
};

function startingResponse(status) {
  return new Response(STARTING_HTML, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'retry-after': '5'
    }
  });
}

/**
 * The Angular app is a client-side SPA with no server-side routes, so a
 * direct hit or refresh on e.g. /about 404s at the origin. Distinguish a
 * page navigation (no file extension on the last path segment, browser
 * accepts HTML) from a real missing asset, which should keep 404ing.
 */
function isNavigationRequest(request, url) {
  const lastSegment = url.pathname.split('/').pop() ?? '';
  if (lastSegment.includes('.')) return false;
  const accept = request.headers.get('accept') ?? '';
  return accept.includes('text/html');
}

async function spaFallback(url) {
  const indexUrl = new URL('/index.html', url);
  const indexResponse = await fetch(indexUrl, { cf: { resolveOverride: ORIGIN_HOSTNAME } });
  if (!indexResponse.ok) return indexResponse;
  return new Response(indexResponse.body, {
    status: 200,
    headers: indexResponse.headers
  });
}

// ── Certificates (WebDAV -> JSON, same-origin so no CORS needed) ──

function webdavAuthHeader(env) {
  return 'Basic ' + btoa(`${env.WEBDAV_USER}:${env.WEBDAV_PASSWORD}`);
}

async function handleListCertificates(env) {
  let res;
  try {
    res = await fetch(CERTIFICATES_WEBDAV_URL, {
      method: 'PROPFIND',
      headers: {
        Authorization: webdavAuthHeader(env),
        Depth: '1',
        'Content-Type': 'application/xml'
      }
    });
  } catch {
    return jsonResponse({ error: 'unreachable' }, 502);
  }

  if (!res.ok) {
    return jsonResponse({ error: 'webdav_error', status: res.status }, 502);
  }

  const xml = await res.text();
  return jsonResponse(parsePropfind(xml));
}

async function handleDownloadCertificate(filename, env) {
  if (!filename || filename.includes('/') || filename.includes('..')) {
    return new Response('Not found', { status: 404 });
  }

  const target = `${CERTIFICATES_WEBDAV_URL}/${encodeURIComponent(filename)}`;
  let res;
  try {
    res = await fetch(target, { headers: { Authorization: webdavAuthHeader(env) } });
  } catch {
    return new Response('Bad gateway', { status: 502 });
  }

  if (!res.ok) {
    return new Response('Not found', { status: res.status });
  }

  const headers = new Headers();
  headers.set('Content-Type', res.headers.get('content-type') ?? 'application/octet-stream');
  headers.set('Content-Disposition', `inline; filename="${filename}"`);
  headers.set('Cache-Control', 'public, max-age=3600');
  return new Response(res.body, { status: 200, headers });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

/**
 * Minimal, namespace-prefix-agnostic PROPFIND parser. The Workers runtime
 * has no XML/DOM parser, and Synology's WebDAV server's namespace prefix
 * (commonly "D:" or "d:") isn't worth depending on, so this matches DAV
 * elements by local name only, tolerant of whichever prefix is used.
 */
function parsePropfind(xml) {
  const responses = xml.match(/<[^:>]*:response[^>]*>[\s\S]*?<\/[^:>]*:response>/gi) ?? [];
  const files = [];

  for (const block of responses) {
    const href = extractTag(block, 'href');
    if (!href) continue;

    // Skip the requested folder itself and any subfolders - only real files.
    if (/<[^:>]*:collection\s*\/?>/i.test(block)) continue;

    const decodedHref = decodeURIComponent(href);
    const name = decodedHref.split('/').filter(Boolean).pop() ?? decodedHref;
    const size = Number(extractTag(block, 'getcontentlength') ?? 0);
    const lastModified = extractTag(block, 'getlastmodified');

    files.push({ name, size, lastModified });
  }

  return files.sort((a, b) => a.name.localeCompare(b.name));
}

function extractTag(xml, localName) {
  const match = xml.match(new RegExp(`<[^:>]*:${localName}[^>]*>([\\s\\S]*?)<\\/[^:>]*:${localName}>`, 'i'));
  return match ? match[1].trim() : null;
}
