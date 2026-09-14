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

export default {
  async fetch(request) {
    const url = new URL(request.url);
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
