const CACHE_NAME = "active-exam-cache-v5";
const EXAM_PATH = "/active-exam";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract every /_next/static/ URL referenced in the exam page HTML */
async function extractNextAssets(html) {
  const urls = new Set();
  const re = /(?:src|href)="(\/_next\/static\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) urls.add(m[1]);
  return Array.from(urls);
}

/**
 * Wipe the current cache entirely, then re-fill it with a fresh copy of
 * the /active-exam page and all its /_next/static/ assets.
 * Called every time we successfully reach the network — so the cache is
 * ALWAYS the latest version and never serves stale content.
 */
async function refreshCache() {
  // Delete old cache first so nothing stale survives
  await caches.delete(CACHE_NAME);
  const cache = await caches.open(CACHE_NAME);

  const pageRes = await fetch(EXAM_PATH, { cache: "no-store" });
  if (!pageRes.ok) throw new Error(`[SW] page fetch failed: ${pageRes.status}`);
  const html = await pageRes.text();

  await cache.put(
    EXAM_PATH,
    new Response(html, {
      headers: pageRes.headers,
      status: pageRes.status,
      statusText: pageRes.statusText,
    }),
  );

  const assetUrls = await extractNextAssets(html);
  console.log(`[SW] Refreshing cache with ${assetUrls.length} assets`);
  await Promise.all(
    assetUrls.map(async (url) => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) await cache.put(url, res.clone());
      } catch (e) {
        console.warn("[SW] asset cache failed:", url, e);
      }
    }),
  );
  console.log("[SW] Cache refreshed");
}

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    refreshCache()
      .then(() => console.log("[SW] Install pre-cache done"))
      .catch((e) => console.warn("[SW] Install pre-cache failed:", e)),
  );
  self.skipWaiting();
});

// ── Activate: delete every old cache version ──────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
      console.log("[SW] Activated, old caches cleared");
    })(),
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
// Strategy: NETWORK FIRST always.
// - Online  → fetch from network, then refresh entire cache in background.
// - Offline → fall back to cache only.
// This means the cache is ONLY ever used when offline and is ALWAYS
// replaced with fresh content the moment the network is reachable.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isExamNav =
    req.mode === "navigate" && url.pathname.startsWith(EXAM_PATH);
  const isExamStatic =
    url.pathname.startsWith("/_next/static/") &&
    (req.referrer
      ? new URL(req.referrer).pathname.startsWith(EXAM_PATH)
      : false);

  if (!isExamNav && !isExamStatic) return;

  event.respondWith(
    (async () => {
      try {
        // Always try the network first
        const networkRes = await fetch(req);

        if (isExamNav && networkRes.ok) {
          // Online + successful nav → wipe & rebuild cache in background
          refreshCache().catch(() => {});
        } else if (isExamStatic && networkRes.ok) {
          // Online + static asset → update just this asset in cache
          const cache = await caches.open(CACHE_NAME);
          await cache.put(req, networkRes.clone());
        }

        return networkRes;
      } catch {
        // Network failed → we're offline, serve from cache
        const cached =
          (await caches.match(req)) ??
          (isExamNav ? await caches.match(EXAM_PATH) : null);

        if (cached) {
          console.log("[SW] Offline — serving from cache:", url.pathname);
          return cached;
        }

        return new Response(
          isExamNav
            ? "Offline – please open this page while online first."
            : "",
          {
            status: isExamNav ? 503 : 404,
            headers: { "Content-Type": "text/plain" },
          },
        );
      }
    })(),
  );
});
