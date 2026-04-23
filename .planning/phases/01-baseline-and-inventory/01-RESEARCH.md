# Phase 1: Baseline and Inventory - Research

**Researched:** 2026-04-23
**Domain:** Baseline de auditoria de qualidade de repositório e inventario orientado a criticidade
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Inventory model
- **D-01:** The inventory should be organized primarily by criticality, not by directory tree alone.
- **D-02:** Criticality taxonomy for Phase 1 is: core, high risk, support, peripheral.
- **D-03:** Inventory output should still preserve source area references so later phases can map back to frontend, services, api, scripts, and supporting docs.

### Baseline validation
- **D-04:** Phase 1 uses a minimum baseline rather than a full gate stack.
- **D-05:** The minimum baseline must include typecheck and tests.
- **D-06:** Build and extra coverage checks are deferred unless planning identifies a clear dependency for Phase 1 deliverables.

### Evidence format
- **D-07:** Evidence should be stored as a single consolidated report rather than split files.
- **D-08:** The consolidated report should be organized by risk level.
- **D-09:** Evidence entries should remain reproducible and link back to concrete files, scripts, and test artifacts.

### the agent's Discretion
- Exact document names for inventory and evidence outputs.
- Whether the consolidated report uses tables, sections, or hybrid formatting.
- How much metadata to store per evidence item, as long as reproducibility is preserved.

### Deferred Ideas (OUT OF SCOPE)
- Build as a mandatory part of baseline - deferred to planning unless Phase 1 dependencies require it.
- Coverage expansion for critical areas - deferred to later planning or Phase 2 if needed for evidence quality.
- Full findings severity modeling - explicitly out of scope for Phase 1 and belongs to Phase 2.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BASE-01 | Team can generate a repository-wide inventory of auditable modules (frontend, services, api, scripts) with criticality tags. | Taxonomia operacional (core/high risk/support/peripheral), algoritmo de classificacao por modulo e formato de inventario com area-fonte. |
| BASE-02 | Team can run a baseline quality gate (guardrails, typecheck, tests, build) and store reproducible results. | Estrategia de comandos baseline em dois niveis (minimo obrigatorio + checagens opcionais) com captura de evidencias reproduziveis. |
| BASE-03 | Team can maintain a structured evidence index linking each finding to concrete files and verification artifacts. | Modelo de evidencia consolidada com IDs estaveis de entrada e campos obrigatorios para rastreabilidade file/script/artifact. |
</phase_requirements>

## Summary

A Fase 1 deve ser planejada como uma fase de fundacao de evidencias, nao de remediacao. O foco pratico e produzir uma visao completa e repetivel do estado atual do repositorio, para que a Fase 2 possa classificar riscos sem retrabalho estrutural [VERIFIED: repo .planning/phases/01-baseline-and-inventory/01-CONTEXT.md].

O projeto ja possui scripts de qualidade relevantes (`guardrail:all`, `typecheck`, `test`, `build`) e uma suite de testes consolidada em Vitest, portanto a abordagem recomendada e reutilizar o pipeline atual em vez de criar comando paralelo [VERIFIED: repo package.json] [VERIFIED: repo .planning/codebase/TESTING.md]. A principal decisao de planejamento e separar o que e baseline minimo obrigatorio para Fase 1 do que fica como validacao opcional de confianca.

Para atender BASE-01/02/03 de forma concreta, recomenda-se um unico artefato consolidado da fase com secoes: inventario por criticidade, baseline execution log, e indice de evidencia por item com links diretos para arquivos/scripts/resultados [VERIFIED: repo .planning/phases/01-baseline-and-inventory/01-CONTEXT.md] [VERIFIED: repo .planning/REQUIREMENTS.md].

**Primary recommendation:** Use um unico relatorio consolidado `01-BASELINE-INVENTORY-EVIDENCE.md` com inventario por criticidade + baseline minimo reproduzivel + indice de evidencias por ID.

## Project Constraints (from copilot-instructions.md)

Arquivo `./copilot-instructions.md` nao encontrado na raiz do workspace durante esta pesquisa; nenhuma diretiva adicional de projeto foi extraida desse caminho [VERIFIED: workspace lookup].

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Inventario de modulos auditaveis | Process/Governance | Repo Structure | E uma capacidade de analise documental sobre estrutura e ownership dos modulos. |
| Classificacao por criticidade (core/high risk/support/peripheral) | Process/Governance | Architecture | A classificacao e um criterio de priorizacao de auditoria, nao uma alteracao de runtime. |
| Execucao do baseline de qualidade | Tooling/CI | Local Dev Runtime | A baseline depende de scripts npm e ambiente Node para gerar sinais reproduziveis. |
| Consolidacao de evidencia | Process/Governance | Tooling/CI | O artefato final agrega saidas de comandos e referencias de codigo em formato auditavel. |

## Standard Stack

### Core
| Library/Tool | Version | Purpose | Why Standard |
|--------------|---------|---------|--------------|
| Node.js | >=24 <25 | Runtime para scripts e pipeline de validacao | Contrato explicito do projeto em `engines` [VERIFIED: repo package.json]. |
| npm scripts | n/a | Orquestracao reproducivel de guardrails/typecheck/test/build | Ja institucionalizado no repositiorio [VERIFIED: repo package.json]. |
| TypeScript (`tsc`) | ^5.9.3 | Validacao estatica de tipos para app e testes | Ja dividido em `typecheck:app` e `typecheck:test` [VERIFIED: repo package.json]. |
| Vitest | ^4.1.2 | Execucao da suite de testes baseline | Framework de teste atual do projeto [VERIFIED: repo package.json] [VERIFIED: repo .planning/codebase/TESTING.md]. |

### Supporting
| Library/Tool | Version | Purpose | When to Use |
|--------------|---------|---------|-------------|
| scripts/guardrail-* | repo local | Regras de seguranca HTML, paridade de locais, auditoria e SW manifest | Sempre na baseline para capturar sinais de qualidade transversais. |
| tests/README.md | repo local | Snapshot de convencoes/saude da suite | Consulta para interpretar resultados e lacunas de cobertura. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| npm scripts existentes | Novo script ad-hoc de auditoria | Aumenta variacao operacional e reduz reproducibilidade entre fases. |
| Relatorio unico consolidado | Relatorios separados por area | Facilita autoria local, mas quebra D-07 e dificulta leitura unica para Fase 2. |

**Installation:**
```bash
npm ci
```

**Version verification:**
- Versoes acima foram verificadas no manifesto local e nao no registry remoto nesta execucao [VERIFIED: repo package.json].
- Confirmacao de latest no npm registry permaneceu pendente por indisponibilidade da execucao de shell neste contexto [ASSUMED].

## Practical Inventory Approach (Criticality Taxonomy)

Taxonomia obrigatoria: `core`, `high risk`, `support`, `peripheral` [VERIFIED: repo .planning/phases/01-baseline-and-inventory/01-CONTEXT.md].

### Metodo recomendado (executavel)
1. Enumerar superficies auditaveis em quatro areas-raiz: `frontend`, `services`, `api`, `scripts` e docs de suporte [VERIFIED: repo .planning/REQUIREMENTS.md] [VERIFIED: repo .planning/codebase/STRUCTURE.md].
2. Atribuir criticidade por impacto de regressao e blast radius, nao por tamanho de pasta.
3. Registrar cada modulo com `source_area`, `criticality`, `owner_pattern`, `rationale` e `verification_pointer`.
4. Validar cobertura do inventario: pelo menos uma entrada por area critica citada em BASE-01.

### Regras de classificacao por criticidade
| Classe | Regra pratica | Exemplos do repositorio |
|--------|---------------|-------------------------|
| core | Quebra afeta fluxo principal do app ou integridade de estado | `state.ts`, `index.tsx`, `render.ts`, `services/persistence.ts` [VERIFIED: repo .planning/codebase/ARCHITECTURE.md]. |
| high risk | Superficie de seguranca, sincronizacao, criptografia, concorrencia ou endpoint externo | `api/sync.ts`, `api/analyze.ts`, `services/cloud.ts`, `services/workerClient.ts` [VERIFIED: repo .planning/codebase/CONCERNS.md]. |
| support | Camadas de apoio relevantes mas com menor blast radius | `listeners/*`, `render/*`, `data/*`, `locales/*` [VERIFIED: repo .planning/codebase/STRUCTURE.md]. |
| peripheral | Artefatos auxiliares/documentais que nao mudam comportamento de runtime principal | `docs/*`, `assets/*`, metadados e utilitarios nao criticos. |

## Baseline Command Strategy

### Minimum required (fase 1)
Alinhado a D-04/D-05: rodar baseline minimo com typecheck e testes, incluindo guardrails ja acoplados ao `npm test` [VERIFIED: repo .planning/phases/01-baseline-and-inventory/01-CONTEXT.md] [VERIFIED: repo package.json].

```bash
npm run typecheck
npm test
```

### Optional checks (quando houver dependencia clara)
Alinhado a D-06 e BASE-02:

```bash
npm run build
npm run test:coverage
npm run check:deps
```

### Sequencia recomendada para reproducibilidade
```bash
npm ci
npm run typecheck
npm test
# opcionais
npm run build
```

### Nota de alinhamento BASE-02 x D-06
- `BASE-02` lista build no quality gate [VERIFIED: repo .planning/REQUIREMENTS.md].
- `D-06` permite deferir build na Fase 1 sem dependencia explicita [VERIFIED: repo .planning/phases/01-baseline-and-inventory/01-CONTEXT.md].
- Recomendacao de planejamento: tratar `build` como check opcional com criterio de promote-to-required documentado no plano 01-02.

## Evidence Model (Single Consolidated Report)

Modelo recomendado: um unico arquivo com secoes por risco e entradas com schema estavel [VERIFIED: repo .planning/phases/01-baseline-and-inventory/01-CONTEXT.md].

### Estrutura proposta do relatorio consolidado
1. `Inventory by Criticality`
2. `Baseline Execution`
3. `Evidence Index`
4. `Open Gaps and Assumptions`

### Schema de entrada reproduzivel (por evidencia)
| Field | Required | Example |
|-------|----------|---------|
| evidence_id | yes | `E-01-API-SYNC-001` |
| requirement_ref | yes | `BASE-02` |
| criticality | yes | `high risk` |
| source_area | yes | `api` |
| target | yes | `api/sync.ts` |
| command | yes | `npm test` |
| artifact | yes | `stdout hash / timestamp / section` |
| reproducibility | yes | `npm ci && npm test` |
| status | yes | `pass/fail/warn` |
| notes | optional | contexto de interpretacao |

### Regras de evidencia
- Uma evidencia por observacao relevante, sem agregacao opaca.
- Cada evidencia deve apontar para arquivo real e comando reproduzivel.
- Sem anexos fragmentados obrigatorios: o relatorio consolidado e a fonte canonica.

## Suggested File Naming Conventions (Phase Artifacts)

Padrao sugerido para Fase 1 (prefixo numerico + tipo de artefato):

| Artifact Type | Suggested Name | Purpose |
|---------------|----------------|---------|
| Relatorio consolidado (principal) | `01-BASELINE-INVENTORY-EVIDENCE.md` | Inventario + baseline + indice de evidencia em um unico lugar. |
| Snapshot bruto opcional de comando | `01-BASELINE-CMDLOG.txt` | Captura literal da execucao para auditoria forense (opcional). |
| Mapa auxiliar de inventario (se necessario) | `01-INVENTORY-MAP.md` | Apoio de leitura; se usado, resumir no consolidado para manter D-07. |

Convencoes:
- Prefixo de fase fixo (`01-`) para ordenacao natural.
- UPPER-SNAKE para tipo de artefato multi-palavra.
- Datas apenas dentro do conteudo (evitar no nome para manter estabilidade de referencias).

## Architecture Patterns

### System Architecture Diagram

```text
[Repo Surfaces]
 frontend | services | api | scripts | docs
            |
            v
 [Criticality Classifier]
 (core/high risk/support/peripheral)
            |
            v
 [Baseline Runner]
 npm run typecheck -> npm test -> (optional build/coverage)
            |
            v
 [Evidence Normalizer]
 (evidence_id + requirement_ref + file/artifact pointers)
            |
            v
 [Consolidated Report]
 01-BASELINE-INVENTORY-EVIDENCE.md
            |
            v
 [Phase 2 Input]
 findings + risk classification
```

### Recommended Project Structure
```text
.planning/phases/01-baseline-and-inventory/
├── 01-CONTEXT.md
├── 01-RESEARCH.md
└── 01-BASELINE-INVENTORY-EVIDENCE.md
```

### Pattern 1: Inventory-first, Evidence-second
**What:** primeiro inventariar por criticidade, depois executar baseline e anexar evidencia.
**When to use:** fases de fundacao de auditoria.
**Example:**
```text
for each source_area in [frontend, services, api, scripts]:
  enumerate modules
  assign criticality
run baseline commands
for each signal:
  write evidence entry with file+command+artifact
```

### Anti-Patterns to Avoid
- **Inventario por arvore de diretorios apenas:** perde nocao de risco real e fere D-01.
- **Executar comandos fora de scripts oficiais:** reduz reproducibilidade do baseline.
- **Separar evidencia em multiplos arquivos sem indice canonico:** fere D-07/D-09.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Orquestracao de qualidade | Shell script novo paralelo | Scripts de `package.json` existentes | Ja codificam guardrails + testes e sao conhecidos pela equipe. |
| Runner de testes customizado | Harness proprio | Vitest atual | Evita drift de comportamento e manutencao desnecessaria. |
| Modelo de evidencia sem schema | Texto livre por achado | Tabela com campos obrigatorios + IDs | Garante rastreabilidade e reproducao em Fases 2/3. |

**Key insight:** nesta fase, o risco principal nao e falta de ferramenta, e falta de padrao reproduzivel.

## Common Pitfalls

### Pitfall 1: Confundir criticidade com tamanho/complexidade de pasta
**What goes wrong:** modulos pequenos, mas de alto risco (ex.: API sync/security), ficam subpriorizados.
**Why it happens:** classificacao visual por tree em vez de blast radius.
**How to avoid:** aplicar regra de impacto de regressao e superficie de risco antes de considerar volume de codigo.
**Warning signs:** entradas `api/*` e `services/cloud.ts` aparecendo como support/peripheral sem justificativa.

### Pitfall 2: Baseline nao comparavel entre execucoes
**What goes wrong:** resultados mudam por ambiente/comando manual diferente.
**Why it happens:** ausencia de sequencia padrao e metadados de execucao.
**How to avoid:** fixar estrategia minima (`npm ci`, `typecheck`, `test`) e registrar comandos literais por evidencia.
**Warning signs:** relatorio sem comando exato, sem timestamp, sem ponteiro de artefato.

### Pitfall 3: Evidencia sem rastreabilidade de requisito
**What goes wrong:** achados nao conectam BASE-01/02/03 e planejamento da Fase 2 fica fraco.
**Why it happens:** indice sem `requirement_ref` e sem `evidence_id` estavel.
**How to avoid:** obrigar `requirement_ref` em toda entrada e validar cobertura por requisito no fechamento da fase.
**Warning signs:** relatorio com texto narrativo sem tabela de indice.

## Recommendations Mapped to BASE-01, BASE-02, BASE-03

| Requirement | Recommendation | Execution Guidance |
|-------------|----------------|--------------------|
| BASE-01 | Adotar inventario por criticidade em 4 classes e manter `source_area` obrigatorio. | Criar tabela principal por modulo com colunas `module`, `source_area`, `criticality`, `rationale`, `verification_pointer`. |
| BASE-02 | Executar baseline minimo com scripts existentes e checks opcionais condicionais. | Rodar `npm run typecheck` e `npm test`; executar `npm run build` apenas quando houver dependencia declarada no plano. |
| BASE-03 | Consolidar toda evidencia em relatorio unico com schema reproduzivel. | Definir IDs estaveis (`E-01-*`), referenciar arquivo/comando/artefato em cada entrada e incluir secao de cobertura por requisito. |

## Code Examples

### Baseline command block (ready to copy)
```bash
npm ci
npm run typecheck
npm test
# optional on-demand checks
npm run build
npm run test:coverage
```

### Evidence entry template
```markdown
| evidence_id | requirement_ref | criticality | source_area | target | command | artifact | reproducibility | status |
|-------------|-----------------|-------------|-------------|--------|---------|----------|-----------------|--------|
| E-01-API-SYNC-001 | BASE-02 | high risk | api | api/sync.ts | npm test | vitest output section "api/sync" | npm ci && npm test | pass |
```

## Open Questions (RESOLVED)

1. **Build obrigatorio na Fase 1?**
  - Decision: build fica condicional por gatilho objetivo no plano 01-02.
  - Trigger objetivo: executar `npm run build` quando houver mudanca em runtime/build surface (`index.tsx`, `render/**`, `listeners/**`, `services/**`, `api/**`, `sw.js`, `build.js`, `package.json`, `tsconfig*.json`).
  - Resultado para esta fase: como os artefatos planejados sao apenas em `.planning/**`, build permanece deferido com justificativa registrada.

2. **Formato final do relatorio consolidado?**
  - Decision: formato hibrido obrigatorio (sumario curto + tabelas estruturadas).
  - Estrutura fixa: `Inventory by Criticality`, `Baseline Execution`, `Evidence Index`, `Open Gaps and Assumptions`.
  - Rationale: preserva leitura executiva e rastreabilidade tecnica no mesmo artefato canonico.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Baseline scripts | Unknown in this run | — | Nao ha fallback real para scripts npm |
| npm | Baseline scripts | Unknown in this run | — | Nao ha fallback real |
| Vitest | `npm test` | Expected from repo deps | ^4.1.2 (manifesto) | Instalacao via `npm ci` |
| TypeScript | `npm run typecheck` | Expected from repo deps | ^5.9.3 (manifesto) | Instalacao via `npm ci` |

**Missing dependencies with no fallback:**
- Nao verificado por execucao de shell nesta sessao; validar com `node -v` e `npm -v` antes da execucao do plano [ASSUMED].

**Missing dependencies with fallback:**
- Nenhum fallback robusto para ausencia de Node/npm.

## Validation Architecture

Desabilitado para esta fase neste repositorio (`workflow.nyquist_validation: false`) [VERIFIED: repo .planning/config.json].

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Fase 1 e de baseline/inventario |
| V3 Session Management | no | Fase 1 e de baseline/inventario |
| V4 Access Control | no | Fase 1 e de baseline/inventario |
| V5 Input Validation | yes | Validacao de estrutura de evidencia e referencias para evitar entradas inconsistentes |
| V6 Cryptography | no | Sem implementacao criptografica nova nesta fase |

### Known Threat Patterns for this phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Evidencia nao reproduzivel (tampering processual) | Tampering | Schema obrigatorio de evidencia + comando literal + ponteiro de artefato |
| Omissao de modulo critico no inventario | Repudiation | Checklist de cobertura por area (`frontend/services/api/scripts`) |
| Drift entre baseline e scripts oficiais | Integrity | Proibir comandos ad-hoc fora de `package.json` |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | O ambiente da maquina tem Node/npm disponiveis para executar baseline | Environment Availability | Bloqueia completamente BASE-02 durante execucao |
| A2 | Versoes de dependencias no manifesto sao suficientes sem upgrade para executar Fase 1 | Standard Stack | Pode gerar falhas inesperadas se lockfile/ambiente estiver divergente |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: repo .planning/phases/01-baseline-and-inventory/01-CONTEXT.md] - decisoes D-01..D-09 e escopo.
- [VERIFIED: repo .planning/REQUIREMENTS.md] - requisitos BASE-01/02/03 e rastreabilidade.
- [VERIFIED: repo .planning/ROADMAP.md] - objetivo e criterios de sucesso da Fase 1.
- [VERIFIED: repo .planning/codebase/STRUCTURE.md] - superficies auditaveis por area.
- [VERIFIED: repo .planning/codebase/ARCHITECTURE.md] - hotspots e papel de modulos core.
- [VERIFIED: repo .planning/codebase/CONCERNS.md] - superficies de alto risco.
- [VERIFIED: repo .planning/codebase/TESTING.md] - padrao de execucao de testes.
- [VERIFIED: repo package.json] - comandos baseline disponiveis.

### Secondary (MEDIUM confidence)
- Nenhuma fonte externa foi necessaria para esta fase.

### Tertiary (LOW confidence)
- Disponibilidade efetiva de ferramentas locais (Node/npm) sem verificacao de shell nesta sessao [ASSUMED].

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - scripts e framework estao explicitamente definidos no repositorio.
- Architecture: HIGH - mapeamento de areas e hotspots ja documentado em artefatos de codebase.
- Pitfalls: HIGH - derivado de decisoes locked + concerns mapeados.

**Research date:** 2026-04-23
**Valid until:** 2026-05-23