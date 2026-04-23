# External Integrations

**Analysis Date:** 2026-04-23

## APIs and External Services

**Generative AI:**
- Google Gemini via SDK `@google/genai` em [api/analyze.ts](../../api/analyze.ts).
  - Endpoint: `POST /api/analyze`.
  - Runtime: edge (`export const config = { runtime: 'edge' }`).
  - Auth env: `API_KEY` ou `GEMINI_API_KEY`.
  - Additional controls: cache em memoria no handler, timeout de leitura/request, cooldown de quota e rate limit por IP.

**Cloud Sync API:**
- Endpoint interno `GET/POST /api/sync` em [api/sync.ts](../../api/sync.ts).
  - Runtime: edge.
  - Storage backend: Upstash Redis REST.
  - Auth de request: `X-Sync-Key-Hash` (SHA-256 do segredo local), com opcao legacy `Authorization: Bearer` controlada por env.
  - Concurrency control: script Lua atomico para shards e conflito 409.

**Web Push and notification vendor:**
- OneSignal carregado sob demanda no app e no service worker:
  - Runtime hooks: [index.tsx](../../index.tsx), [render.ts](../../render.ts), [utils.ts](../../utils.ts).
  - SW push SDK importado condicionalmente em [sw.js](../../sw.js) quando registrado com `?push=1`.
  - CSP/allowlist de rede inclui dominio OneSignal em [vercel.json](../../vercel.json).

**Performance telemetry:**
- Vercel Speed Insights inicializado em [index.tsx](../../index.tsx) via `@vercel/speed-insights`.

## Data Storage

**Client persistence (primary):**
- IndexedDB (`AskesisDB`, store `app_state`) em [services/persistence.ts](../../services/persistence.ts).
  - Split storage: JSON core (`askesis_core_json`) + logs binarios (`askesis_logs_binary`) + backup snapshot (`askesis_core_json_backup`).

**Client persistence (auxiliary/local state):**
- localStorage para chaves e caches operacionais:
  - Sync key: `habitTrackerSyncKey` em [services/api.ts](../../services/api.ts).
  - Sync hash cache, etag remoto e backup de conflito em [services/cloud.ts](../../services/cloud.ts).
  - Preferencias de idioma e outros flags em [render.ts](../../render.ts) e modulos de UI.

**Server-side data store:**
- Redis hash por usuario em `sync_v3:{keyHash}` via Upstash REST client em [api/sync.ts](../../api/sync.ts).
- Rate limiting distribuido tambem usa Redis em [api/_httpSecurity.ts](../../api/_httpSecurity.ts), com fallback local em memoria quando Redis nao esta configurado.

## Workers and Background Processing

**Web Worker (main thread offload):**
- Worker module: [services/sync.worker.ts](../../services/sync.worker.ts).
- RPC client: [services/workerClient.ts](../../services/workerClient.ts).
- Task types: encrypt/decrypt, decrypt-with-hash, archive, prompt building, prune-habit.
- Crypto stack: PBKDF2 + AES-GCM via Web Crypto no worker.

**Service Worker (network/cache/offline):**
- File: [sw.js](../../sw.js).
- Workbox path: precache `__WB_MANIFEST`, NetworkOnly para `/api/*`, NetworkFirst para navegacao, CacheFirst para bundles hasheados.
- Fallback path sem Workbox: cache manual com shell offline.
- Background Sync event: tag `sync-cloud-pending` envia `REQUEST_SYNC` para clients.

## Network and Sync Flows

**Outbound network points:**
- `/api/analyze` e `/api/sync` a partir do cliente em [services/cloud.ts](../../services/cloud.ts) e [services/api.ts](../../services/api.ts).
- OneSignal CDN/SDK e endpoints do provedor, permitidos por CSP em [vercel.json](../../vercel.json).

**Sync write flow (client -> cloud):**
1. Estado local e quebrado em shards em [services/cloud.ts](../../services/cloud.ts).
2. Apenas shards alterados sao criptografados no worker.
3. Cliente envia `POST /api/sync` com `X-Sync-Key-Hash` via [services/api.ts](../../services/api.ts).
4. API valida limites/tamanho, executa Lua atomico e retorna sucesso, conflito 409, ou erro transiente.

**Sync read flow (cloud -> client):**
1. Cliente faz `GET /api/sync` com `If-None-Match` quando existe ETag salvo.
2. API retorna 304 ou shards remotos.
3. Cliente descriptografa no worker e reconstrui `AppState`.
4. Em divergencia, merge local-remoto + possivel push do estado consolidado.

**Retry and resilience behavior:**
- `apiFetch` com timeout + retries progressivos em [services/api.ts](../../services/api.ts).
- Tratamento de 429/503 e reenqueue no sync orchestration em [services/cloud.ts](../../services/cloud.ts).
- Registro de Background Sync no navegador quando possivel.

## Security and Integration Guards

**HTTP security and CORS:**
- Utilitarios em [api/_httpSecurity.ts](../../api/_httpSecurity.ts) usados por [api/analyze.ts](../../api/analyze.ts) e [api/sync.ts](../../api/sync.ts).
- CORS por regras (`CORS_ALLOWED_ORIGINS`, `CORS_STRICT`) e origem do deployment.

**Payload and abuse controls:**
- Limites de tamanho e quantidade de shards no sync API em [api/sync.ts](../../api/sync.ts).
- Rate limit por namespace (`analyze`, `sync`) com fallback local.

**Build/deploy integration controls:**
- Guardrail de manifest Workbox em [scripts/check-sw-manifest.js](../../scripts/check-sw-manifest.js).
- Guardrail de vulnerabilidades npm em [scripts/guardrail-audit.js](../../scripts/guardrail-audit.js).

## Environment Configuration (integration-critical)

**Required for AI integration:**
- `API_KEY` ou `GEMINI_API_KEY`.

**Required for cloud sync and distributed limiting:**
- `KV_REST_API_URL` + `KV_REST_API_TOKEN` ou `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.

**Operational controls:**
- `CORS_ALLOWED_ORIGINS`, `CORS_STRICT`, `ALLOW_LEGACY_SYNC_AUTH`, `DISABLE_RATE_LIMIT`.
- `ANALYZE_RATE_LIMIT_*`, `SYNC_RATE_LIMIT_*`, `AI_QUOTA_COOLDOWN_MS`.

## Integration Points by Directory

- API edge handlers: [api/](../../api/)
- Client sync orchestration: [services/cloud.ts](../../services/cloud.ts)
- API client and auth hash: [services/api.ts](../../services/api.ts)
- Storage layer: [services/persistence.ts](../../services/persistence.ts)
- Worker compute: [services/sync.worker.ts](../../services/sync.worker.ts), [services/workerClient.ts](../../services/workerClient.ts)
- Service worker/network cache: [sw.js](../../sw.js)
- Sync contracts: [contracts/api-sync.ts](../../contracts/api-sync.ts), [contracts/worker.ts](../../contracts/worker.ts)
- Deploy and security headers: [vercel.json](../../vercel.json)

---

*Integration audit: 2026-04-23*
