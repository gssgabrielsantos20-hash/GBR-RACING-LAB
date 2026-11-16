# GBR Racing Lab — Boosts nos eventos GP

## Entrega
As recomendações de boosts agora aparecem também no painel de estratégia Pré-GP. O ranking reutiliza o catálogo existente e recebe o foco de carro e piloto da pista/etapa atualmente selecionada. São mostradas até três opções, com atributos publicados e imagem se disponível.

## Comportamento
- Sem cadastro de quantidade, posse, inventário, consumo ou disponibilidade.
- Sem persistência de boosts.
- Sem alterações no Supabase, RLS, autenticação ou garagem.
- Se o catálogo não tiver opções nominais compatíveis, o painel informa a limitação e mantém as prioridades de efeito.
- A recomendação é indicativa; não garante vantagem nem afeta a qualificação.

## Arquivos
- `gbr-pre-gp-ui.js`: helper de recomendações e apresentação no painel GP.
- `gbr-pre-gp-engine.js`: remove texto antigo que falava em consumo de boosts e descreve o novo comportamento.
- `events-gp.css`: estilos compactos das recomendações.
- `index.html`: cache-busting dos scripts Pré-GP.
- `tests/gp-boost-recommendations-20261110.test.js`: teste de integração estrutural.
- `docs/adr/0019-recomendacao-boosts-em-eventos-gp-20261110.md`: decisão técnica.

## Testes executados
- `node --check` nos três scripts envolvidos: aprovados.
- `node tests/gp-boost-recommendations-20261110.test.js`: aprovado.
- `node tests/gp-context-stage-20261107.test.js`: 5/5 aprovados.
- Validação visual real em navegador/iPhone: não executada nesta sessão.

## Segurança e dados
A recomendação utiliza somente dados estáticos do catálogo e foco do circuito selecionado. Nenhuma quantidade ou dado pessoal é coletado. Nenhuma chamada ou gravação remota foi adicionada.

## Rollback
Reverter `gbr-pre-gp-ui.js`, `gbr-pre-gp-engine.js`, `events-gp.css` e `index.html` para as versões do ZIP de origem e remover o teste, ADR e relatório desta entrega. Não há migração ou rollback de banco.

## Publicação
Pacote preparado para prévia/aprovação. Nenhum push, deploy ou alteração remota foi realizado.
