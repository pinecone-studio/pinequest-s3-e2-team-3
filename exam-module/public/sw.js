const CACHE_NAME = "active-exam-cache-v2";
const EXAM_PATH = "/active-exam";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Fetch the /active-exam HTML and extract every _next/static URL from it */
async function extractNextAssets(html) {
  const urls = new Set();
  // Match src="/_next/static/..." and href="/_next/static/..."
  const re = /(?:src|href)="(\/_next\/static\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    urls.add(m[1]);
  }
  return Array.from(urls);
}

/** Pre-cache the exam shell + all its _next/static assets */
async function precacheExam(cache) {
  // 1. Fetch and cache the page shell
  const pageRes = await fetch(EXAM_PATH, { cache: "no-store" });
  if (!pageRes.ok) throw new Error("Failed to fetch exam page");
  const html = await pageRes.text();
  await cache.put(EXAM_PATH, new Response(html, {
    headers: pageRes.headers,
    status: pageRes.status,
    statusText: pageRes.statusText,
  }));

  // 2. Parse asset URLs from the HTML and cache them all
  const assetUrls = await extractNextAssets(html);
  console.log(`[SW] Found ${assetUrls.length} assets to pre-cache`);
  await Promise.all(
    assetUrls.map(async (url) => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) await cache.put(url, res.clone());
      } catch (e) {
        console.warn("[SW] asset precache failed:", url, e);
      }
    }),
  );
}

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await precacheExam(cache);
        console.log("[SW] Pre-cache complete");
      } catch (e) {
        console.warn("[SW] Pre-cache failed:", e);
      }
    })(),
  );
  self.skipWaiting();
});

// ── Activate: delete every old cache ─────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isExamNav =
    req.mode === "navigate" && url.pathname.startsWith(EXAM_PATH);
  const isNextStatic = url.pathname.startsWith("/_next/static/");

  if (!isExamNav && !isNextStatic) return;

  // ── Navigation: network-first, re-run precache on success ─────────────
  if (isExamNav) {
    event.respondWith(
      (async () => {
        try {
          const cache = await caches.open(CACHE_NAME);
          // Try to update the cache in the background while returning network response
          const networkRes = await fetch(req);
          // Re-cache the page shell + assets whenever we successfully load online
          precacheExam(cache).catch(() => {});
          return networkRes;
        } catch {
          // Offline — serve the cached shell (works for any ?query params too)
          const cached =
            (await caches.match(req)) ?? (await caches.match(EXAM_PATH));
          if (cached) return cached;
          return new Response(
            "Offline – please open this page while online first.",
            { status: 503, headers: { "Content-Type": "text/plain" } },
          );
        }
      })(),
    );
    return;
  }

  // ── Static assets: cache-first, always ────────────────────────────────
  if (isNextStatic) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        try {
          const networkRes = await fetch(req);
          if (networkRes.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(req, networkRes.clone());
          }
          return networkRes;
        } catch {
          return new Response("", { status: 404 });
        }
      })(),
    );
  }
});
