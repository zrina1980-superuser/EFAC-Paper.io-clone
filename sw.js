const SW_VERSION = new URL(self.location.href).searchParams.get('v') || 'v1';
const CACHE_PREFIX = 'efac-cache-';
const CACHE_NAME = `${CACHE_PREFIX}${SW_VERSION}`;
const ASSETS = [
    './',
    './index.html',
    './zrina.png',
    './maminjo.png',
    './zdero.png',
    './franc.png',
    './stranka.png',
    './floor.jpg',
    './wall.jpg',
    './50euro.png',
    './nemjerljivi.mp3',
    './smart.mp3',
    './stuttgart.mp3'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys
                .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
                .map(key => caches.delete(key))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const req = event.request;
    const isDocument = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

    if (isDocument) {
        event.respondWith(
            fetch(req).then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(req, clone)).catch(() => {});
                return response;
            }).catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
        );
        return;
    }

    event.respondWith(
        caches.match(req).then(cached => {
            if (cached) return cached;
            return fetch(req).then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(req, clone)).catch(() => {});
                return response;
            });
        })
    );
});
