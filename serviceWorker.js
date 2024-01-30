// 1 - first we need to define all the assets that our applications need to work offline
const assets = [
  "/", // cache entry point
  "styles.css",
  "app.js",
  "registerServiceWorker.js",
  "https://fonts.gstatic.com/s/materialicons/v67/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2", // cache external resource
];

// 2 - after listing all assets file needed we need to store them in the cache
// install event fires when the browser try to install service worker for the first time
self.addEventListener("install", (event) => {
  // assets == name of the cache storage
  // we add all the assets to cache storage but not serving them.
  /*
    we can to this but the service worker runs for a specific amount of time
    caches.open("assets").then((cache) => {
    cache.addAll(assets);
  });
  */
  console.log("start caching");
  // instead do this
  event.waitUntil(
    caches.open("assets").then((cache) => {
      return cache.addAll(assets);
    })
  );
});

// 3 - we need to serve the cached assets by service worker
// when a user request an asset from the real server we need to serve by the service worker,
// in this case service worker acts like server
// if the requested resources not cached wwe send request to real server in this case service worker is proxy server
self.addEventListener("fetch", (event) => {
  /*
    returns response from service worker
    event.respondWith(
    new Response("i'm the service worker, i'm the one who's serving you")
  ); */
  // event.respondWith except a response or a promise of a response
  // cache approaches
  /****************************************************************/
  /*************************1-Cache first*************************/
  /***************************************************************/
  /* event.respondWith(
    caches.open("assets").then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        } else {
          return fetch(event.request);
        }
      });
    })
  ); */
  /****************************************************************/
  /*************************2-network first*************************/
  /***************************************************************/
  event.respondWith(
    fetch(event.request) // fetch from server
      .catch((error) => {
        // if the network is down, fetch from cache
        return caches.open("assets").then((cache) => {
          return cache.match(event.request);
        });
      })
  );

  /****************************************************************/
  /*************************3-hybrid*************************/
  /***************************************************************/
  self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Even if the response is in the cache, we fetch it
        // and update the cache for future usage
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          caches.open("assets").then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
        // We use the currently cached version if it's there
        return cachedResponse || fetchPromise; // cached or a network fetch
      })
    );
  });
});
