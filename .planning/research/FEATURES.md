# Feature Landscape — Auditoria de Qualidade de Código (Askesis)

**Domínio:** processo/produto de auditoria de qualidade de código em projeto existente (brownfield)
**Repositório alvo:** Askesis (PWA TypeScript, API serverless, sync local-first)
**Data:** 2026-04-23

## Table Stakes (mínimos obrigatórios)

| Entregável | Por que é obrigatório | Complexidade | Notas Askesis |
|---|---|---|---|
| Inventário de qualidade por área (frontend, services, api, scripts) | Sem mapa de escopo, auditoria vira opinião | Baixa | Usar estrutura já existente em `docs/` e cobertura de testes atual |
| Matriz de achados com severidade e evidência por arquivo | Priorização exige risco + prova | Média | Referenciar caminhos reais e impacto comportamental |
| Regras de aceitação “sem regressão” (preservar especificações) | Restrição explícita do projeto | Baixa | Toda recomendação deve manter comportamento funcional esperado |
| Baseline automatizado de checks (guardrails + typecheck + testes) | Evita auditoria manual frágil | Média | Reusar `guardrail:all`, `typecheck`, `vitest` já presentes |
| Plano incremental de correção (ondas pequenas) | Evita mudança grande e reduz risco | Média | Fatiar por domínio e criticidade |
| Relatório executivo de risco e custo de correção | Permite decisão de roadmap | Baixa | Destacar quick wins vs dívidas estruturais |

## Diferenciadores

| Entregável | Valor adicional | Complexidade | Notas Askesis |
|---|---|---|---|
| Score de maturidade por arquivo/módulo com critérios explícitos | Dá visão longitudinal e comparável | Média | Evoluir modelo de `docs/MATURITY_ASSESSMENT.md` |
| Auditoria orientada a fluxo crítico (sync, crypto, merge, modals) | Foca risco real do produto | Alta | Priorização por impacto no usuário e integridade de dados |
| Trilhas de mitigação com fallback/rollback por item crítico | Reduz risco de regressão em produção | Média | Especialmente para `services/cloud.ts`, `services/dataMerge.ts`, `api/sync.ts` |
| SLO interno de qualidade (tempo de correção por severidade) | Cria disciplina operacional | Média | Ex.: HIGH <= 7 dias, MODERATE <= 30 dias |
| Critérios de “pronto para merge” por tipo de mudança | Melhora consistência de PR | Baixa | Checklist objetivo para refactor incremental |

## Anti-features (o que NAO fazer)

| Anti-feature | Por que evitar | Fazer no lugar |
|---|---|---|
| Reescrever arquitetura central do app nesta fase | Vai contra restrição de “sem mudanças grandes” | Corrigir incrementalmente com evidência e testes |
| Introduzir novo escopo de produto durante auditoria | Dilui foco e atrasa correções de qualidade | Manter foco em qualidade, risco e estabilidade |
| Score opaco/marketing sem rastreabilidade técnica | Não orienta execução real | Exigir evidência por arquivo, regra e teste |
| Bloquear merge por métricas não calibradas | Gera atrito e bypass de processo | Começar com thresholds pragmáticos e subir gradualmente |
| Refactors amplos sem rede de testes mínima | Alto risco de regressão | Exigir testes e validação por onda |

## Complexidade e dependências entre entregáveis

```text
Inventário de qualidade -> Matriz de achados -> Plano incremental de correção
                                 |
                                 v
                      Baseline automatizado de checks
                                 |
                                 v
                    Critérios de pronto para merge (por PR)
                                 |
                                 v
                    Relatório executivo + roadmap de mitigação
```

| Entregável | Depende de | Bloqueia | Complexidade |
|---|---|---|---|
| Inventário de qualidade por área | Nenhum | Matriz de achados | Baixa |
| Matriz de achados com severidade/evidência | Inventário | Plano incremental, relatório executivo | Média |
| Baseline automatizado de checks | Inventário, matriz (para calibrar foco) | Critérios de merge e verificação contínua | Média |
| Plano incremental de correção | Matriz de achados | Execução das ondas de correção | Média |
| Critérios de pronto para merge | Baseline de checks | Governança de PRs | Baixa |
| Relatório executivo de risco/custo | Matriz + plano | Priorização de roadmap | Baixa |

## Critérios de aceitação sugeridos

| Critério | Como validar | Meta sugerida |
|---|---|---|
| Cobertura de escopo da auditoria | Checklist por domínio (frontend/services/api/scripts) | 100% dos domínios cobertos |
| Rastreabilidade dos achados | Cada item com arquivo, severidade, evidência e recomendação | 100% dos achados críticos e altos rastreáveis |
| Preservação de especificações | Testes existentes + smoke checks de fluxos principais | 0 regressões funcionais introduzidas |
| Aderência a “sem mudanças grandes” | Tamanho e foco de PRs de correção | Correções em ondas pequenas e revisáveis |
| Execução do baseline automático | `npm run guardrail:all`, `npm run typecheck`, `npm test` | Pipeline verde antes de promover correções |
| Priorização orientada a risco | Backlog de correção por severidade/impacto | 100% de HIGH com plano e dono definido |
| Qualidade operacional do processo | Lead time e taxa de reabertura de achados | HIGH <= 7 dias, reabertura < 10% |

## MVP recomendado para este contexto

Priorizar primeiro:
1. Inventário de qualidade por domínio + matriz de achados com evidências.
2. Baseline automatizado usando checks já existentes no Askesis.
3. Plano de correção em ondas pequenas, começando por segurança, sync e integridade de dados.

Deferir:
- Benchmarking avançado e score composto sofisticado (só após 1 ciclo completo de correções).
- Expansão para novos recursos de produto (fora do objetivo da auditoria).

## Fontes internas consideradas

- `.planning/PROJECT.md`
- `docs/MATURITY_ASSESSMENT.md`
- `docs/DEPENDENCY-AUDIT.md`
- `docs/CI_METRICS.md`
- `docs/ARCHITECTURE.md`
- `package.json` e scripts de guardrail
