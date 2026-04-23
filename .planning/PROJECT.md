# Askesis Audit Quality Initiative

## What This Is

Este projeto organiza uma auditoria técnica de qualidade no Askesis, um rastreador de hábitos local-first com PWA, sync opcional e APIs edge para análise e sincronização. O foco desta iniciativa é avaliar a qualidade real do código no repositório inteiro e transformar achados em um plano de correção pragmático, sem sobre-engenharia e sem mudanças grandes de arquitetura.

## Core Value

Gerar uma visão confiável e acionável da qualidade do projeto, preservando as especificações e o comportamento atual do sistema.

## Requirements

### Validated

- ✓ Aplicação PWA funcional com bootstrap, renderização modular e listeners de interação — existente
- ✓ Persistência local-first com IndexedDB e hidratação de estado no cliente — existente
- ✓ Fluxo de sincronização com backend edge e mecanismo de merge de dados — existente
- ✓ Pipeline de análise/assistência por IA via endpoint dedicado e regras de segurança HTTP — existente
- ✓ Cobertura de testes com Vitest em múltiplos domínios (api, services, listeners, render) — existente

### Active

- [ ] Executar auditoria de qualidade em todo o repositório (frontend, services e api)
- [ ] Classificar achados por severidade, risco e impacto com evidências por arquivo
- [ ] Entregar plano de correção incremental, preservando especificações existentes
- [ ] Definir critérios práticos para evitar sobre-engenharia no plano de mitigação

### Out of Scope

- Reescrever arquitetura central da aplicação nesta fase — restrição explícita de evitar mudanças grandes
- Alterar comportamento funcional já definido pelas especificações — deve ser preservado
- Introduzir escopo de novos recursos de produto — objetivo atual é auditoria e plano

## Context

- Projeto existente (brownfield) com base TypeScript, build por esbuild e deploy orientado a Vercel.
- Arquitetura modular monolítica com estado global, camada de eventos e processamento pesado em worker.
- Mapeamento de codebase já gerado em `.planning/codebase/` como insumo para a auditoria.
- Usuário definiu sucesso como entendimento real da qualidade atual do projeto, com pragmatismo.

## Constraints

- **Escopo**: Repositório inteiro — a auditoria deve cobrir frontend, services e API.
- **Mudança**: Sem mudanças grandes — a primeira entrega é relatório priorizado + plano de correção.
- **Compatibilidade**: Preservar especificações existentes — evitar regressões comportamentais.
- **Pragmatismo**: Evitar sobre-engenharia — recomendações devem ser incrementais e justificadas.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Foco inicial em auditoria de qualidade de código | Necessidade imediata é medir qualidade real antes de mudanças maiores | — Pending |
| Escopo de auditoria no repo inteiro | Evita pontos cegos entre frontend, services e API | — Pending |
| Entrega principal será relatório priorizado + plano de correção | Maximiza clareza de execução sem forçar refactor amplo prematuro | — Pending |
| Restringir mudanças grandes nesta fase | Preserva estabilidade e especificações do sistema | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone**:
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-23 after initialization*
