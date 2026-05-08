self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open('habit-tracker-shell-v1')
      .then((cache) =>
        cache.addAll(['/', '/index.html', '/favicon.svg', '/icons.svg', '/manifest.webmanifest']),
      )
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== 'habit-tracker-shell-v1')
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/index.html').then((response) => response || caches.match('/')),
      ),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached

      return fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open('habit-tracker-shell-v1').then((cache) => cache.put(event.request, copy))
        }
        return response
      })
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus()
          }
        }
        return clients.openWindow('/')
      }),
  )
})
