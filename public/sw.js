const CACHE_NAME = 'windcast-v2'
const APP_SHELL = ['/', '/logo.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith('windcast-') && key !== CACHE_NAME).map((key) => caches.delete(key)),
    )).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const requestUrl = new URL(event.request.url)
  if (requestUrl.origin !== self.location.origin || requestUrl.pathname.startsWith('/api/')) return

  event.respondWith(
    fetch(event.request).then((response) => {
      if (response?.ok && response.type === 'basic') {
        return caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()).then(() => response))
      }
      return response
    }).catch(async () => {
      const cachedResponse = await caches.match(event.request)
      if (cachedResponse) return cachedResponse
      if (event.request.mode === 'navigate') return caches.match('/')
      throw new Error('WindCast resource is unavailable offline')
    }),
  )
})
