# Codebase Structure

**Analysis Date:** 2026-04-23

## Directory Layout

```text
Askesis/
├── api/                 # Edge/serverless endpoints (AI + sync + HTTP hardening)
├── assets/              # Static media (diagram, flags, screenshots)
├── boot/                # Early boot error handling scripts
├── contracts/           # Shared runtime contracts (events, worker messages, API sync)
├── css/                 # Modular stylesheet layers used by app shell
├── data/                # Static domain data (quotes, predefined habits, icons metadata)
├── docs/                # Project docs and architecture records
├── listeners/           # UI/browser event handlers split by interaction domain
├── locales/             # i18n dictionaries (pt, en, es)
├── render/              # Rendering submodules (calendar, chart, modals, DOM helpers)
├── scripts/             # Guardrails and local build/audit scripts
├── services/            # Domain + infra services (actions, persistence, cloud, merge, worker)
├── tests/               # Integration/scenario/property/UI tests and helpers
├── types/               # Type-only declarations and shared model types
├── index.tsx            # Main app entrypoint and lifecycle bootstrap
├── render.ts            # Render facade/orchestrator
├── listeners.ts         # Listener bootstrap/orchestrator
├── state.ts             # Global state and core domain model
├── events.ts            # Event emitter helpers over typed contracts
├── sw.js                # Service Worker runtime
├── build.js             # esbuild-based bundling pipeline
└── package.json         # scripts, dependencies and tooling contracts
```

## Directory Purposes

**api:**
- Purpose: edge runtime HTTP layer for AI analysis and sync storage.
- Contains: request handlers, CORS/rate-limit/security utilities.
- Key files: [api/analyze.ts](api/analyze.ts), [api/sync.ts](api/sync.ts), [api/_httpSecurity.ts](api/_httpSecurity.ts).

**contracts:**
- Purpose: shared message/event contracts consumed across multiple layers.
- Contains: event names/payloads and worker task protocol.
- Key files: [contracts/events.ts](contracts/events.ts), [contracts/worker.ts](contracts/worker.ts), [contracts/api-sync.ts](contracts/api-sync.ts).

**listeners:**
- Purpose: interaction and browser event translation layer.
- Contains: domain-specific handlers for cards, calendar, drag/swipe, modals and sync.
- Key files: [listeners.ts](listeners.ts), [listeners/cards.ts](listeners/cards.ts), [listeners/calendar.ts](listeners/calendar.ts), [listeners/modals.ts](listeners/modals.ts), [listeners/sync.ts](listeners/sync.ts).

**render:**
- Purpose: visual composition and DOM updates.
- Contains: sub-renderers and UI constants/dom utilities.
- Key files: [render.ts](render.ts), [render/habits.ts](render/habits.ts), [render/calendar.ts](render/calendar.ts), [render/chart.ts](render/chart.ts), [render/modals.ts](render/modals.ts), [render/ui.ts](render/ui.ts).

**services:**
- Purpose: business logic and infrastructure adapters.
- Contains: habit actions, selectors, persistence, cloud sync, worker client, migrations, API client.
- Key files: [services/habitActions.ts](services/habitActions.ts), [services/habitActions/index.ts](services/habitActions/index.ts), [services/selectors.ts](services/selectors.ts), [services/persistence.ts](services/persistence.ts), [services/cloud.ts](services/cloud.ts), [services/analysis.ts](services/analysis.ts), [services/workerClient.ts](services/workerClient.ts), [services/sync.worker.ts](services/sync.worker.ts), [services/dataMerge.ts](services/dataMerge.ts).

**tests:**
- Purpose: cross-layer safety net with scenario and integration focus.
- Contains: scenario tests, render/security tests, property tests and fixtures.
- Key files: [tests/scenario-test-1-user-journey.test.ts](tests/scenario-test-1-user-journey.test.ts), [tests/scenario-test-2-sync-conflicts.test.ts](tests/scenario-test-2-sync-conflicts.test.ts), [tests/render.sanitize.test.ts](tests/render.sanitize.test.ts), [tests/property/merge.property.test.ts](tests/property/merge.property.test.ts), [tests/README.md](tests/README.md).

## Key File Locations

**Entry Points:**
- [index.tsx](index.tsx): client bootstrap and lifecycle orchestrator.
- [index.html](index.html): app shell + initial critical rendering path.
- [sw.js](sw.js): service worker entry for offline/background sync.
- [api/analyze.ts](api/analyze.ts): edge AI endpoint.
- [api/sync.ts](api/sync.ts): edge sync endpoint.

**Configuration:**
- [package.json](package.json): scripts, engine and dependencies.
- [tsconfig.json](tsconfig.json): TypeScript project baseline.
- [tsconfig.app.json](tsconfig.app.json): app TS compile target.
- [tsconfig.test.json](tsconfig.test.json): test TS compile target.
- [vitest.config.ts](vitest.config.ts): test runner configuration.
- [eslint.config.mjs](eslint.config.mjs): lint configuration.
- [vercel.json](vercel.json): deployment/runtime routing controls.

**Core Logic:**
- [state.ts](state.ts): domain entities and singleton mutable state.
- [services/habitActions/](services/habitActions): habit behavior and mutation workflows.
- [services/selectors.ts](services/selectors.ts): read models and derived metrics.
- [services/dataMerge/](services/dataMerge): sync conflict resolution internals.

**Testing:**
- [services/*.test.ts](services): service-level unit/integration tests.
- [listeners/*.test.ts](listeners): interaction behavior tests.
- [api/*.test.ts](api): edge handler security and behavior tests.
- [tests/](tests): scenario/e2e-like and property tests.

## Naming Conventions

**Files:**
- Flat modules use `camelCase.ts` or domain nouns at root: [events.ts](events.ts), [render.ts](render.ts), [listeners.ts](listeners.ts).
- Service class-like modules may use PascalCase: [services/HabitService.ts](services/HabitService.ts).
- Tests are colocated with source as `*.test.ts` and also grouped under [tests/](tests) for broader scenarios.

**Directories:**
- Feature/domain folders in lowercase: [services/habitActions](services/habitActions), [services/dataMerge](services/dataMerge), [listeners/modals](listeners/modals).
- Layer-oriented top-level folders (`render`, `listeners`, `services`, `api`) define architectural boundaries.

## Where to Add New Code

**New Feature (UI + behavior):**
- Primary code: add orchestration in [listeners/](listeners) and [services/habitActions/](services/habitActions), render updates in [render/](render).
- Tests: add focused tests near modified service/listener file and scenario coverage in [tests/](tests).
- Rule: keep mutation logic in services; avoid embedding business rules directly in listeners.

**New Component/Module:**
- Implementation: place visual modules in [render/](render) and export through [render.ts](render.ts) only when public façade access is needed.
- Interaction bindings: wire in [listeners.ts](listeners.ts) and corresponding [listeners/*.ts](listeners).

**Utilities:**
- Shared helpers: [utils.ts](utils.ts) for generic cross-layer helpers, or create domain-scoped helper under [services/<feature>/](services) if tightly coupled to a service area.
- Contracts: for cross-thread/cross-layer payloads, add/update types in [contracts/](contracts).

## Couplings, Boundaries, and Hotspots

**High Coupling Hotspots:**
- [index.tsx](index.tsx) couples boot lifecycle with render, sync, persistence and SW registration.
- [render.ts](render.ts) centralizes imports from many render submodules plus services/events.
- [listeners.ts](listeners.ts) binds global browser events and delegates to many listener submodules.
- [services/cloud.ts](services/cloud.ts) couples API, worker RPC, merge logic, UI status and persistence integration.

**Boundary Rules (from current code organization):**
- `contracts` are shared boundary types; do not duplicate event/task names outside [contracts/events.ts](contracts/events.ts) and [contracts/worker.ts](contracts/worker.ts).
- `listeners` should orchestrate user/browser inputs, not persist complex domain logic.
- `render` should consume state/selectors and avoid owning business-side persistence rules.
- `services` may call render/event helpers for immediate UX side effects, but core data invariants remain in service/state modules.

**Safe Modification Strategy for Hotspots:**
- For [services/cloud.ts](services/cloud.ts), keep worker/message protocol changes synchronized with [contracts/worker.ts](contracts/worker.ts) and [services/sync.worker.ts](services/sync.worker.ts).
- For [render.ts](render.ts) and [listeners.ts](listeners.ts), prefer adding new specialized module files in [render/](render) or [listeners/](listeners) and importing there, instead of expanding orchestrators with inline logic.
- For [state.ts](state.ts), preserve field names used in migrations/persistence and validate with [services/migration.test.ts](services/migration.test.ts), [services/persistence.test.ts](services/persistence.test.ts), and sync scenarios under [tests/](tests).

## Special Directories

**.planning/codebase:**
- Purpose: generated codebase map artifacts for GSD planning/execution.
- Generated: Yes.
- Committed: project policy-dependent; currently present in workspace.

**docs:**
- Purpose: human-facing architecture/decision/project quality documentation.
- Generated: No.
- Committed: Yes.

**scripts:**
- Purpose: build guardrails and validation tasks used by npm scripts.
- Generated: No.
- Committed: Yes.

---

*Structure analysis: 2026-04-23*