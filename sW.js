const CACHE_NAME = "rustore-v6-20260916";

const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js?v=20260916-4",
  "./manifest.webmanifest?v=20260916-5",
  "./icon.svg?v=20260916-4"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .catch(error => {
        console.error(
          "RuStore cache install error:",
          error
        );
      })
  );

  self.skipWaiting();
});


self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key =>
              key !== CACHE_NAME
            )
            .map(key =>
              caches.delete(key)
            )

        );

      })
      .then(() =>
        self.clients.claim()
      )

  );

});


self.addEventListener("fetch", event => {

  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  event.respondWith(

    fetch(request)
      .then(response => {

        if (
          response &&
          response.status === 200
        ) {

          const copy =
            response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {

              cache.put(
                request,
                copy
              );

            })
            .catch(() => {});

        }

        return response;

      })
      .catch(() => {

        return caches.match(request)
          .then(cached => {

            return cached ||
              caches.match(
                "./index.html"
              );

          });

      })

  );

});