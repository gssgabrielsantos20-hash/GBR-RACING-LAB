# GBR Racing Lab — Boosts recomendados por pista, sem inventário

**Data:** 10/11/2026  
**Escopo:** remoção do cadastro de quantidade e recomendação contextual por circuito.  
**Ambiente:** pacote local para prévia e aprovação. Não publicado.

## Diagnóstico
O fluxo anterior em `boosts-plus.js` criava inventário temporário em memória (`stock`), campo de quantidade por boost, filtros de loja/pneus e campo de paradas por piloto. `gbr-boost-catalog.js` exigia posse conhecida e quantidade suficiente para retornar recomendações. Nenhum desses dados era persistido, mas ainda exigiam trabalho manual.

## Implementação
- `gbr-boost-catalog.js`: `rank(ctx, options)` agora ordena boosts elegíveis por atributos conhecidos, sem quantidade/estoque/consumo. Itens com dados conflitantes permanecem excluídos.
- `boosts-plus.js`: removidos campos, filtros e cálculos de quantidade/paradas. O painel recomenda até três boosts nominais com base no foco de carro/piloto retornado pelo contexto da pista; mantém os efeitos genéricos, imagens e cópia voluntária do contexto para IA.
- `boosts-plus.css`: removidos estilos exclusivos de inventário.
- `index.html`: atualizados os identificadores de cache dos três recursos alterados.
- `_worker.js`: pacote estático embutido atualizado para refletir exatamente os bytes atuais de `index.html`, `gbr-boost-catalog.js`, `boosts-plus.js` e `boosts-plus.css`.
- `tests/boosts-catalog-20261105.test.js` e `tests/boosts-real-images-20261105.test.js`: reescritos para provar recomendação sem inventário, sem persistência e com fallback de imagem.
- `tests/boost-art-link-20261105.test.js` e `tests/boost-library-20261105.test.js`: expectativas de cache atualizadas somente para recursos efetivamente versionados.
- ADR 0018 criado.

## Regras da recomendação
A seleção nominal usa apenas os atributos publicados no catálogo parcial e o foco de carro/piloto da pista. O clima alimenta a prioridade de efeito genérica. Isso não prova que o boost seja ideal em todas as corridas. A interface informa que o catálogo é parcial, comunitário e não garante vantagem. Não há recomendação nominal se os atributos disponíveis não permitirem pontuação positiva.

## Segurança / dados
- Nenhuma nova entrada de usuário para quantidade ou disponibilidade.
- Nenhum dado de boost é gravado na garagem ou sincronizado.
- Nenhuma alteração em `cloud.js`, SQL, RLS, Auth ou banco remoto.
- URLs de imagem continuam passando pelo resolvedor `GBRCardArt`; não foi introduzido hotlink direto a imagens externas.
- HTML dinâmico usa `esc()` nos nomes/valores apresentados.

## Validação executada
- `node --check gbr-boost-catalog.js`: aprovado.
- `node --check boosts-plus.js`: aprovado.
- Testes direcionados de catálogo e imagens: aprovados.
- `tests/boost-art-link-20261105.test.js`: aprovado.
- `tests/boost-library-20261105.test.js`: aprovado.
- `tests/mega-worker-20261029.test.js`: aprovado — 199 recursos byte a byte, headers, rotas públicas/privadas, HEAD e POST.
- `tests/tema-worker-20261109.test.js`: aprovado.
- `tests/worker-events-smoke-20261104.test.js`: aprovado.
- Suíte completa: 24 testes executados, 23 aprovados e 1 falha preexistente. `tests/event-photos-20261029.test.js` falha porque a imagem primária de Nigel Mansell não corresponde à expectativa do teste; a mesma falha foi reproduzida na cópia-base anterior, sem as alterações desta etapa. Os demais testes passaram após atualizar as expectativas de cache necessárias.

## Não realizado
Sem deploy, push para GitHub, alteração no Supabase remoto ou teste visual real em Safari/iPhone.

## Rollback
Restaurar os seis arquivos de runtime (`gbr-boost-catalog.js`, `boosts-plus.js`, `boosts-plus.css`, `index.html`, `_worker.js`) e os testes/documentos alterados a partir do ZIP anterior. Não existe migração de banco nem dado persistido a reverter.
