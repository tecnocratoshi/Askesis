# Architecture

**Analysis Date:** 2026-04-23

## Pattern Overview

**Overall:** Modular monolith frontend (PWA) with event-driven UI orchestration, local-first persistence, and edge-backed sync/AI.

**Key Characteristics:**
- Single global state container in [state.ts](state.ts) used as source of truth for UI, domain and sync snapshots.
- Event bus abstraction in [events.ts](events.ts) over typed contracts in [contracts/events.ts](contracts/events.ts), decoupling emitters from listeners.
- Clear runtime split between main thread ([index.tsx](index.tsx), [listeners.ts](listeners.ts), [render.ts](render.ts), [services/*](services)) and worker context ([services/sync.worker.ts](services/sync.worker.ts)).

## Layers

**Bootstrapping / App Lifecycle:**
- Purpose: start app, load state, initialize i18n, bind listeners, register service worker, and trigger first render.
- Location: [index.tsx](index.tsx), [boot/error-handler.js](boot/error-handler.js), [index.html](index.html).
- Contains: startup orchestration, boot watchdog/healing, service worker registration strategy.
- Depends on: rendering facade ([render.ts](render.ts)), state and persistence ([state.ts](state.ts), [services/persistence.ts](services/persistence.ts)), sync services ([services/cloud.ts](services/cloud.ts), [listeners/sync.ts](listeners/sync.ts)).
- Used by: browser entrypoint via DOMContentLoaded in [index.tsx](index.tsx#L300).

**Presentation (Render Facade + UI Modules):**
- Purpose: update DOM and compose visual state from selectors and app state.
- Location: [render.ts](render.ts), [render/](render), [render/ui.ts](render/ui.ts).
- Contains: render orchestration, modal/calendar/chart/habit renderers, lazy DOM registry.
- Depends on: [state.ts](state.ts), selector/query services ([services/selectors.ts](services/selectors.ts)), i18n ([i18n.ts](i18n.ts)), events ([events.ts](events.ts).
- Used by: lifecycle and interaction layers ([index.tsx](index.tsx), [listeners.ts](listeners.ts), [listeners/*](listeners)).

**Interaction / Event Handling:**
- Purpose: translate DOM interactions and browser events into domain actions and renders.
- Location: [listeners.ts](listeners.ts), [listeners/](listeners).
- Contains: card/calendar/drag/swipe/modal/sync handlers, network/visibility observers.
- Depends on: render facade ([render.ts](render.ts)), action services ([services/habitActions.ts](services/habitActions.ts)), cloud/analysis services ([services/cloud.ts](services/cloud.ts), [services/analysis.ts](services/analysis.ts)).
- Used by: boot lifecycle via `setupEventListeners()` in [index.tsx](index.tsx#L228).

**Domain Services:**
- Purpose: business rules for habits, selectors, AI context rules, quote logic and merges.
- Location: [services/habitActions/](services/habitActions), [services/selectors.ts](services/selectors.ts), [services/analysis.ts](services/analysis.ts), [services/dataMerge/](services/dataMerge).
- Contains: CRUD and schedule rules, streak/summary computation, conflict merge/dedup logic.
- Depends on: central state ([state.ts](state.ts)), persistence/sync adapters, rendering notifications in some action modules.
- Used by: listeners and render modules.

**Persistence & Sync Infrastructure:**
- Purpose: local storage durability and cloud synchronization protocol.
- Location: [services/persistence.ts](services/persistence.ts), [services/cloud.ts](services/cloud.ts), [services/api.ts](services/api.ts).
- Contains: IndexedDB split-state persistence, sync queue/debounce, shard hashing/encryption pipeline, API client and key auth.
- Depends on: worker RPC ([services/workerClient.ts](services/workerClient.ts)), worker contracts ([contracts/worker.ts](contracts/worker.ts)), merge domain ([services/dataMerge.ts](services/dataMerge.ts)).
- Used by: bootstrap, listeners, domain action side effects.

**Worker Compute Layer:**
- Purpose: off-main-thread crypto and heavy payload processing.
- Location: [services/sync.worker.ts](services/sync.worker.ts), [services/workerClient.ts](services/workerClient.ts).
- Contains: PBKDF2 + AES-GCM encryption/decryption, prompt builders, archive/prune helpers.
- Depends on: worker message contracts ([contracts/worker.ts](contracts/worker.ts)).
- Used by: cloud sync and AI analysis pipelines ([services/cloud.ts](services/cloud.ts), [services/analysis.ts](services/analysis.ts)).

**Edge API Layer (Serverless):**
- Purpose: AI gateway and sync backend over edge runtime.
- Location: [api/analyze.ts](api/analyze.ts), [api/sync.ts](api/sync.ts), [api/_httpSecurity.ts](api/_httpSecurity.ts).
- Contains: CORS/rate limiting, AI request validation and caching, shard-based optimistic sync with Redis Lua.
- Depends on: external SDKs defined in [package.json](package.json) (`@google/genai`, `@upstash/redis`).
- Used by: browser client through [services/api.ts](services/api.ts).

## Data Flow

**Boot Flow (local-first):**

1. Browser loads app shell in [index.html](index.html) and module entry [index.tsx](index.tsx).
2. `init()` in [index.tsx](index.tsx#L266) runs i18n, auth, and `loadInitialState()`.
3. `loadState()` in [services/persistence.ts](services/persistence.ts#L244) hydrates `state` from IndexedDB.
4. If sync key exists, cloud fetch starts in background via [services/cloud.ts](services/cloud.ts) while UI boot lock is active.
5. `setupEventListeners()` + `renderApp()` finalize initial interactive frame.

**Interaction-to-State Flow:**

1. User interactions are captured in [listeners/cards.ts](listeners/cards.ts), [listeners/calendar.ts](listeners/calendar.ts), [listeners/modals.ts](listeners/modals.ts).
2. Listeners invoke business actions in [services/habitActions/](services/habitActions) and selector reads in [services/selectors.ts](services/selectors.ts).
3. Actions mutate `state` and emit typed events through [events.ts](events.ts).
4. Render layer re-composes UI through [render.ts](render.ts) and specialized render modules in [render/](render).

**Persistence and Sync Flow:**

1. Action/listener paths call `saveState()` in [services/persistence.ts](services/persistence.ts).
2. Persistence serializes a snapshot from `getPersistableState()` in [state.ts](state.ts) and writes split JSON/binary keys to IndexedDB.
3. Registered sync handler forwards snapshots to [services/cloud.ts](services/cloud.ts).
4. Cloud service shards and hashes state, encrypts via worker RPC ([services/workerClient.ts](services/workerClient.ts) -> [services/sync.worker.ts](services/sync.worker.ts)), and calls `/api/sync` through [services/api.ts](services/api.ts).
5. On conflict (HTTP 409), merge pipeline in [services/dataMerge/](services/dataMerge) reconciles local and remote snapshots, then persists merged result.

**AI Analysis Flow:**

1. Daily context check starts in [services/analysis.ts](services/analysis.ts#L69) from event `request-analysis` emitted in [render.ts](render.ts).
2. Prompt construction can run in worker (`build-quote-analysis-prompt`) via [services/cloud.ts](services/cloud.ts) worker task wrapper.
3. Client posts to `/api/analyze` using [services/api.ts](services/api.ts).
4. Edge handler [api/analyze.ts](api/analyze.ts) validates origin/rate, queries Gemini, returns normalized text response.
5. Diagnosis result is stored in `state.dailyDiagnoses` and persisted.

**State Management:**
- Mutable singleton state object in [state.ts](state.ts) with explicit cache maps and invalidation helpers.
- Domain services own business cache invalidation (`invalidateCachesForDateChange`, `clearAllCaches`) rather than immutable reducers.
- Event helpers in [events.ts](events.ts) are used as global UI synchronization points for rerender and updates.

## Key Abstractions

**Global State Contract (`state` + typed models):**
- Purpose: normalized in-memory model for habits, daily data, archives, sync/AI metadata.
- Examples: [state.ts](state.ts), [types/](types), [contracts/](contracts).
- Pattern: typed mutable store with explicit snapshot extraction via `getPersistableState()`.

**Event Contract Layer (`APP_EVENTS`, `CARD_EVENTS`):**
- Purpose: constrain event names and payload shape across modules.
- Examples: [contracts/events.ts](contracts/events.ts), [events.ts](events.ts).
- Pattern: typed constants + emit wrappers to avoid stringly-coupled listeners.

**Render Facade:**
- Purpose: present a stable API surface while delegating to specialized UI modules.
- Examples: [render.ts](render.ts), [render/calendar.ts](render/calendar.ts), [render/modals.ts](render/modals.ts).
- Pattern: facade + re-export compatibility boundary.

**Worker RPC Contract:**
- Purpose: isolate heavy CPU/crypto from main thread with request/response IDs.
- Examples: [contracts/worker.ts](contracts/worker.ts), [services/workerClient.ts](services/workerClient.ts), [services/sync.worker.ts](services/sync.worker.ts).
- Pattern: message-based RPC with timeout/restart semantics.

## Entry Points

**Web App Entry:**
- Location: [index.tsx](index.tsx), loaded from [index.html](index.html).
- Triggers: browser initial page load / reload.
- Responsibilities: boot sequence, i18n/state init, listener registration, first render, SW registration.

**Service Worker Entry:**
- Location: [sw.js](sw.js).
- Triggers: service worker lifecycle events (`install`, `activate`, `fetch`, `sync`).
- Responsibilities: offline strategies (Workbox or fallback), API bypass, background sync signal to clients.

**Web Worker Entry:**
- Location: [services/sync.worker.ts](services/sync.worker.ts).
- Triggers: `postMessage` from [services/workerClient.ts](services/workerClient.ts).
- Responsibilities: crypto, archive transforms, AI prompt build helpers.

**Edge API Entries:**
- Location: [api/analyze.ts](api/analyze.ts), [api/sync.ts](api/sync.ts).
- Triggers: HTTP requests from browser client.
- Responsibilities: secure origin/rate checks, AI gateway, shard sync with optimistic concurrency.

## Error Handling

**Strategy:** layered fail-soft behavior with user-safe degradation in boot/UI, strict validation at API boundaries, and retriable sync orchestration.

**Patterns:**
- Boot safety and self-healing loop in [index.tsx](index.tsx) (`checkIntegrityAndHeal`, fallback fatal UI).
- Worker timeout and restart semantics in [services/workerClient.ts](services/workerClient.ts) and adaptive retry in [services/cloud.ts](services/cloud.ts).
- Defensive API error normalization in [api/analyze.ts](api/analyze.ts) and [api/sync.ts](api/sync.ts).
- Sync conflict resolution via merge pipeline in [services/dataMerge/](services/dataMerge) and persisted recovery path in [services/cloud.ts](services/cloud.ts).

## Cross-Cutting Concerns

**Logging:** structured app logging wrapper (`logger`) used in [utils.ts](utils.ts) and consumed across [index.tsx](index.tsx), [services/cloud.ts](services/cloud.ts), [services/persistence.ts](services/persistence.ts), [services/api.ts](services/api.ts).

**Validation:**
- Runtime payload and auth validation in edge handlers [api/analyze.ts](api/analyze.ts) and [api/sync.ts](api/sync.ts).
- State migration/version validation in [services/migration.ts](services/migration.ts) during persistence hydration.

**Authentication:**
- Sync identity through locally stored sync key hash in [services/api.ts](services/api.ts) and `X-Sync-Key-Hash` verification in [api/sync.ts](api/sync.ts).
- No user-account auth layer detected; sync auth is key-based per device/user secret.

**Module Boundaries & Coupling:**
- Strong boundary: contracts in [contracts/](contracts) are imported by both runtime sides (main thread and worker), reducing protocol drift.
- Moderate coupling hotspot: [render.ts](render.ts) and [listeners.ts](listeners.ts) each aggregate many module dependencies and act as orchestration hubs.
- Intentional cross-layer coupling: some habit action modules call render/event functions directly (for immediate UX updates), visible in [services/habitActions/shared.ts](services/habitActions/shared.ts) and [services/habitActions/statusTracking.ts](services/habitActions/statusTracking.ts).

---

*Architecture analysis: 2026-04-23*