# ADR 0019 — Recomendações de boosts nos eventos GP

- Data: 2026-11-10
- Status: implementado localmente para validação em prévia
- Escopo: exibir sugestões nominais de boosts no painel Pré-GP, conforme foco de carro e piloto do circuito/etapa selecionada.

## Decisão
Reutilizar `GBRBoostCatalog.rank()` e o catálogo visual já carregado. A recomendação recebe `result.carFocus` e `result.driverFocus`, derivados da pista selecionada no contexto GP. Exibir até três opções, atributos publicados e imagem disponível na biblioteca compartilhada/local/referenciada.

## Restrições
- Não consultar nem registrar quantidade, posse, consumo ou disponibilidade.
- Não persistir dados de boosts.
- Não alterar garagem, autenticação, Supabase, RLS ou APIs remotas.
- Boosts não alteram qualificação; a indicação é orientativa, não promessa de vantagem.
- Catálogo nominal parcial e baseado em referências comunitárias pendentes de validação integral no jogo.

## Escalabilidade e reversibilidade
Execução síncrona e local, catálogo pequeno e limitado a três resultados. Sem estado novo, consultas remotas, fila, cache por usuário ou custo por requisição. Mudança reversível: remover helper visual de `gbr-pre-gp-ui.js` e restaurar os textos anteriores do painel. Compatibilidade mantida com a ordem de scripts existente.

## Segurança
Somente dados estáticos do catálogo e contexto da etapa selecionada; valores escapados antes de compor HTML. URLs de imagem aceitas apenas das origens já fornecidas por `GBRCardArt` (shared/local/reference), escapadas no atributo e carregadas como imagens. Nenhuma entrada do usuário, dado de garagem ou segredo é enviado a serviço externo.

## Validação
- `node --check` em `gbr-pre-gp-ui.js`, `gbr-pre-gp-engine.js` e `gbr-boost-catalog.js`: aprovado.
- `tests/gp-boost-recommendations-20261110.test.js`: aprovado.
- `tests/gp-context-stage-20261107.test.js`: 5/5 aprovados.
- Prévia visual em navegador/iPhone: não executada nesta sessão.
