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
    let response;
    try {
      response = await fetch(request, { cf: { resolveOverride: ORIGIN_HOSTNAME } });
    } catch {
      return startingResponse(503);
    }

    if (RETRYABLE_STATUSES.has(response.status)) {
      return startingResponse(response.status);
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
