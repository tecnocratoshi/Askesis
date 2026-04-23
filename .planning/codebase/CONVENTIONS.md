# Coding Conventions

**Analysis Date:** 2026-04-23

## Naming Patterns

**Files:**
- Predomina `camelCase`/`PascalCase` por domínio em TypeScript, com nomes descritivos por responsabilidade (ex.: `services/HabitService.ts`, `services/habitActions.ts`, `render/modalBuilders.ts`). Exemplos: [`services/HabitService.ts`](../../services/HabitService.ts#L1), [`services/habitActions.ts`](../../services/habitActions.ts), [`render/modalBuilders.ts`](../../render/modalBuilders.ts).
- Testes seguem sufixo `.test.ts` em raiz e subpastas; não há uso detectado de `.spec.*`. Exemplos: [`services/dataMerge.test.ts`](../../services/dataMerge.test.ts#L1), [`tests/render.sanitize.test.ts`](../../tests/render.sanitize.test.ts#L1), [`api/_httpSecurity.test.ts`](../../api/_httpSecurity.test.ts#L1).

**Functions:**
- Funcoes e helpers usam `camelCase`; constantes de funcao curta tambem aparecem com prefixo `get`/`set`/`is`/`parse`. Exemplos: [`utils.ts`](../../utils.ts#L14), [`api/analyze.ts`](../../api/analyze.ts#L22), [`services/api.ts`](../../services/api.ts#L21).
- Handlers de API usam `export default async function handler(req: Request)`. Exemplos: [`api/analyze.ts`](../../api/analyze.ts#L105), [`api/sync.ts`](../../api/sync.ts#L146).

**Variables:**
- Variaveis locais usam `camelCase` (`cacheKey`, `rawBodyBytes`, `mergedLogs`). Exemplos: [`api/analyze.ts`](../../api/analyze.ts#L159), [`api/sync.ts`](../../api/sync.ts#L217), [`services/dataMerge.test.ts`](../../services/dataMerge.test.ts#L173).
- Constantes de modulo usam `UPPER_SNAKE_CASE` para limites, chaves e regex. Exemplos: [`api/analyze.ts`](../../api/analyze.ts#L18), [`api/sync.ts`](../../api/sync.ts#L62), [`utils.ts`](../../utils.ts#L200).

**Types:**
- Tipos e interfaces em `PascalCase`, com `type` unions e `interface` extensivamente. Exemplos: [`state.ts`](../../state.ts#L14), [`state.ts`](../../state.ts#L30), [`api/sync.ts`](../../api/sync.ts#L122).
- Uso recorrente de `readonly`, `as const`, `Record<>`, `Partial<>` para imutabilidade e modelagem. Exemplos: [`state.ts`](../../state.ts#L21), [`state.ts`](../../state.ts#L154), [`state.ts`](../../state.ts#L40).

## Code Style

**Formatting:**
- Identacao observada com 4 espacos em arquivos TypeScript analisados. Exemplos: [`services/HabitService.ts`](../../services/HabitService.ts#L14), [`api/sync.ts`](../../api/sync.ts#L147).
- Nao foi detectada configuracao de Prettier no repositório (`.prettierrc*` ausente).

**Linting:**
- Lint principal e `typecheck` via script `lint` (`npm run typecheck`). Exemplo: [`package.json`](../../package.json#L10).
- ESLint configurado em flat config com parser `@typescript-eslint/parser` e regras de seguranca DOM. Exemplo: [`eslint.config.mjs`](../../eslint.config.mjs#L1).
- Regra `eqeqeq` com excecao para `null`, e `no-explicit-any` em nivel `warn`. Exemplo: [`eslint.config.mjs`](../../eslint.config.mjs#L22).

## Import Organization

**Order:**
1. Dependencias externas primeiro (quando existem)
2. Modulos internos relativos do projeto
3. Em testes, mocks (`vi.mock`) antes dos imports de unidades quando necessario para isolamento

Exemplos:
- Externo antes de interno: [`render/dom.ts`](../../render/dom.ts#L9)
- Apenas internos relativos: [`state.ts`](../../state.ts#L9)
- Mock antes de import de unidade: [`listeners/drag.test.ts`](../../listeners/drag.test.ts#L8)

**Path Aliases:**
- Nao foram detectados aliases de path (imports relativos `./` e `../` predominam). Exemplos: [`services/api.ts`](../../services/api.ts#L9), [`api/analyze.ts`](../../api/analyze.ts#L8).

## Error Handling

**Patterns:**
- Boundary handlers (API) validam precondicoes e retornam `Response` com `status` especifico (400/401/403/405/408/413/429/500). Exemplos: [`api/analyze.ts`](../../api/analyze.ts#L111), [`api/sync.ts`](../../api/sync.ts#L154).
- Helpers `getErrorMessage`/normalizacao de erro para tratar `unknown` com fallback seguro. Exemplos: [`api/analyze.ts`](../../api/analyze.ts#L90), [`api/sync.ts`](../../api/sync.ts#L127).
- Em app/browser, uso frequente de `try/catch` com degradacao graciosa em caminhos nao criticos (storage, push, notificacoes). Exemplo: [`utils.ts`](../../utils.ts#L342).

## Security Practices

- Sanitizacao centralizada de HTML com DOMPurify e hardening adicional (remoção de `on*` e `javascript:`). Exemplo: [`render/dom.ts`](../../render/dom.ts#L38).
- Guardrail de CI/local para bloquear sinks sensiveis de `innerHTML` em alvos criticos de UI. Exemplo: [`scripts/guardrail-security-html.js`](../../scripts/guardrail-security-html.js#L12).
- ESLint reforca politicas contra atribuicao direta em `innerHTML` e uso de fragment APIs nao aprovadas. Exemplo: [`eslint.config.mjs`](../../eslint.config.mjs#L25).
- API valida CORS por allowlist, aplica rate limit e limites de payload. Exemplos: [`api/_httpSecurity.ts`](../../api/_httpSecurity.ts), [`api/sync.ts`](../../api/sync.ts#L101), [`api/analyze.ts`](../../api/analyze.ts#L118).

## Logging

**Framework:** console encapsulado por `logger` utilitario.

**Patterns:**
- `logger.info/warn/error` como camada de app; `console` direto concentrado em scripts/build/API ou no wrapper. Exemplos: [`utils.ts`](../../utils.ts#L258), [`services/api.ts`](../../services/api.ts#L14), [`scripts/guardrail-security-html.js`](../../scripts/guardrail-security-html.js#L63).
- `SHOULD_LOG` condiciona logs em ambiente nao-producao em partes do codigo. Exemplos: [`utils.ts`](../../utils.ts#L253), [`api/sync.ts`](../../api/sync.ts#L17).

## Comments

**When to Comment:**
- Comentarios explicam motivacao/risco (performance, robustez, seguranca) mais do que operacoes triviais. Exemplos: [`api/analyze.ts`](../../api/analyze.ts#L142), [`services/HabitService.ts`](../../services/HabitService.ts#L13), [`vitest.config.ts`](../../vitest.config.ts#L5).

**JSDoc/TSDoc:**
- Uso frequente de blocos `@file`, `@description` e cabecalho de licenca SPDX. Exemplos: [`state.ts`](../../state.ts#L1), [`services/api.ts`](../../services/api.ts#L1), [`render/dom.ts`](../../render/dom.ts#L1).

## Function Design

**Size:**
- Mistura de helpers pequenos e modulos com funcoes extensas de orquestracao, especialmente em API/sync e servicos de merge. Exemplos: [`utils.ts`](../../utils.ts#L14), [`api/sync.ts`](../../api/sync.ts#L146), [`services/HabitService.ts`](../../services/HabitService.ts#L207).

**Parameters:**
- Parametros tipados explicitamente; frequente uso de objetos para options/config. Exemplos: [`api/sync.ts`](../../api/sync.ts#L172), [`api/analyze.ts`](../../api/analyze.ts#L119), [`utils.ts`](../../utils.ts#L331).

**Return Values:**
- Guard clauses e retornos antecipados sao amplamente usados para reduzir nesting. Exemplos: [`render/dom.ts`](../../render/dom.ts#L71), [`services/api.ts`](../../services/api.ts#L68), [`utils.ts`](../../utils.ts#L202).

## Module Design

**Exports:**
- Predominam named exports em modulos utilitarios/servicos; endpoints usam default export do handler. Exemplos: [`utils.ts`](../../utils.ts#L14), [`services/api.ts`](../../services/api.ts#L61), [`api/analyze.ts`](../../api/analyze.ts#L105).

**Barrel Files:**
- Not applicable: nao foi observado padrao dominante de barrel `index.ts` para reexport de dominios.

## Gaps Observados

- Falta de configuracao de formatter dedicada (Prettier nao detectado) aumenta risco de divergencia de estilo entre contribuicoes.
  - Risco/impacto: diffs maiores e revisao menos previsivel em PRs longos.
- Regra `@typescript-eslint/no-explicit-any` em `warn` permite `any` residual em areas sensiveis (mocking e wrappers).
  - Risco/impacto: perda de garantias de tipo em fluxos de erro e integracao.

---

*Convention analysis: 2026-04-23*
