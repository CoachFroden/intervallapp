self.addEventListener("install", event => {
  // Tving ny service worker til å ta over umiddelbart
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Ingen caching i det hele tatt (midlertidig, for debugging)
self.addEventListener("fetch", event => {
  event.respondWith(fetch(event.request));
});
