const CACHE_NAME = "rustore-v2-20260916";

const FILES = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.webmanifest",
  "./icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  /*
   * HTML и JavaScript всегда берём с сервера.
   * Это предотвращает показ старой версии приложения.
   */

  if (
    request.mode === "navigate" ||
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/sW.js")
  ) {
    event.respondWith(
      fetch(request, {
        cache: "no-store"
      }).then(response => {

        if (response && response.ok) {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, copy);
            });

        }

        return response;

      }).catch(() => {
        return caches.match(request);
      })
    );

    return;
  }

  /*
   * Остальные файлы можно брать из кэша.
   */

  event.respondWith(
    caches.match(request)
      .then(cached => {

        if (cached) {
          return cached;
        }

        return fetch(request)
          .then(response => {

            if (
              !response ||
              response.status !== 200 ||
              response.type !== "basic"
            ) {
              return response;
            }

            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, copy);
              });

            return response;
          });
      })
  );
});