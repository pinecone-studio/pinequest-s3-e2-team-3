const CACHE_NAME = "mini-test-cache-v13";
const APP_PAGES = ["/mini-test"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const url of APP_PAGES) {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (res.ok) {
            await cache.put(url, res.clone());
          }
        } catch (e) {
          console.warn("precache failed:", url, e);
        }
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

  // API cache hiihgui
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  // mini-test navigation
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkRes = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, networkRes.clone());
          return networkRes;
        } catch {
          const exact = await caches.match(request);
          if (exact) return exact;

          const miniTest = await caches.match("/mini-test");
          if (miniTest) return miniTest;

          return new Response("Offline and page not cached yet", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        }
      })(),
    );
    return;
  }

  // next static css/js/font
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname === "/favicon.ico"
  ) {
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
          const fallback = await caches.match(request);
          if (fallback) return fallback;
          return new Response("", { status: 404 });
        }
      })(),
    );
    return;
  }
});
