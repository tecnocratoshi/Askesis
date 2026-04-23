# Stack Research

**Domain:** Brownfield code quality audit for a TypeScript PWA + serverless APIs
**Researched:** 2026-04-23
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| TypeScript | 5.x | Static analysis and safer refactors | Existing codebase is TS-first, so audit and fixes must keep strict typing where possible |
| Vitest | 4.1.x | Unit/integration/regression validation | Already adopted in repository, fast feedback for risk reduction |
| ESLint | 9.x | Lint and consistency checks | Existing lint pipeline and rules can be used as first quality gate |
| esbuild | 0.25.x | Build verification and bundle checks | Current build system, needed to validate non-regressive changes |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vitest/coverage-v8 | 4.1.x | Coverage collection by module | For high-risk areas (sync, api security, worker pipeline) |
| jsdom | 27.x | DOM behavior validation | For render/listener regressions in browser-like tests |
| @vercel/kv | 3.0.x | Distributed limit/storage paths in API | For validating runtime assumptions in security and sync routes |
| @google/genai | 1.27.x | AI analysis endpoint integration surface | For reviewing resilience, failure handling, and cost-risk controls |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| npm scripts | Standardized checks | Reuse current scripts: guardrails, typecheck, test, build |
| Vercel runtime config | Production behavior constraints | Validate env-dependent branches (security, sync, analyze) |
| Existing guardrail scripts | Policy and parity checks | Keep findings tied to scripts under scripts/ to avoid ad-hoc checks |

## Installation

```bash
# No stack migration required for v1 audit phase.
# Reuse current dependencies and scripts from package.json.
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vitest-focused validation | Jest migration | Only if organizational standards require Jest across all repos |
| Incremental refactor by risk wave | Full architecture rewrite | Only after validated baseline and explicit milestone approval |
| Scripted guardrails | Manual QA-only review | Only for one-off exploratory checks, never as primary gate |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Big-bang refactor across sync/api/services | Violates project constraint and increases regression risk | Small risk-prioritized batches with tests |
| Checklist-only audit without evidence | Produces low-trust findings | Evidence-linked findings with file-level references |
| Lint-only quality scoring | Misses behavioral defects and resilience issues | Lint + tests + runtime/security checks |

## Stack Patterns by Variant

**If the change touches critical data paths (sync, merge, crypto):**
- Require before/after tests and a rollback note
- Because these areas have highest user-impact and regression cost

**If the change touches UI-only rendering/listeners:**
- Prefer DOM-level tests and snapshot/behavior assertions
- Because visual and interaction regressions are easier to detect with focused UI tests

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| vitest@4.1.x | jsdom@27.x | Current setup already uses this pair |
| eslint@9.x | typescript@5.x | Existing lint config indicates compatible stack |
| esbuild@0.25.x | TypeScript sources | Existing build.js pipeline already operational |

## Sources

- Repository evidence: package and scripts in /workspaces/Askesis/package.json
- Repository evidence: CI/quality docs in /workspaces/Askesis/docs
- Repository evidence: codebase map in /workspaces/Askesis/.planning/codebase

---
*Stack research for: Askesis quality audit initiative*
*Researched: 2026-04-23*
