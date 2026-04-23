# Codebase Concerns

**Analysis Date:** 2026-04-23

## Tech Debt

**[Alta] Orquestrador de sync com responsabilidades demais (acoplamento alto):**
- Issue: Um único módulo combina fila, criptografia, rede, merge de conflito, persistência, UI e logs.
- Files: `services/cloud.ts`
- Impact: Alto risco de regressão em mudanças pequenas; debugging e onboarding lentos.
- Fix approach: Extrair em módulos focados (`syncQueue`, `syncTransport`, `syncConflictResolver`, `syncTelemetry`) com contratos explícitos e testes por unidade.

**[Média] Contratos de tipo frouxos em fronteiras críticas:**
- Issue: Uso recorrente de `any`/`unknown` e coerções em fluxos de erro/worker.
- Files: `services/cloud.ts`, `services/workerClient.ts`, `services/sync.worker.ts`
- Impact: Falhas de runtime passam pelo compilador; manutenção fica dependente de teste manual.
- Fix approach: Tipar payloads/respostas com schemas e narrowings utilitários por task (`zod` ou guards internos).

**[Média] Fallbacks manuais em múltiplos pontos sem centralização:**
- Issue: Repetição de padrões de fallback para decrypt/hash, ETag, retries e parsing.
- Files: `services/cloud.ts`, `api/sync.ts`, `api/analyze.ts`
- Impact: Comportamento inconsistente entre caminhos de erro.
- Fix approach: Centralizar estratégia de retry/fallback em utilitários comuns com telemetria padronizada.

## Known Bugs

**[Média] Falha em request sem body tipado pode gerar erro 500 genérico no analyze:**
- Symptoms: `JSON.parse(bodyText)` falha e retorna erro interno sem resposta 400 específica para payload inválido em alguns cenários.
- Files: `api/analyze.ts`
- Trigger: POST com corpo não-JSON válido e `content-type` inconsistente.
- Workaround: Cliente deve enviar sempre JSON válido; endpoint já retorna 500 com mensagem sanitizada.

**[Baixa] Fallback do SW sem Workbox referencia bundles fixos que podem divergir do build real:**
- Symptoms: Cache offline fallback pode não refletir nomes reais de bundles em algumas variações de build.
- Files: `sw.js`
- Trigger: Ambiente sem `workbox-sw.js` disponível e assets com naming diferente de `/bundle.js` e `/bundle.css`.
- Workaround: Garantir Workbox presente em produção.

## Security Considerations

**[Alta] CORS permissivo por padrão quando allowlist está vazia:**
- Risk: `Access-Control-Allow-Origin: *` para requests cross-origin quando `CORS_ALLOWED_ORIGINS` não está configurado.
- Files: `api/_httpSecurity.ts` (linhas com `allowedOrigins.length === 0` e `return '*'`)
- Current mitigation: Modo estrito opcional (`CORS_STRICT`) e validação de origem quando lista existe.
- Recommendations: Tornar deny-by-default para endpoints sensíveis (`/api/sync`, `/api/analyze`) e falhar startup se allowlist ausente em produção.

**[Alta] Proteção de rate limit degrada para memória local e pode ser burlada horizontalmente:**
- Risk: Sem Redis configurado, o limitador vira in-memory por instância, ineficaz em serverless escalado.
- Files: `api/_httpSecurity.ts` (linha com `if (!redis) return checkRateLimitLocal(options);`)
- Current mitigation: Limiter distribuído quando KV/Upstash está presente.
- Recommendations: Exigir backend distribuído em produção ou aplicar fail-closed para rotas públicas de custo alto.

**[Média] Resposta de erro expõe payload bruto da execução Lua:**
- Risk: Campo `raw` retorna estrutura interna em erro de script/Redis.
- Files: `api/sync.ts` (linha com `raw: result`)
- Current mitigation: Nenhuma sanitização específica desse campo.
- Recommendations: Remover `raw` da resposta pública e registrar detalhes apenas em log interno.

**[Média] Chave de sync permanece em `localStorage`:**
- Risk: Exposição por XSS compromete credencial de sync no cliente.
- Files: `services/api.ts` (`getSyncKey`, `storeKey`, `clearKey`)
- Current mitigation: Uso preferencial de hash (`X-Sync-Key-Hash`) no tráfego; sanitização de HTML em `render/dom.ts`.
- Recommendations: Migrar para armazenamento com menor superfície (session-bound + rotação), e adicionar revogação/expiração curta no backend.

## Performance Bottlenecks

**[Alta] Custo criptográfico por shard elevado durante sync:**
- Problem: Cada shard recalcula derivação PBKDF2 (`iterations: 100000`) e criptografia de forma sequencial.
- Files: `services/cloud.ts` (loop de encrypt por shard), `services/sync.worker.ts` (`deriveKey`)
- Cause: `deriveKey` é executado em cada operação de encrypt/decrypt, sem cache por sessão/chave.
- Improvement path: Cachear `CryptoKey` por `(syncKey,salt-context)` para lote, ou reduzir derivações por request com envelope key.

**[Média] Evicção de cache O(n log n) em `/api/analyze`:**
- Problem: A cada overflow do cache, cria array completo e ordena por timestamp.
- Files: `api/analyze.ts` (`responseCache`, `entries.sort(...)`)
- Cause: Estratégia de eviction por sort global.
- Improvement path: Adotar LRU real (Map com reinserção) e remoção O(1).

**[Média] Fila de sync serial com retries por timeout pode alongar backlog:**
- Problem: Processamento estritamente sequencial + reenfileiramento em falhas transitórias.
- Files: `services/cloud.ts` (`pendingSyncQueue`, `setTimeout(performSync, retryDelayMs)`)
- Cause: Modelo single-flight com backoff fixo e sem priorização por idade/tamanho.
- Improvement path: Backoff exponencial com jitter, limite de tentativas por snapshot e coalescência por hash global.

## Fragile Areas

**[Alta] Pipeline de worker com reset global em timeout:**
- Files: `services/workerClient.ts`
- Why fragile: Timeout de uma task chama `resetWorker('Worker timeout')` e rejeita todas as pendências (`rejectAllPending`).
- Safe modification: Isolar timeout por request com cancelamento granular; evitar derrubar worker em timeout único.
- Test coverage: Não foram detectados testes dedicados para `workerClient`.

**[Média] Reconstrução de estado depende de múltiplos formatos e conversões BigInt/Map:**
- Files: `services/cloud.ts`, `services/persistence.ts`, `services/sync.worker.ts`
- Why fragile: Conversões entre JSON, hex string, `Map` e `BigInt` em vários pontos com fallback silencioso.
- Safe modification: Consolidar codec único de serialização e validar invariantes após decode.
- Test coverage: Existe cobertura parcial em `services/persistence.test.ts` e cenários de sync, mas falta teste de caos focado no codec ponta-a-ponta.

## Scaling Limits

**[Média] Limites de payload de sync podem saturar para usuários com histórico extenso:**
- Current capacity: 256 shards/request, 512KB por shard, 4MB total lógico, 5MB bruto.
- Limit: Requisições grandes retornam `413`, exigindo múltiplos ciclos de envio.
- Scaling path: Chunking incremental por prioridade (core primeiro), compressão por shard e janela de sync adaptativa.

**[Média] Cache em memória do `/api/analyze` não escala entre instâncias:**
- Current capacity: 500 entradas por instância.
- Limit: Cache hit-rate cai com scale-out; custo de IA aumenta.
- Scaling path: Cache distribuído com TTL e chave por hash de prompt/sistema.

## Dependencies at Risk

**[Média] Dependência de `workbox-sw.js` e fallback manual divergente:**
- Risk: Comportamentos diferentes entre runtime com/sem Workbox.
- Impact: Incidentes intermitentes de cache/offline difíceis de reproduzir.
- Migration plan: Unificar estratégia via Workbox obrigatório em produção e teste automatizado do fallback.

**[Baixa] Dependência de `@google/genai` com modelo preview:**
- Risk: Mudanças de comportamento/limite do modelo preview.
- Impact: Instabilidade de resposta e custo imprevisível.
- Migration plan: Parametrizar modelo por env, com fallback para versão estável.

## Missing Critical Features

**[Alta] Ausência de autenticação forte de usuário no endpoint de analyze:**
- Problem: Endpoint depende de rate limit/IP, sem identidade de usuário.
- Blocks: Controle fino de abuso por conta, quotas por plano e auditoria por usuário.

**[Média] Ausência de telemetria estruturada para falhas de sync/worker:**
- Problem: Logs são majoritariamente string-based no cliente; pouca correlação de incidentes.
- Blocks: Diagnóstico rápido em produção e alertas automáticos.

## Test Coverage Gaps

**[Alta] Service Worker sem suíte dedicada detectada:**
- What's not tested: Estratégias de cache Workbox/fallback, navegação offline, fluxos de `sync` event.
- Files: `sw.js`
- Risk: Regressões offline/PWA só aparecem em produção.
- Priority: High

**[Alta] Cliente de worker sem teste unitário dedicado detectado:**
- What's not tested: Timeouts concorrentes, `resetWorker`, limpeza de `pending`, recuperação pós-crash.
- Files: `services/workerClient.ts`
- Risk: Deadlocks/rejeições em cascata em cenário de carga.
- Priority: High

**[Média] Cobertura parcial de cenários adversos do codec de sync:**
- What's not tested: Round-trip com payloads extremos (shards muito grandes, dados corrompidos por shard específico, mistura de versões de codec).
- Files: `services/sync.worker.ts`, `services/cloud.ts`
- Risk: Corrupção silenciosa em bordas de migração/sincronização.
- Priority: Medium

---

*Concerns audit: 2026-04-23*
