# Testing Patterns

**Analysis Date:** 2026-04-23

## Test Framework

**Runner:**
- Vitest `^4.1.2`.
- Config: [`vitest.config.ts`](../../vitest.config.ts#L1).

**Assertion Library:**
- API de assercoes do Vitest (`expect`, `toBe`, `toEqual`, `toHaveBeenCalled*`, etc.). Exemplos: [`services/migration.test.ts`](../../services/migration.test.ts#L1), [`listeners/drag.test.ts`](../../listeners/drag.test.ts#L1).

**Run Commands:**
```bash
npm test                 # guardrails + vitest run
npm run test:watch       # modo watch (vitest)
npm run test:coverage    # vitest run --coverage
npm run test:scenario    # suites de cenario
```
Fonte: [`package.json`](../../package.json#L18).

## Test File Organization

**Location:**
- Estrategia hibrida: testes co-localizados por modulo e testes de cenario em pasta dedicada `tests/`.
- Exemplos co-localizados: [`services/dataMerge.test.ts`](../../services/dataMerge.test.ts#L1), [`api/sync.test.ts`](../../api/sync.test.ts#L1), [`listeners/swipe.test.ts`](../../listeners/swipe.test.ts#L1).
- Exemplos em pasta dedicada: [`tests/scenario-test-3-security-pentest.test.ts`](../../tests/scenario-test-3-security-pentest.test.ts#L1), [`tests/render.dom.test.ts`](../../tests/render.dom.test.ts#L1).

**Naming:**
- Padrao observado: `*.test.ts` (31 arquivos detectados).
- Nao foram detectados arquivos `*.spec.*`.

**Structure:**
```text
raiz/
  i18n.test.ts
  utils.test.ts
api/
  *.test.ts
listeners/
  *.test.ts
services/
  *.test.ts
tests/
  scenario-test-*.test.ts
  property/*.property.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
describe('modulo/comportamento', () => {
  beforeEach(() => {
    // reset de estado global, mocks e DOM
  });

  it('deve executar comportamento esperado', () => {
    // arrange
    // act
    // assert
  });
});
```
Exemplos: [`listeners/drag.test.ts`](../../listeners/drag.test.ts#L37), [`api/_httpSecurity.test.ts`](../../api/_httpSecurity.test.ts#L17), [`services/dataMerge.test.ts`](../../services/dataMerge.test.ts#L141).

**Patterns:**
- Setup padrao com `beforeEach` e limpeza de mocks/estado (`vi.clearAllMocks`, `clearTestState`). Exemplos: [`listeners/drag.test.ts`](../../listeners/drag.test.ts#L38), [`services/cloudDataMerge.integration.test.ts`](../../services/cloudDataMerge.integration.test.ts#L151).
- Uso de `afterEach` para limpeza de DOM/listeners quando necessario. Exemplo: [`listeners/drag.test.ts`](../../listeners/drag.test.ts#L49).
- Suites de cenario documentam risco/objetivo no cabecalho do arquivo. Exemplo: [`tests/scenario-test-3-security-pentest.test.ts`](../../tests/scenario-test-3-security-pentest.test.ts#L1).

## Mocking

**Framework:**
- `vi.mock`, `vi.fn`, `vi.spyOn` do Vitest.

**Patterns:**
```typescript
vi.mock('../services/habitActions', () => ({
  handleHabitDrop: vi.fn(),
  reorderHabit: vi.fn(),
}));

vi.spyOn(document, 'elementFromPoint').mockReturnValue(targetZone);
```
Exemplo real: [`listeners/drag.test.ts`](../../listeners/drag.test.ts#L8).

**What to Mock:**
- Modulos de render/UI, APIs externas, persistencia, worker e seletores para isolar unidade sob teste.
- Exemplos: [`services/cloudDataMerge.integration.test.ts`](../../services/cloudDataMerge.integration.test.ts#L6), [`tests/scenario-test-3-security-pentest.test.ts`](../../tests/scenario-test-3-security-pentest.test.ts#L30).

**What NOT to Mock:**
- Nao ha regra formal codificada; observa-se validacao direta de utilitarios puros sem mocks em varios testes.
- Exemplo: [`api/_httpSecurity.test.ts`](../../api/_httpSecurity.test.ts#L1).

## Fixtures and Factories

**Test Data:**
```typescript
const habitId = createTestHabit({ name: 'Mover', time: 'Morning' });
clearTestState();
```
Exemplos: [`listeners/drag.test.ts`](../../listeners/drag.test.ts#L28), [`services/cloudDataMerge.integration.test.ts`](../../services/cloudDataMerge.integration.test.ts#L152).

**Location:**
- Helpers compartilhados em [`tests/test-utils.ts`](../../tests/test-utils.ts).

## Coverage

**Requirements:**
- Thresholds configurados: linhas 80, funcoes 70, branches 70, statements 80.
- Fonte: [`vitest.config.ts`](../../vitest.config.ts#L37).

**Scope configurado para coverage:**
- Inclui principalmente `services/**`, `render/**`, `listeners/**`, `habitActions.ts`, `state.ts`, `utils.ts`.
- Exclui `api/**`, `scripts/**`, arquivos de config e testes.
- Fonte: [`vitest.config.ts`](../../vitest.config.ts#L21).

**View Coverage:**
```bash
npm run test:coverage
```

## Test Types

**Unit Tests:**
- Predominantes no repositório, cobrindo utilitarios, listeners e servicos isolados.
- Exemplos: [`utils.test.ts`](../../utils.test.ts#L1), [`services/migration.test.ts`](../../services/migration.test.ts#L1), [`tests/render.sanitize.test.ts`](../../tests/render.sanitize.test.ts#L1).

**Integration Tests:**
- Detectado teste de integracao explicito para merge cloud + dados locais.
- Exemplo: [`services/cloudDataMerge.integration.test.ts`](../../services/cloudDataMerge.integration.test.ts#L1).

**E2E Tests:**
- Not detected como framework dedicado (Playwright/Cypress nao detectados em `package.json`).
- Ha testes de cenario em Vitest que simulam fluxos mais amplos: [`tests/scenario-test-1-user-journey.test.ts`](../../tests/scenario-test-1-user-journey.test.ts#L1), [`tests/scenario-test-4-cloud-network-resilience.test.ts`](../../tests/scenario-test-4-cloud-network-resilience.test.ts#L1).

## Common Patterns

**Async Testing:**
```typescript
it('rate limit local bloqueia apos exceder maximo', async () => {
  expect((await checkRateLimit(base)).limited).toBe(false);
});
```
Exemplo: [`api/_httpSecurity.test.ts`](../../api/_httpSecurity.test.ts#L40).

**Error Testing:**
```typescript
it('deve lidar graciosamente com valores invalidos', () => {
  const result = migrateState(loaded, APP_VERSION);
  expect(result.monthlyLogs).toBeInstanceOf(Map);
});
```
Exemplo: [`services/migration.test.ts`](../../services/migration.test.ts#L117).

**Property-based Testing:**
- `fast-check` usado para invariantes de merge.
- Exemplo: [`tests/property/merge.property.test.ts`](../../tests/property/merge.property.test.ts#L1).

## Cobertura Percebida e Lacunas

**Gap 1: Cobertura de API fora do relatório de coverage**
- O projeto possui testes em `api/*.test.ts`, mas `api/**` esta excluido do bloco de coverage.
- Evidencia: [`vitest.config.ts`](../../vitest.config.ts#L33), [`api/analyze.test.ts`](../../api/analyze.test.ts#L1), [`api/sync.test.ts`](../../api/sync.test.ts#L1).
- Risco/impacto: regressões em endpoints podem nao aparecer no percentual de coverage e passar despercebidas em metas numericas.

**Gap 2: Ausencia de framework E2E browser real**
- Nao ha Playwright/Cypress detectado; cenarios usam ambiente `happy-dom`.
- Evidencia: [`vitest.config.ts`](../../vitest.config.ts#L6), [`package.json`](../../package.json#L57).
- Risco/impacto: comportamentos de navegador real/PWA (service worker, permissões, install prompts) podem divergir sem deteccao antecipada.

**Gap 3: Divergencia documental de contagem de testes**
- O README de testes apresenta contagens internas nao totalmente coerentes (inventario vs soma global reportada no proprio documento).
- Evidencia: [`tests/README.md`](../../tests/README.md#L14), [`tests/README.md`](../../tests/README.md#L76).
- Risco/impacto: leituras incorretas de saude da suite e dificuldade de governanca de cobertura ao longo do tempo.

---

*Testing analysis: 2026-04-23*
