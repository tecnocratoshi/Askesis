# Arquitetura de Execucao da Auditoria Brownfield

Data: 2026-04-23
Escopo: repositorio inteiro (frontend, services, api)
Objetivo: produzir diagnostico priorizado e plano de correcao incremental, preservando comportamento existente

## 1) Componentes do processo

### 1.1 Inventario
Responsabilidade:
- Mapear superficie auditavel por dominio (frontend, services, api, contratos, testes, scripts)
- Capturar baseline de saude tecnica sem alterar codigo
- Consolidar evidencias primarias por arquivo/modulo

Entradas:
- Estrutura do repositorio
- Testes existentes e estado de execucao
- Configuracoes de build/lint/seguranca
- Mapeamento tecnico existente em `.planning/codebase/`

Saidas (artefatos):
- INVENTORY.md: mapa de modulos, ownership logico e criticidade
- BASELINE.md: status inicial (testes, areas sem cobertura, hotspots)
- EVIDENCE/index.json: indice de evidencias com path, tipo, severidade preliminar

Criterios de conclusao:
- 100% das areas core catalogadas
- Evidencias rastreaveis para cada area de risco identificada

### 1.2 Analise
Responsabilidade:
- Avaliar qualidade por dimensao: corretude, seguranca, confiabilidade, manutencao e testabilidade
- Correlacionar sinais (ex.: area sem testes + alta complexidade + alto acoplamento)
- Transformar evidencia em achado reproduzivel

Entradas:
- INVENTORY.md
- BASELINE.md
- Evidencias brutas por arquivo

Saidas (artefatos):
- FINDINGS.md: achados com impacto, causa raiz, evidencia e reproducao
- RISK-MATRIX.md: probabilidade x impacto x detectabilidade
- SPEC-DELTA.md: divergencias entre comportamento observado e comportamento esperado

Criterios de conclusao:
- Todo achado tem evidencia e reproducao
- Achados classificados por severidade e area de negocio afetada

### 1.3 Priorizacao
Responsabilidade:
- Ordenar achados por risco real e custo de mitigacao
- Proteger estabilidade do sistema (primeiro o que quebra usuario/dados/seguranca)
- Definir lotes pequenos de execucao (quick wins + correcoes estruturais pontuais)

Entradas:
- FINDINGS.md
- RISK-MATRIX.md
- Restricoes do projeto (sem reescrita ampla)

Saidas (artefatos):
- PRIORITY-BACKLOG.md: fila priorizada com justificativa
- FIX-BATCHES.md: lotes incrementais com dependencia e criterio de aceite
- DECISION-LOG.md: registro de trade-offs e itens adiados

Criterios de conclusao:
- Backlog ordenado por risco/custo/impacto
- Dependencias explicitas entre lotes

### 1.4 Plano
Responsabilidade:
- Converter prioridades em plano executavel por fase/trilha
- Definir verificacao objetiva por item (testes, regressao, comportamento)
- Estabelecer gates de aprovacao para avancar entre fases

Entradas:
- PRIORITY-BACKLOG.md
- FIX-BATCHES.md
- SPEC-DELTA.md

Saidas (artefatos):
- EXECUTION-PLAN.md: fases, trilhas, criterios de entrada/saida e verificacoes
- UAT-CHECKLIST.md: checks funcionais de preservacao de comportamento
- RELEASE-RISK.md: risco residual e plano de rollback por lote

Criterios de conclusao:
- Plano completo com checkpoints e criterios de aceite
- Risco residual documentado por lote

## 2) Fluxo de dados entre componentes

Fluxo principal:
1. Inventario coleta fatos e gera baseline + evidencias indexadas.
2. Analise consome baseline/evidencias e gera achados com reproducao.
3. Priorizacao converte achados em backlog ordenado e lotes executaveis.
4. Plano transforma lotes em fases/trilhas com gates de verificacao.
5. Execucao (fora deste documento) roda lote a lote e retroalimenta evidencias.

Contrato de dados por transicao:
- Inventario -> Analise:
  - Evidencia estruturada obrigatoria: arquivo, contexto, sintoma, impacto potencial
  - Sem evidencia minima, item nao entra em analise
- Analise -> Priorizacao:
  - Achado obrigatoriamente com severidade, reproducao e causa raiz plausivel
  - Sem reproducao, item fica como "hipotese" e nao vira prioridade alta
- Priorizacao -> Plano:
  - Cada item priorizado exige criterio de aceite e estrategia de verificacao
  - Itens sem criterio de aceite nao entram em lote de execucao

Trilhas paralelas recomendadas:
- Trilha A (Seguranca e dados): API, sync, persistencia e criptografia
- Trilha B (Confiabilidade funcional): listeners, render, estado global
- Trilha C (Testabilidade e manutencao): lacunas de teste, acoplamentos e complexidade

Regra de sincronizacao entre trilhas:
- Merge de backlog semanal com reconciliacao de dependencias
- Itens transversais (ex.: estado/sync) sobem para coordenacao unica

## 3) Build order recomendado

Ordem macro (brownfield-safe):
1. Baseline e inventario completo (sem tocar implementacao)
2. Achados criticos de seguranca e integridade de dados
3. Achados de regressao funcional com impacto de usuario
4. Fortalecimento de testes e checks de regressao nas areas tocadas
5. Refinos de manutencao de baixo risco (debt localizada)

Ordem por lote:
1. Lote 0 - Observabilidade e prova de nao-regressao
2. Lote 1 - Correcao critica (security/data loss)
3. Lote 2 - Correcao alta (quebra fluxo principal)
4. Lote 3 - Correcao media (inconsistencias e falhas de UX funcional)
5. Lote 4 - Debt tecnica de baixo risco e alto retorno

Politica de tamanho de lote:
- Limite de blast radius por lote: ate 3 modulos nucleares
- Limite de tempo alvo: 1 a 3 dias por lote
- Se exceder limite, quebrar lote antes de implementar

## 4) Pontos de controle para evitar sobre-engenharia

Gate 1 - Evidencia antes de mudanca:
- Nenhuma refatoracao entra sem achado concreto e impacto demonstrado

Gate 2 - Menor mudanca suficiente:
- Preferir patch local sobre redesenho de camada
- Rejeitar "refactor por estetica" sem ganho de risco/estabilidade

Gate 3 - Compatibilidade comportamental:
- Toda mudanca deve provar preservacao de fluxo existente via testes/UAT

Gate 4 - Custo x retorno:
- Se esforco estimado for alto e risco baixo, adiar para backlog de melhoria

Gate 5 - Escopo protegido:
- Proibido introduzir features novas durante correcao de auditoria

Gate 6 - Dependencia explicita:
- Nao iniciar lote com precondicoes incompletas

Sinais de alerta de over-engineering:
- Proposta de criar nova arquitetura sem necessidade de risco
- Alteracao simultanea de muitos modulos sem evidencia proporcional
- Mudanca sem criterio de aceite mensuravel

## 5) Preservacao de comportamento/especificacoes existentes

Principios:
- Spec-first: comportamento atual validado por testes e UAT e considerado contrato
- Mudanca reversivel: cada lote com estrategia clara de rollback
- Delta controlado: registrar o que mudou e por que mudou

Mecanismos praticos:
- Criar baseline funcional antes de cada lote (testes + cenarios criticos)
- Usar SPEC-DELTA.md para qualquer divergencia entre esperado e observado
- Exigir "evidencia de preservacao" no fechamento do lote:
  - Testes relevantes passando
  - Cenarios UAT principais validados
  - Sem regressao em fluxo de sync/persistencia/render

Matriz de preservacao (minima):
- Persistencia local: sem perda de dados e sem quebra de hidratacao
- Sync: sem duplicacao/perda em conflitos e sem quebra de auth/chave
- Render e interacao: sem regressao de fluxo principal de habitos
- API: sem regressao de seguranca HTTP e contratos de resposta

Politica para mudanca de especificacao:
- Se for necessario mudar comportamento, registrar ADR curta antes da implementacao
- Toda mudanca de spec deve sair de "auditoria" e entrar como fase de produto separada

## 6) Blueprint de fases e artefatos (recomendado)

Fase 1 - Descoberta orientada por evidencia
- Trilha A/B/C em paralelo para inventario e baseline
- Entregas: INVENTORY.md, BASELINE.md, EVIDENCE/index.json

Fase 2 - Analise de risco e consolidacao de achados
- Cruzamento de evidencias e reproducao obrigatoria
- Entregas: FINDINGS.md, RISK-MATRIX.md, SPEC-DELTA.md

Fase 3 - Priorizacao executiva e planejamento incremental
- Ordenacao por risco/custo/impacto + definicao de lotes
- Entregas: PRIORITY-BACKLOG.md, FIX-BATCHES.md, DECISION-LOG.md, EXECUTION-PLAN.md

Fase 4 - Execucao controlada (iterativa)
- Implementacao lote a lote com gates de preservacao
- Entregas por lote: changelog tecnico, evidencias de teste/UAT, risco residual

Fase 5 - Fechamento da auditoria
- Revisao de risco residual e backlog remanescente
- Entregas: AUDIT-CLOSEOUT.md com recomendacoes para proximo ciclo
