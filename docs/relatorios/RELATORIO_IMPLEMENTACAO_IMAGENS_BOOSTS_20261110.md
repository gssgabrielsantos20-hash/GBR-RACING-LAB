# GBR Racing Lab — exibição das imagens dos Boosts

**Data:** 10/11/2026  
**Escopo:** exibição visual de boosts no Assistente de Pistas e Biblioteca Visual. Não houve publicação.

## Diagnóstico

O catálogo visual já continha 65 boosts e 50 URLs AllClash confirmadas em verificação anterior, mas `GBRCardArt.getSource()` retornava `origin: none` para `boosts`. O componente `boostArt()` aceitava somente origens `shared` e `local`, e a Biblioteca Visual tratava as URLs externas apenas como metadados.

## Alterações

- `card-art.js`: prioridade de foto compartilhada, foto local e, depois, URL externa validada do catálogo visual; URLs não catalogadas não são construídas por inferência.
- `boosts-plus.js`: cartões de inventário e sugestões passam a aceitar `origin: reference`; texto atualizado para explicar a origem externa e o fallback.
- `auditoria-imagens.js`: Biblioteca Visual passa a renderizar as imagens externas disponíveis e contabilizá-las como referências visuais.
- `auditoria-imagens.html`: explicação e cache-busting atualizados.
- `index.html`: cache-busting dos módulos de boosts e resolvedor.
- `_worker.js`: pacote estático recomposto com 199 rotas públicas, mantendo o conjunto de rotas.
- `docs/adr/0015-referencias-visuais-boosts-externas-20261109.md`: adendo documenta a decisão do usuário para exibição remota, sem cópia ou upload.
- Testes de boosts atualizados para o novo comportamento.

## Comportamento esperado

1. Foto compartilhada Supabase prevalece.
2. Foto local do dispositivo prevalece sobre a referência externa.
3. URL AllClash catalogada e confirmada é carregada diretamente no navegador.
4. Se a origem falhar ou não houver URL confirmada, o cartão mostra fallback neutro.
5. URLs externas continuam bloqueadas para gravação como foto local/compartilhada; nenhuma alteração de RLS, Storage ou Supabase foi feita.

## Preservações

- Catálogo visual: 65 nomes.
- Motor de recomendação: 11 boosts, sem mudança de atributos, pesos ou ranking.
- Garagem, autenticação, permissões, RLS, APIs e dados: sem alteração intencional.
- Nenhum push GitHub, deploy Cloudflare ou alteração Supabase foi executado.

## Validação

- 7 arquivos de teste específicos de boosts: 14 subtestes aprovados (ver execução final registrada na conversa; os arquivos individuais são `boost-art-link-20261105.test.js`, `boost-image-references-20261109.test.js`, `boost-library-20261105.test.js`, `boost-library-preview-20261105.test.js`, `boosts-admin-permissions-parity-20261105.test.js`, `boosts-catalog-20261105.test.js`, `boosts-real-images-20261105.test.js`).
- Suíte total: 34/35 arquivos de teste aprovados; 1 falha em `tests/event-photos-20261029.test.js` (assertiva de imagem primária de evento, fora do escopo de boosts). A causa dessa divergência não foi corrigida para evitar alteração em funcionalidade alheia.
- Teste do Worker de 199 recursos passou byte a byte.
- Navegadores físicos (Safari/iPhone) e disponibilidade externa no momento da publicação: não verificados.

## Riscos / pendências

- Imagens remotas dependem da disponibilidade, hotlink policy e resposta HTTP do AllClash; o fallback visual permanece para erro de carregamento.
- 15 dos 65 boosts não possuem URL de imagem confirmada no catálogo e continuarão sem imagem até uma fonte válida ser encontrada.
- A decisão do usuário foi registrada como preferência do projeto; ela não representa licença emitida pelo titular das imagens.

## Rollback

Restaurar os arquivos `card-art.js`, `boosts-plus.js`, `auditoria-imagens.js`, `auditoria-imagens.html`, `index.html`, `_worker.js`, os testes de boosts e o adendo ADR a partir do ZIP-base anterior.
