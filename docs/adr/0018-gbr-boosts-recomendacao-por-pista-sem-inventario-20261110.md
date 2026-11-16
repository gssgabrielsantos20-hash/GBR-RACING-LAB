# ADR 0018 — Recomendações de boosts por pista sem inventário

- **Status:** aprovado para prévia local pelo responsável do projeto
- **Data:** 10/11/2026
- **Escopo:** interface e lógica local de recomendação de boosts

## Contexto
O fluxo anterior exigia informar quantidades, considerar disponibilidade, preencher paradas previstas e então filtrar os boosts recomendados. O responsável do projeto esclareceu que boosts acabam rapidamente, que cadastrar quantidades é trabalhoso e que essa informação não é relevante para a recomendação desejada.

## Decisão
- Recomendar boosts pelo foco de carro e piloto resolvido para o circuito selecionado, com condição meteorológica como contexto adicional para as prioridades de efeito.
- Não solicitar, ler, gravar ou sincronizar quantidade, estoque, disponibilidade pessoal ou número de paradas para selecionar boosts.
- Apresentar até três nomes do catálogo parcial que melhor correspondam aos atributos publicados e não conflitantes.
- Manter as prioridades genéricas de efeitos e os avisos de incerteza; não prometer vantagem nem tratar referência comunitária como dado oficial.
- Reutilizar o resolvedor visual existente e manter fallback textual quando não houver imagem.
- Não alterar Supabase, RLS, autenticação, garagem ou contrato de sincronização.

## Alternativas consideradas
1. Manter o inventário opcional — rejeitado porque ainda cria trabalho e interface desnecessários.
2. Remover o catálogo nominal e mostrar apenas categorias de efeito — rejeitado porque há atributos publicados para um subconjunto dos boosts e o catálogo pode oferecer sugestões condicionais.
3. Recomendação por pista, sem inventário — escolhida por atender diretamente ao requisito e reaproveitar `trackInfo()` e o catálogo atual.

## Segurança e escalabilidade
A entrada utilizada vem do contexto já resolvido pelo aplicativo. A lista é local, limitada a 11 itens, sem endpoint, persistência, credenciais ou dados pessoais. O ranking é síncrono, determinístico e idempotente. A decisão é reversível: os arquivos alterados podem ser restaurados do ZIP anterior. O worker estático é atualizado para servir os mesmos bytes dos quatro recursos públicos alterados.

## Limitações
- O catálogo nominal é parcial e tem referências comunitárias; não representa todos os boosts do jogo.
- A compatibilidade é uma heurística do GBR baseada em atributos disponíveis e foco da pista, não um resultado validado causalmente por corridas.
- A recomendação de efeito genérico não deve ser confundida com indicação oficial de um item.

## Rollback
Restaurar `gbr-boost-catalog.js`, `boosts-plus.js`, `boosts-plus.css`, `index.html` e `_worker.js` da versão anterior. Nenhuma migração de banco ou reversão de dados é necessária.

## Evidências de validação
Ver `RELATORIO_GBR_BOOSTS_POR_PISTA_SEM_INVENTARIO_20261110.md` e os testes `tests/boosts-catalog-20261105.test.js`, `tests/boosts-real-images-20261105.test.js`, `tests/boost-art-link-20261105.test.js` e `tests/mega-worker-20261029.test.js`.
