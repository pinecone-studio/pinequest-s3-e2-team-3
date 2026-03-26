const CACHE_NAME = "exam-cache-v11";
const PAGE_TO_KEEP = ["/", "/mini-test"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const url of PAGE_TO_KEEP) {
        try {
          const response = await fetch(url, { cache: "no-store" });
          if (response.ok) {
            await cache.put(url, response.clone());
          }
        } catch (error) {
          console.warn("cache add failed:", url, error);
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

  // API cache хийхгүй
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request, { cache: "no-store" });
        } catch {
          return new Response(JSON.stringify({ ok: false, offline: true }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        }
      })(),
    );
    return;
  }

  // navigation
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch {
          const exactPage = await caches.match(request);
          if (exactPage) return exactPage;

          const miniTestPage = await caches.match("/mini-test");
          if (miniTestPage) return miniTestPage;

          const homePage = await caches.match("/");
          if (homePage) return homePage;

          return new Response("Page not available offline", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        }
      })(),
    );
    return;
  }

  // static assets
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/favicon.ico"
  ) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch {
          const fallback = await caches.match(request);
          if (fallback) return fallback;
          return new Response("", { status: 404 });
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      try {
        return await fetch(request);
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response("", { status: 404 });
      }
    })(),
  );
});
