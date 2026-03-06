/**
 * @license
 * SPDX-License-Identifier: MIT
*/

/**
 * @file sw.js
 * @description Service Worker: Proxy de Rede e Gerenciador de Cache (Offline Engine).
 */

// Zero-deps por padrão: OneSignal SW SDK só é carregado quando o SW é registrado com ?push=1.
// Isso garante que o handler de push esteja ativo mesmo com o app fechado, sem depender de mensagens do client.
const _pushEnabled = (self.location && typeof self.location.search === 'string')
    ? self.location.search.includes('push=1')
    : false;

if (_pushEnabled) {
    try {
        importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
    } catch (e) {
        // Non-blocking failure
    }
}

try {
    importScripts('/workbox-sw.js');
} catch (e) {
    // Workbox runtime opcional
}

const HTML_FALLBACK = '/index.html';
const NETWORK_TIMEOUT_MS = 3000;
const SW_CACHE_VERSION = 'v2';

const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Network Timeout')), ms));

if (self.workbox) {
    self.workbox.core.setCacheNameDetails({ prefix: 'askesis', suffix: SW_CACHE_VERSION });
    self.workbox.core.skipWaiting();
    self.workbox.core.clientsClaim();

    if (self.workbox.navigationPreload) {
        self.workbox.navigationPreload.enable();
    }

    self.workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || [], {
        ignoreURLParametersMatching: [/.*/]
    });

    self.workbox.routing.registerRoute(
        ({ url }) => url.pathname.startsWith('/api/'),
        new self.workbox.strategies.NetworkOnly()
    );

    self.workbox.routing.registerRoute(
        ({ request }) => request.mode === 'navigate',
        new self.workbox.strategies.NetworkFirst({
            cacheName: `pages-${SW_CACHE_VERSION}`,
            networkTimeoutSeconds: NETWORK_TIMEOUT_MS / 1000
        })
    );

    self.workbox.routing.registerRoute(
        ({ request }) => ['style', 'script', 'image', 'font'].includes(request.destination),
        new self.workbox.strategies.StaleWhileRevalidate({ cacheName: `assets-${SW_CACHE_VERSION}` })
    );
} else {
    // --- FALLBACK: Cache manual mínimo (sem Workbox) ---
    const CACHE_NAME = `askesis-fallback-${SW_CACHE_VERSION}`;
    const CACHE_FILES = [
        '/',
        '/index.html',
        '/bundle.js',
        '/bundle.css',
        '/manifest.json',
        '/locales/pt.json',
        '/locales/en.json',
        '/locales/es.json',
        '/icons/icon-192.svg',
        '/icons/icon-512.svg',
        '/icons/icon-maskable-512.svg',
        '/icons/badge.svg'
    ];

    const RELOAD_OPTS = { cache: 'reload' };
    const MATCH_OPTS = { ignoreSearch: true };

    const updateShellCache = (res) => {
        if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(HTML_FALLBACK, copy));
        }
        return res;
    };

    self.addEventListener('install', (event) => {
        self.skipWaiting();
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache =>
                // allSettled: a single unavailable asset never aborts the entire SW install
                Promise.allSettled(CACHE_FILES.map(url =>
                    fetch(url, RELOAD_OPTS)
                        .then(res => {
                            if (!res.ok) throw new Error(`${res.status}`);
                            return cache.put(url, res);
                        })
                        .catch(err => console.warn('[SW] Skipping uncacheable asset:', url, err.message))
                ))
            )
        );
    });

    self.addEventListener('activate', (event) => {
        event.waitUntil(
            Promise.all([
                self.clients.claim(),
                self.registration.navigationPreload ? self.registration.navigationPreload.enable() : Promise.resolve(),
                caches.keys().then(keys => Promise.all(
                    keys.map(k => k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())
                ))
            ])
        );
    });

    self.addEventListener('fetch', (event) => {
        const req = event.request;
        const url = new URL(req.url); 

        if (url.pathname.startsWith('/api/')) return;

        if (req.mode === 'navigate') {
            event.respondWith(
                (async () => {
                    try {
                        const preloadResp = await event.preloadResponse;
                        if (preloadResp) return updateShellCache(preloadResp);
                        const networkResp = await Promise.race([fetch(req), timeout(NETWORK_TIMEOUT_MS)]);
                        return updateShellCache(networkResp);
                    } catch (error) {
                        return caches.match(HTML_FALLBACK, MATCH_OPTS);
                    }
                })()
            );
            return;
        }

        event.respondWith(
            caches.match(req).then(cached => {
                if (cached) return cached;
                return fetch(req).then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') return networkResponse;
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(req, responseToCache));
                    return networkResponse;
                }).catch(() => new Response(null, { status: 408 }));
            })
        );
    });
}

// --- BACKGROUND SYNC ---

/**
 * BACKGROUND SYNC EVENT:
 * Disparado pelo navegador quando a conectividade é restabelecida para tags registradas.
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-cloud-pending') {
        console.log('[SW] Conectividade recuperada. Solicitando sincronização às abas ativas...');
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then(clients => {
                // Notifica todas as abas abertas para que tentem sincronizar agora
                clients.forEach(client => {
                    client.postMessage({ type: 'REQUEST_SYNC' });
                });
            })
        );
    }
});
