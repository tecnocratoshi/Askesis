# Relatório de Maturidade por Arquivo (sem testes)

## Resumo Executivo

- O workspace mostra boa maturidade geral, com forte base de segurança no backend (`api/`) e boa cobertura de erros em serviços críticos.
- Pontos fortes: rate limit robusto, validações de payload, fallback seguro, uso consistente de Web Crypto e retries de rede.
- Principal dívida técnica está na camada de UI render/listeners, com uso intenso de `innerHTML` e arquivos muito grandes/acoplados.
- A modularização de `services/habitActions/*`, `services/dataMerge/*` e `listeners/modals/*` reduziu acoplamento em pontos críticos.
- Tipagem: `services/cloud.ts` e `services/sync.worker.ts` zerados de `any`; `services/selectors.ts` tem 1 `any` residual.
- `render/modals.ts` endurecido com `sanitizeHtmlToFragment()` — XSS via modal eliminado.
- Performance está razoável: existem caches, debounce e agendamento; hot paths de DOM usam `setTrustedSvgContent` e `sanitizeHtmlToFragment`.
- Priorização recomendada: simplificar drag e swipe, consolidar helpers duplicados.

## Escala

- **L5 Excelente**: 86-100
- **L4 Maduro**: 76-85
- **L3 Sólido**: 66-75
- **L2 Em evolução**: 51-65
- **L1 Frágil**: 0-50

## Ponderação por arquivo

| Arquivo | Score | Nível | Justificativa |
| --- | ---: | --- | --- |
| api/_httpSecurity.ts | 89 | L5 Excelente | Rate limit híbrido, validação de origem/IP e fallback resiliente. |
| api/analyze.ts | 86 | L5 Excelente | Timeout, limites, CORS estrito e sanitização de erro bem tratados. |
| api/sync.ts | 85 | L4 Maduro | Validações fortes e concorrência otimista; fluxo Lua é complexo. |
| build.js | 78 | L4 Maduro | Script robusto; copia o app shell sem transformação por regex e valida presença do bundle. |
| constants.ts | 84 | L4 Maduro | Constantes centralizadas, sem lógica arriscada e boa legibilidade. |
| i18n.ts | 82 | L4 Maduro | Fallbacks, cache Intl e timeout; módulo extenso. |
| index.css | 72 | L3 Sólido | Estilo pequeno e direto; baixo risco estrutural. |
| index.html | 70 | L3 Sólido | Estrutura simples; pouca lógica e risco moderado. |
| index.tsx | 74 | L3 Sólido | Boot resiliente, mas com fallback de erro via `innerHTML`. |
| listeners.ts | 77 | L4 Maduro | Orquestração clara de eventos com debounce e proteções. |
| manifest.json | 78 | L4 Maduro | Configuração PWA direta e estável. |
| metadata.json | 68 | L3 Sólido | Metadado simples, sem validação formal de schema. |
| package-lock.json | 60 | L2 Em evolução | Arquivo gerado e volumoso, difícil auditoria manual. |
| package.json | 80 | L4 Maduro | Configuração de projeto consistente e scripts claros. |
| render.ts | 74 | L3 Sólido | `setTrustedSvgContent` consolidado; `replaceWithHtmlFragment` local removida. |
| state.ts | 79 | L4 Maduro | Tipagem ampla e caches claros; alguns `any` persistem. |
| sw.js | 71 | L3 Sólido | Estratégias de cache úteis, mas fluxo offline é complexo. |
| tsconfig.json | 83 | L4 Maduro | Configuração TypeScript estável e adequada ao projeto. |
| utils.ts | 76 | L4 Maduro | Utilitários robustos, sanitização e helpers performáticos. |
| vercel.json | 76 | L4 Maduro | Deploy config enxuta e sem riscos aparentes. |
| vitest.config.ts | 77 | L4 Maduro | Critérios de cobertura e timeout bem definidos. |
| css/base.css | 74 | L3 Sólido | Base consistente, baixo risco de manutenção. |
| css/calendar.css | 72 | L3 Sólido | Estilos específicos, complexidade moderada. |
| css/charts.css | 73 | L3 Sólido | Focado em visualização; manutenção média. |
| css/components.css | 72 | L3 Sólido | Organização razoável, sem sinais críticos. |
| css/forms.css | 72 | L3 Sólido | Escopo claro e pouca superfície de risco. |
| css/habits.css | 71 | L3 Sólido | Arquivo funcional, provável acoplamento com classes dinâmicas. |
| css/header.css | 74 | L3 Sólido | Simples e previsível para manutenção. |
| css/layout.css | 74 | L3 Sólido | Estrutura estável, risco baixo. |
| css/modals.css | 70 | L3 Sólido | Maior complexidade visual e acoplamento com JS. |
| css/variables.css | 80 | L4 Maduro | Tokens centralizados melhoram consistência e manutenção. |
| data/icons.ts | 83 | L4 Maduro | Repositório controlado de ícones com sanitização associada. |
| data/predefinedHabits.ts | 71 | L3 Sólido | Dados estáticos úteis; uso de `any` reduz higiene. |
| data/quotes.ts | 69 | L3 Sólido | Grande massa de dados; pouca lógica, difícil revisão manual. |
| listeners/calendar.ts | 74 | L3 Sólido | Eventos bem definidos; fluxo de interação extenso. |
| listeners/cards.ts | 68 | L3 Sólido | Manipulação DOM direta com restauração por `innerHTML`. |
| listeners/chart.ts | 73 | L3 Sólido | Interações de ponteiro adequadas, complexidade moderada. |
| listeners/drag.ts | 62 | L2 Em evolução | Máquina de estado complexa e alto acoplamento ao DOM. |
| listeners/modals.ts | 76 | L4 Maduro | Handlers extraídos para aiHandlers, fullCalendarHandlers, formHandlers. |
| listeners/modals/aiHandlers.ts | 80 | L4 Maduro | `sanitizeHtmlToFragment` nos 2 paths; offline quote e online message seguros. |
| listeners/modals/fullCalendarHandlers.ts | 80 | L4 Maduro | Navegação bem encapsulada; navegateToDate privada. |
| listeners/modals/formHandlers.ts | 79 | L4 Maduro | Handlers de form/pickers bem isolados; validateAndFeedback privada. |
| listeners/swipe.ts | 64 | L2 Em evolução | Gesto complexo com muitos listeners globais. |
| listeners/sync.ts | 72 | L3 Sólido | Fluxo de sync claro, porém manipula HTML direto. |
| locales/en.json | 78 | L4 Maduro | Catálogo estruturado e consistente para runtime. |
| locales/es.json | 77 | L4 Maduro | Boa cobertura textual, manutenção manual inevitável. |
| locales/pt.json | 76 | L4 Maduro | Base principal estável, risco baixo de execução. |
| render/calendar.ts | 66 | L3 Sólido | Render eficiente, mas usa `innerHTML` em blocos críticos. |
| render/chart.ts | 71 | L3 Sólido | Bom foco de performance; complexidade visual média. |
| render/constants.ts | 83 | L4 Maduro | Constantes de render bem isoladas e seguras. |
| render/dom.ts | 82 | L4 Maduro | Utilitários DOM focados e reutilizáveis. |
| render/habits.ts | 76 | L4 Maduro | `setTrustedSvgContent` em todos os 10 sinks de ícone; zero `createContextualFragment` local. |
| render/icons.ts | 79 | L4 Maduro | Catálogo central e coerente com sanitização de uso. |
| render/modals.ts | 72 | L3 Sólido | `sanitizeHtmlToFragment()` implementado; único `innerHTML` restante é o parser sandbox interno. |
| render/rotary.ts | 73 | L3 Sólido | Interação rica, mas com complexidade de eventos. |
| render/ui.ts | 77 | L4 Maduro | Mapeamento UI centralizado e previsível. |
| scripts/dev-api-mock.js | 68 | L3 Sólido | Mock útil, com tratamento de erro básico. |
| services/HabitService.ts | 82 | L4 Maduro | Lógica bitmask sólida e foco claro de responsabilidade. |
| services/analysis.ts | 76 | L4 Maduro | Tratamento de erro e fluxo assíncrono bem definidos. |
| services/api.ts | 84 | L4 Maduro | Timeout, retries e hash de chave bem implementados. |
| services/badge.ts | 74 | L3 Sólido | Escopo pequeno, robustez adequada. |
| services/cloud.ts | 83 | L4 Maduro | Zero `any`; DecryptedCore type guard; erro tipado com instanceof. |
| services/crypto.ts | 80 | L4 Maduro | AES-GCM/PBKDF2 correto; faltam validações extras de entrada. |
| services/dataMerge.ts | 86 | L4 Maduro | Barrel estável para API pública; merge modular em `services/dataMerge/*`. |
| services/habitActions.ts | 84 | L4 Maduro | Barrel estável para API pública; lógica modular em `services/habitActions/*`. |
| services/migration.ts | 73 | L3 Sólido | Migração defensiva, porém dependente de casts amplos. |
| services/persistence.ts | 78 | L4 Maduro | Persistência resiliente com debounce e fallback adequados. |
| services/quoteEngine.ts | 75 | L3 Sólido | Algoritmo rico, porém complexo e difícil de validar integralmente. |
| services/selectors.ts | 74 | L3 Sólido | Caches úteis; 1 `any` residual em getHabitDisplayInfo (source). |
| services/sync.worker.ts | 80 | L4 Maduro | Zero `any`; isRecord() guard; payloads tipados. |
| types/global.d.ts | 79 | L4 Maduro | Tipos globais úteis e baixo risco operacional. |

## Top 10 para priorizar melhoria

1. listeners/drag.ts — simplificar máquina de estado e reduzir complexidade ciclomática.
2. listeners/swipe.ts — auditar listeners globais `window.*` e garantir remoção em todos os caminhos.
3. listeners/cards.ts — revisar restoração DOM e padronizar helpers.
4. services/crypto.ts — adicionar validações extras de entrada (tamanho de chave/IV).
5. services/migration.ts — reduzir casts amplos com type guards explícitos.
6. services/quoteEngine.ts — simplificar algoritmo e aumentar cobertura de testes.
7. render/rotary.ts — revisar complexidade de eventos de ponteiro.
8. index.tsx — substituir fallback de erro via `innerHTML` por construção DOM segura.
9. data/predefinedHabits.ts — remover `any` e adicionar tipo explícito.
10. package-lock.json — `npm audit`; revisar dependências e policy de atualização.

---
Obs.: Esta ponderação é heurística e orientada a priorização prática, não substitui threat model formal.
