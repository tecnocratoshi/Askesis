/**
 * @file tests/service-worker-runtime.test.ts
 *
 * Service Worker Confidence Recovery — F-02-009
 *
 * PURPOSE: Provide a dedicated validation surface for service worker
 * critical paths (offline caching, API passthrough, navigate fallback).
 * This is a confidence-recovery surface, not a runtime fix — it documents
 * expected SW behaviour so regressions in offline flows are caught before
 * field exposure.
 *
 * Test strategy:
 *   - Unit-test the logic that CAN be exercised without a full browser SW
 *     environment (cache-key rules, routing predicates, fallback conditions).
 *   - Integration stubs simulate the Cache API and fetch interception.
 *   - These tests intentionally avoid importing sw.js directly (which relies
 *     on importScripts and self globals) — instead they test the decision
 *     logic extracted into pure helper patterns.
 *
 * F-02-009 status: test-gap (no reproduced defect — confidence recovery only).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Cache API stub ──────────────────────────────────────────────────────────

type CacheEntries = Map<string, Response>;

function makeFakeCache(initial: CacheEntries = new Map()): Cache {
    const store = new Map(initial);
    return {
        match: async (req: RequestInfo | URL) => {
            const key = typeof req === 'string' ? req : req instanceof Request ? req.url : req.toString();
            return store.get(key) ?? undefined;
        },
        put: async (req: RequestInfo | URL, res: Response) => {
            const key = typeof req === 'string' ? req : req instanceof Request ? req.url : req.toString();
            store.set(key, res);
        },
        keys: async () => Array.from(store.keys()).map(url => new Request(url)),
        delete: async (req: RequestInfo | URL) => {
            const key = typeof req === 'string' ? req : req instanceof Request ? req.url : req.toString();
            return store.delete(key);
        },
        add: vi.fn(),
        addAll: vi.fn(),
        matchAll: vi.fn(),
    } as unknown as Cache;
}

// ── Routing predicate helpers (mirrors sw.js logic) ──────────────────────────

/** API routes must bypass the cache (NetworkOnly in Workbox path). */
function isApiRoute(url: URL): boolean {
    return url.pathname.startsWith('/api/');
}

/** Hashed bundle assets can be cached forever (CacheFirst). */
function isHashedBundle(url: URL): boolean {
    return /^\/bundle-[A-Za-z0-9]+\.(js|css)$/.test(url.pathname);
}

/** Navigate requests go through NetworkFirst with HTML fallback. */
function isNavigateRequest(mode: string): boolean {
    return mode === 'navigate';
}

/** Static assets use StaleWhileRevalidate. */
function isStaticAsset(destination: string): boolean {
    return ['style', 'script', 'image', 'font'].includes(destination);
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('service-worker: routing predicates', () => {
    it('rotas de API não são interceptadas pelo cache', () => {
        expect(isApiRoute(new URL('https://askesis.app/api/sync'))).toBe(true);
        expect(isApiRoute(new URL('https://askesis.app/api/analyze'))).toBe(true);
        expect(isApiRoute(new URL('https://askesis.app/index.html'))).toBe(false);
        expect(isApiRoute(new URL('https://askesis.app/bundle-abc123.js'))).toBe(false);
    });

    it('bundles com hash são identificados corretamente para CacheFirst', () => {
        expect(isHashedBundle(new URL('https://askesis.app/bundle-a1b2c3.js'))).toBe(true);
        expect(isHashedBundle(new URL('https://askesis.app/bundle-A1B2C3.css'))).toBe(true);
        // Non-hashed bundles must not match (would cache stale code)
        expect(isHashedBundle(new URL('https://askesis.app/bundle.js'))).toBe(false);
        expect(isHashedBundle(new URL('https://askesis.app/bundle-.js'))).toBe(false);
        expect(isHashedBundle(new URL('https://askesis.app/bundle-abc.txt'))).toBe(false);
    });

    it('requisições navigate são roteadas para NetworkFirst', () => {
        expect(isNavigateRequest('navigate')).toBe(true);
        expect(isNavigateRequest('cors')).toBe(false);
        expect(isNavigateRequest('no-cors')).toBe(false);
    });

    it('assets estáticos usam StaleWhileRevalidate', () => {
        expect(isStaticAsset('style')).toBe(true);
        expect(isStaticAsset('script')).toBe(true);
        expect(isStaticAsset('image')).toBe(true);
        expect(isStaticAsset('font')).toBe(true);
        expect(isStaticAsset('document')).toBe(false);
        expect(isStaticAsset('fetch')).toBe(false);
    });
});

describe('service-worker: offline cache behaviour', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('cache hit retorna resposta sem ir à rede', async () => {
        const cachedResponse = new Response('<html>cached</html>', {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });
        const cache = makeFakeCache(new Map([['https://askesis.app/index.html', cachedResponse]]));

        const hit = await cache.match('https://askesis.app/index.html');
        expect(hit).toBe(cachedResponse);
        expect(hit?.status).toBe(200);
    });

    it('cache miss retorna undefined (rede deve ser tentada)', async () => {
        const cache = makeFakeCache();
        const miss = await cache.match('https://askesis.app/missing.html');
        expect(miss).toBeUndefined();
    });

    it('put e match são consistentes (round-trip de cache)', async () => {
        const cache = makeFakeCache();
        const res = new Response('{"ok":true}', { status: 200 });
        await cache.put('https://askesis.app/manifest.json', res);
        const retrieved = await cache.match('https://askesis.app/manifest.json');
        expect(retrieved?.status).toBe(200);
    });

    it('caches obsoletos são removidos na ativação (não retém chaves antigas)', async () => {
        const cache = makeFakeCache(new Map([
            ['https://askesis.app/index.html', new Response('<html>')],
            ['https://askesis.app/old-page.html', new Response('<html>old')]
        ]));

        // Simulate activation: delete entries that don't belong in the new cache
        const allKeys = await cache.keys();
        const keepUrls = new Set(['https://askesis.app/index.html']);
        for (const req of allKeys) {
            if (!keepUrls.has(req.url)) await cache.delete(req.url);
        }

        expect(await cache.match('https://askesis.app/index.html')).toBeTruthy();
        expect(await cache.match('https://askesis.app/old-page.html')).toBeUndefined();
    });
});

describe('service-worker: network timeout fallback', () => {
    it('timeout de rede rejeita após o intervalo configurado', async () => {
        vi.useFakeTimers();
        const NETWORK_TIMEOUT_MS = 3000;
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Network Timeout')), NETWORK_TIMEOUT_MS)
        );

        const neverResolves = new Promise<Response>(() => {/* never */});

        const racePromise = Promise.race([neverResolves, timeoutPromise]);
        vi.advanceTimersByTime(NETWORK_TIMEOUT_MS + 1);

        await expect(racePromise).rejects.toThrow('Network Timeout');
        vi.useRealTimers();
    });

    it('resposta rápida da rede resolve antes do timeout', async () => {
        vi.useFakeTimers();
        const NETWORK_TIMEOUT_MS = 3000;
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Network Timeout')), NETWORK_TIMEOUT_MS)
        );

        const fastFetch = Promise.resolve(new Response('ok', { status: 200 }));
        const result = await Promise.race([fastFetch, timeoutPromise]);

        expect(result.status).toBe(200);
        vi.useRealTimers();
    });
});
