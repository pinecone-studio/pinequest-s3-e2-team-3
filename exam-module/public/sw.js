const CACHE_NAME = "mini-test-cache-v14";
const MINI_TEST_PATH = "/mini-test";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const res = await fetch(MINI_TEST_PATH, { cache: "no-store" });
        if (res.ok) {
          await cache.put(MINI_TEST_PATH, res.clone());
        }
      } catch (e) {
        console.warn("precache failed:", MINI_TEST_PATH, e);
      }
    })(),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Only intercept requests related to /mini-test
  const isMiniTestNav =
    request.mode === "navigate" && url.pathname.startsWith(MINI_TEST_PATH);
  const isMiniTestAsset =
    url.pathname.startsWith("/_next/static/") &&
    request.headers.get("referer")?.includes(MINI_TEST_PATH);

  if (!isMiniTestNav && !isMiniTestAsset) return;

  // Network-first for mini-test navigation
  if (isMiniTestNav) {
    event.respondWith(
      (async () => {
        try {
          const networkRes = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, networkRes.clone());
          return networkRes;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;

          const fallback = await caches.match(MINI_TEST_PATH);
          if (fallback) return fallback;

          return new Response("Offline – mini-test not cached yet", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        }
      })(),
    );
    return;
  }

  // Cache-first for mini-test static assets (JS/CSS chunks)
  if (isMiniTestAsset) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const networkRes = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, networkRes.clone());
          return networkRes;
        } catch {
          return new Response("", { status: 404 });
        }
      })(),
    );
    return;
  }
});
