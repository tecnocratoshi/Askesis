# Domain Pitfalls: Auditorias Técnicas de Qualidade em Projetos Ativos

**Domínio:** auditoria técnica de qualidade em produto ativo (brownfield)
**Pesquisado em:** 2026-04-23

## Pitfalls Críticos

### Pitfall: Falso positivo por regra estática sem contexto de domínio
**Sinal precoce:** Ferramenta marca muitos "erros" em módulos estáveis e bem testados, mas sem falhas reproduzíveis.
**Impacto:** Perda de confiança no processo de auditoria, retrabalho e priorização errada de correções.
**Estratégia de prevenção:** Exigir triagem em duas etapas (automação + validação humana com evidência), usando critério mínimo de reprodução ou impacto observável antes de abrir ação.
**Em que fase deve ser tratado:** Preparação da auditoria e primeira triagem de achados.

### Pitfall: Falso positivo por interpretação literal de testes frágeis
**Sinal precoce:** Falhas intermitentes (flaky) passam a ser tratadas como defeito de código sem análise de estabilidade do teste.
**Impacto:** Correções desnecessárias no produto, ruído no backlog e atraso para tratar defeitos reais.
**Estratégia de prevenção:** Medir taxa de flakiness por suíte, repetir execução em ambiente limpo e classificar achado como "instável" até confirmação consistente.
**Em que fase deve ser tratado:** Verificação técnica dos achados e validação de evidências.

### Pitfall: Escopo inflado por checklist genérico sem objetivo de negócio
**Sinal precoce:** Auditoria vira lista extensa de "melhorias" sem conexão com risco real, SLA, segurança ou regressão funcional.
**Impacto:** Paralisia de execução, custo elevado e atraso no plano de mitigação de alto impacto.
**Estratégia de prevenção:** Definir objetivo explícito da auditoria (confiabilidade, segurança, mantenibilidade) e usar matriz risco x esforço para cortar itens de baixo retorno.
**Em que fase deve ser tratado:** Definição de escopo e critérios de aceitação da auditoria.

### Pitfall: Escopo inflado por mistura de auditoria com refatoração ampla
**Sinal precoce:** Recomendações passam de correções pontuais para propostas de reescrita arquitetural sem incidente que justifique.
**Impacto:** Aumento de risco de regressão, ciclo longo de entrega e perda de foco no problema original.
**Estratégia de prevenção:** Separar trilhas: auditoria corretiva incremental agora e estudos de evolução arquitetural em roadmap próprio com business case.
**Em que fase deve ser tratado:** Planejamento de mitigação e priorização por ondas.

### Pitfall: Regressão causada por recomendação genérica de performance
**Sinal precoce:** Sugestões como memoização, cache ou batching são aplicadas sem baseline de latência e sem perfil real de uso.
**Impacto:** Complexidade acidental, bugs de consistência e piora de manutenção sem ganho mensurável.
**Estratégia de prevenção:** Tornar obrigatório o par baseline + meta + métrica pós-mudança; bloquear recomendação sem experimento comparável.
**Em que fase deve ser tratado:** Desenho técnico da correção e validação pós-implementação.

### Pitfall: Regressão funcional por correção orientada apenas a lint
**Sinal precoce:** Pull requests focam em "zerar warnings" e alteram fluxos críticos sem cobertura adicional de testes.
**Impacto:** Quebra de comportamento esperado em produção, especialmente em fluxos de estado e sincronização.
**Estratégia de prevenção:** Exigir teste de contrato/comportamento para qualquer mudança em módulo crítico; lint não substitui validação funcional.
**Em que fase deve ser tratado:** Implementação das correções e gate de revisão.

## Pitfalls Moderados

### Pitfall: Confundir severidade técnica com prioridade de produto
**Sinal precoce:** Itens de alta severidade teórica entram na frente de problemas de alta frequência real.
**Impacto:** Backlog desalinhado com risco operacional e experiência do usuário.
**Estratégia de prevenção:** Priorizar por severidade x frequência x detectabilidade x impacto no usuário, com pesos definidos antes da triagem.
**Em que fase deve ser tratado:** Ranqueamento de backlog de achados.

### Pitfall: Recomendação genérica de segurança sem ameaça aplicável
**Sinal precoce:** Adoção de controles complexos que não respondem ao modelo de ameaça do sistema atual.
**Impacto:** Sobrecusto operacional, complexidade em deploy e falsa sensação de segurança.
**Estratégia de prevenção:** Mapear ameaça por superfície real de ataque; só aceitar mitigação com vínculo explícito a ameaça e evidência de redução de risco.
**Em que fase deve ser tratado:** Análise de risco e definição de contramedidas.

### Pitfall: Critério de aceite ambíguo para fechamento de achados
**Sinal precoce:** Issue é marcada como resolvida sem prova objetiva de que o risco caiu.
**Impacto:** Reabertura recorrente de problemas e perda de rastreabilidade de qualidade.
**Estratégia de prevenção:** Definir Definition of Done por tipo de achado (evidência, teste, monitoramento e documentação mínima).
**Em que fase deve ser tratado:** Fechamento de tarefas e revisão final.

## Pitfalls Menores

### Pitfall: Linguagem alarmista no relatório de auditoria
**Sinal precoce:** Uso excessivo de termos críticos sem quantificação técnica.
**Impacto:** Resistência do time, fadiga de alerta e comunicação ineficiente com decisores.
**Estratégia de prevenção:** Padronizar taxonomia de severidade com exemplos concretos e escala de impacto objetiva.
**Em que fase deve ser tratado:** Redação do relatório e comunicação executiva.

### Pitfall: Falta de recorte temporal para recomendações
**Sinal precoce:** Relatório mistura ações imediatas, trimestrais e estratégicas no mesmo pacote de execução.
**Impacto:** Dificuldade de planejamento e percepção de que "nada avança".
**Estratégia de prevenção:** Separar recomendações em janelas (imediato, curto prazo, médio prazo) com dono e prazo por item.
**Em que fase deve ser tratado:** Planejamento de execução pós-auditoria.

## Fontes e base de confiança

- Base principal: contexto do projeto em PROJECT.md e padrões recorrentes de auditoria em projetos brownfield.
- Confiança geral: MÉDIA, com foco pragmático para execução incremental e controle de regressão.
