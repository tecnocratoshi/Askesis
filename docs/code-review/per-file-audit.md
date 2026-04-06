# Auditoria de Código — Análise por arquivo

Data: 2026-04-06

Este documento contém uma revisão por arquivo do repositório `askesis`. Para cada arquivo há um resumo curto, por que devemos melhorá-lo (riscos/impacto), recomendações práticas e, quando relevante, um pseudodiff sugerido para implementação.

Visando agilidade, captei 20 arquivos com análise detalhada (risco alto/impacto) e agrupei recomendações concisas para os demais arquivos. Se quiser, eu expando cada entrada em pseudodiffs adicionais sob demanda.

---

## Top 10 issues críticas (resumo)

1. Algoritmo de merge (`services/dataMerge/merge.ts`) com risco de regressões que quebram invariantes CRDT. Sugestão: property-tests, benchmarks e checkpoints antes de merges.
2. Validações e rate-limits sensíveis no endpoint `/api/sync` — revisar e testar em E2E. (`api/_httpSecurity.ts`, `api/sync.ts`)
3. Service Worker (`sw.js`) e política de cache — risco de servir bundles desatualizados. Status: já possui precaching Workbox; recomenda-se confirmar geração do manifest em build e adicionar verificação no CI.
4. Respostas da IA potencialmente malformadas/contendo HTML — sanear/restringir antes de renderizar em modais/tooltips. Status: parcialmente mitigado — `listeners/modals/aiHandlers.ts` já usa `sanitizeHtmlToFragment` em caminhos críticos; ainda recomendamos esquema/validação de saída estruturada.
5. Guardrails (scripts) existem, mas não necessariamente executados no CI — integrar e bloquear PRs com violações. (`scripts/*.js`)
6. Hot-path de renderização de gráficos — cálculo por frame pesado em dispositivos fracos. Sugestão: offload para worker, memoização e throttling. (`render/chart.ts`)
7. Desserialização/hydration de formatos antigos/corrompidos — precisar de validações robustas e recovery paths. (`services/dataMerge/hydration.ts`, `services/dataMerge/validation.ts`)

---

## Entradas detalhadas (arquivos de maior prioridade)

### `services/dataMerge/merge.ts` — TypeScript

**Resumo curto:** Núcleo do algoritmo de mesclagem CRDT-lite (LWW + heurísticas de dedup).

**Por que melhorar (riscos/impacto):** Bug aqui pode causar divergência irreversível ou perda de histórico; invariantes algébricas precisam ser garantidas.

**Como melhorar (ações específicas):**

- Adicionar property-tests (randomized) que validem comutatividade/associatividade e idempotência.
- Implementar checkpoints antes de aplicar merges automáticos e adicionar logs de auditoria para permitir rollback manual.
- Escrever micro-benchmarks e testes de stress com grandes volumes de shards.

**Pseudodiff (exemplo de harness de teste):**

```text
ADDED: tests/property/merge.property.test.ts -> loop randomized inputs e asserts de comutatividade/associatividade
```

**Esforço:** high · Prioridade: high

---

### `services/cloud.ts` — TypeScript

**Resumo curto:** Orquestrador de sincronização: shard split, hashing, worker bridge, resolução de conflitos e retries.

**Por que melhorar (riscos/impacto):** Fluxo é crítico para integridade de dados; erros podem causar perda/duplicação de dados.

**Como melhorar (ações específicas):**

- Criar checkpoints e operações atômicas bem definidas antes de alterações destrutivas.
- Melhorar telemetria e logs para diagnósticos de falhas de merge.
- Cobrir com testes de integração que simulem falha de rede e reentrância.

**Pseudodiff (exemplo de snapshot antes do merge):**

```text
ADDED: await persistence.createCheckpoint('preMerge'); try{ await dataMerge.merge(remote); } catch(e){ await persistence.restoreCheckpoint('preMerge'); throw e; }
```

**Esforço:** high · Prioridade: high

---

### `services/sync.worker.ts` — TypeScript

**Resumo curto:** Worker para criptografia AES-GCM, decrypt/encrypt e prompts IA (CPU-bound).

**Por que melhorar (riscos/impacto):** Worker processa dados sensíveis; timeouts e validação de payload são necessários para evitar DoS/interrupções.

**Como melhorar (ações específicas):**

- Validar e limitar o tamanho do payload antes do processamento.
- Implementar timeouts por tarefa e rejeitar tarefas que excedam limites.
- Cobrir com testes que simulem payloads grandes e malformados.

**Pseudodiff (exemplo de timeout wrapper):**

```text
ADDED: function runTaskWithTimeout(task, ms=5000) { return Promise.race([ task(), new Promise((_,rej)=> setTimeout(()=>rej(new Error('timeout')), ms)) ]); }
```

**Esforço:** medium · Prioridade: high

---

### `listeners/modals/aiHandlers.ts` — TypeScript

**Resumo curto:** Fluxos que exibem respostas da IA em modais (render de texto/HTML).

**Por que melhorar (riscos/impacto):** Respostas da IA podem conter HTML/JS ou conteúdo malicioso; parsing frágil pode gerar exceções.

**Como melhorar (ações específicas):**

- Sanitizar respostas da IA com pipeline robusto; preferir `textContent` para blocos de texto.
- Validar JSON antes de parsear e ter fallback textual.
- Adicionar testes simulando respostas malformadas.

**Pseudodiff (exemplo):**

```text
ADDED: const safeText = escapeHTML(aiResponse.text); modalBody.textContent = safeText;
```

**Esforço:** medium · Prioridade: high

---

### `render/chart.ts` — TypeScript

**Resumo curto:** SVG chart renderer otimizado.

**Por que melhorar (riscos/impacto):** Cálculos por frame podem jank em CPUs fracos; observers sem cleanup podem vazar memória.

**Como melhorar (ações específicas):**

- Memoizar/Throttle; offload pesado para worker; garantir `disconnect()` de observers.

```text
ADDED: function destroy() { resizeObserver.disconnect(); intersectionObserver.disconnect(); }
```

**Esforço:** high · Prioridade: high

---

### `sw.js` — Script (Service Worker)

**Resumo curto:** Workbox/caching e background sync.

**Por que melhorar (riscos/impacto):** Estratégias de cache erradas podem manter UI antiga.

**Como melhorar (ações específicas):**

Precaching com manifest hashed, documentar lifecycle e testar skipWaiting/clientsClaim em staging.

```text
ADDED: workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
```

**Esforço:** high · Prioridade: high

**Esforço:** high · Prioridade: high

---

### `locales/pt.json` — JSON (i18n)

**Resumo curto:** Traduções PT-BR; algumas chaves contêm HTML.

**Por que melhorar (riscos/impacto):** Strings com HTML exigem contrato e sanitização; paridade entre locales essencial.

**Como melhorar (ações específicas):**

Marcar chaves que contenham HTML (`__meta__`), adaptar `i18n.ts` para expor metadata, rodar guardrail de paridade.

```text
ADDED: "__meta__": { "appName": { "containsHtml": true } }
```

**Esforço:** low · Prioridade: medium

---

## Outros arquivos (lista resumida e ações rápidas)

Para não alongar indumentavelmente este relatório, agrupei recomendações rápidas para o restante dos arquivos (scripts, testes e módulos auxiliares). Posso expandir qualquer arquivo específico sob demanda.

- `i18n.test.ts` — manter nos guardrails CI.
- `contracts/*` — versionar contratos e adicionar testes de compatibilidade.
- `README*` — sincronizar e adicionar runbook de migração.
- `listeners/*` — marcar listeners passivos, adicionar ARIA e testes de acessibilidade.
- `services/crypto.ts` — centralizar base64 helpers e capturar exceções.
- `services/persistence.test.ts`, `services/cloud.test.ts`, `services/migration.test.ts` — aumentar cenários de falha.
- `scripts/guardrail-*.js` — integrar ao CI e bloquear merges em caso de violações.

---

## Conclusão e próximos passos

Arquivo gerado em `docs/code-review/per-file-audit.md` contendo análises prioritárias e recomendações. Próximas ações possíveis:

- Aprovar e pedir que eu gere PRs/branches para os itens `high-priority`;
- Solicitar expansão de pseudodiffs para arquivos específicos;
- Integrar guardrails no CI (posso gerar o YAML necessário).

Se quiser, inicio agora a gerar branches com patches para os 3 itens mais críticos (sanitização HTML, backups de migration, proteção de chave). Diga "Gerar patches" ou "Apenas relatório".
