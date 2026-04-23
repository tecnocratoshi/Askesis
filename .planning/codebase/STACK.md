# Technology Stack

**Analysis Date:** 2026-04-23

## Languages

**Primary:**
- TypeScript - app shell, UI, business logic, services, API handlers, tests. Exemplos: [index.tsx](../../index.tsx), [services/cloud.ts](../../services/cloud.ts), [api/sync.ts](../../api/sync.ts), [tests/render.dom.test.ts](../../tests/render.dom.test.ts).
- JavaScript (Node scripts) - build, guardrails e tooling. Exemplos: [build.js](../../build.js), [scripts/guardrail-audit.js](../../scripts/guardrail-audit.js), [scripts/check-sw-manifest.js](../../scripts/check-sw-manifest.js).

**Secondary:**
- CSS - estilos modulares por dominio. Exemplos: [css/base.css](../../css/base.css), [css/layout.css](../../css/layout.css), [css/charts.css](../../css/charts.css).
- HTML - app shell e preload strategy em [index.html](../../index.html).

## Runtime

**Environment:**
- Node.js >=24 <25 (definido em [package.json](../../package.json)).
- Browser moderno para app client (DOM, Service Worker, Web Crypto, IndexedDB), com fallback parcial quando APIs nao existem. Referencias: [index.tsx](../../index.tsx), [sw.js](../../sw.js), [services/persistence.ts](../../services/persistence.ts), [services/sync.worker.ts](../../services/sync.worker.ts).
- Vercel Edge Runtime para endpoints serverless em [api/analyze.ts](../../api/analyze.ts) e [api/sync.ts](../../api/sync.ts).

**Package Manager:**
- npm (scripts e lockfile em [package-lock.json](../../package-lock.json)).

## Frameworks and Tooling

**Core runtime/build:**
- Esbuild (bundle app e worker) via [build.js](../../build.js).
- Workbox runtime no Service Worker, com fallback manual quando indisponivel em [sw.js](../../sw.js).
- PWA setup por [manifest.json](../../manifest.json) + registro SW em [index.tsx](../../index.tsx).

**Testing:**
- Vitest + happy-dom em [vitest.config.ts](../../vitest.config.ts).
- Cobertura com V8 provider e thresholds definidos em [vitest.config.ts](../../vitest.config.ts).

**Code quality and validation:**
- TypeScript strict mode em [tsconfig.json](../../tsconfig.json).
- Stylelint em [package.json](../../package.json) e [.stylelintrc.json](../../.stylelintrc.json).
- Guardrails de seguranca, i18n, SW manifest e audit npm em [scripts/](../../scripts/).
- Husky + lint-staged para pre-commit em [package.json](../../package.json).

## Key Dependencies

**Critical production dependencies:**
- @google/genai (^1.40.0): cliente Gemini usado no endpoint [api/analyze.ts](../../api/analyze.ts).
- @upstash/redis (^1.36.2): sync storage e rate limit distribuido em [api/sync.ts](../../api/sync.ts) e [api/_httpSecurity.ts](../../api/_httpSecurity.ts).
- @vercel/speed-insights (^2.0.0): telemetria de performance no bootstrap [index.tsx](../../index.tsx).
- dompurify (^3.3.3): sanitizacao de HTML no rendering (referencia em docs de auditoria e modulo render).

**Important dev dependencies:**
- esbuild, vite, vitest, @vitest/ui, @vitest/coverage-v8, typescript.
- ajv + ajv-formats para validacao de JSON metadata em [scripts/validate-json.js](../../scripts/validate-json.js).
- workbox-build para pipeline SW.

## Configuration

**TypeScript:**
- Base strict config em [tsconfig.json](../../tsconfig.json), com variantes [tsconfig.app.json](../../tsconfig.app.json) e [tsconfig.test.json](../../tsconfig.test.json).

**Lint and style:**
- ESLint flat config em [eslint.config.mjs](../../eslint.config.mjs).
- Stylelint config em [.stylelintrc.json](../../.stylelintrc.json).

**Test config:**
- [vitest.config.ts](../../vitest.config.ts) e setup global em [vitest.setup.ts](../../vitest.setup.ts).

**Deploy/runtime config:**
- [vercel.json](../../vercel.json) define build/dev/install commands, output dist, routes SPA e headers de seguranca.

## Environment Variables (detected in code)

**AI endpoint:**
- API_KEY ou GEMINI_API_KEY (obrigatorio para [api/analyze.ts](../../api/analyze.ts)).
- AI_QUOTA_COOLDOWN_MS, ANALYZE_RATE_LIMIT_WINDOW_MS, ANALYZE_RATE_LIMIT_MAX_REQUESTS.

**Sync/Redis:**
- KV_REST_API_URL + KV_REST_API_TOKEN (preferencia).
- Fallback: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
- SYNC_RATE_LIMIT_WINDOW_MS, SYNC_RATE_LIMIT_MAX_REQUESTS.

**CORS/auth behavior:**
- CORS_ALLOWED_ORIGINS, CORS_STRICT, ALLOW_LEGACY_SYNC_AUTH, DISABLE_RATE_LIMIT.

## Scripts: Build, Test, Guardrails, Deploy

**Build/dev:**
- [package.json](../../package.json) script `dev`: `node build.js`.
- [package.json](../../package.json) script `build`: `NODE_ENV=production node build.js`.
- Build output em `dist/`, com bundle hash em producao e worker dedicado em [build.js](../../build.js).

**Typecheck/lint/style:**
- `typecheck`, `typecheck:app`, `typecheck:test`, `lint`.
- `lint:style`, `lint:style:fix`.

**Testing:**
- `test` roda guardrails + vitest.
- `test:watch`, `test:ui`, `test:coverage`, `test:scenario`.

**Guardrails and validation:**
- `guardrail:security-html`, `guardrail:locales`, `guardrail:audit`, `guardrail:sw-manifest`, `guardrail:all`.
- `validate:metadata`, `guardrail:l3-l4`, `guardrail:l3-l4:fix`.

**Deploy wiring:**
- Build/deploy target preparado para Vercel em [vercel.json](../../vercel.json).
- API handlers em [api/](../../api/) seguem modelo serverless edge.

## Platform Requirements

**Development:**
- Node 24.x, npm, navegador com suporte moderno para executar e testar PWA local.

**Production:**
- Hosting orientado a Vercel (SPA static + API Edge + headers de seguranca) conforme [vercel.json](../../vercel.json).

---

*Stack analysis: 2026-04-23*
