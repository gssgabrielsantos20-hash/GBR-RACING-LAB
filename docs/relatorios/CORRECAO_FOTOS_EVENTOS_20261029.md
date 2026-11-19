# GBR Racing Lab — correção de fotos dos Eventos GP (29/10/2026)

## Diagnóstico confirmado

No ZIP `GBR_RACING_LAB_MEGA_AUDITORIA_NOVEMBRO_2026_IMPLANTAVEL.zip`, `events-gp.js` na função `featuredHtml` construía caminhos para `assets/events/featured/<evento>-<carta>.webp` sem que os arquivos existissem para São Paulo, Loucura dos Bigodes e México. O componente `GBRCardArt.thumb` tentava primeiro a arte local do evento e depois uma URL externa; quando ambas falhavam, exibiam-se ícones genéricos. A captura do usuário exibiu Rubens Barrichello, Nigel Mansell e Eco Cell+ sem fotos.

## Alteração cirúrgica

- `assets/events/featured/`: **14 arquivos WebP novos** retirados de recortes dos três banners oficiais fornecidos pelo usuário. Foram mantidos outros cinco assets já presentes do GP dos EUA (total = 19 artes locais de destaque), sem atribuir novas imagens a cartas incorretas.
- `events-gp.js`, função `featuredHtml`: apenas eventos com artes locais incluídas fornecem `eventArt` ao componente. Mantém a precedência da imagem cadastrada pelo usuário sobre a arte ilustrativa do evento. Não altera regras de GP ou dados da garagem.
- `legendary-drivers.js`, entrada Rubens Barrichello: usa **recorte do banner oficial fornecido** como referência visual local de fallback. Não é uma imagem oficial individual da carta. `imageStatus = user_provided_event_art` sinaliza essa distinção.
- `card-art.js`, `getSource`: permite referência relativa **somente** no diretório público restrito `assets/events/featured/` para a arte local da entrada lendária, sem permitir URL arbitrária. Fotos do usuário/academia continuam tendo prioridade.
- `index.html`: bust de cache nos scripts alterados para evitar conteúdo antigo no Safari/PWA.
- `_worker.js`: reempacotado sem ampliar a lista de tipos permitidos; apenas os 14 WebP adicionados e quatro scripts/HTML atualizados. Total **191** recursos públicos.
- `AUDITORIA_MANIFEST_PUBLICOS_SHA256.json`: recalculado com SHA-256 de cada recurso público.
- `tests/mega-auditoria-20261029.test.js`, `tests/mega-worker-20261029.test.js`: expectativas atualizadas e verificações mantidas.
- `tests/event-photos-20261029.test.js`: teste novo de presença e formato das 19 fotos (14 novas + 5 existentes), nomes esperados na ficha GP, prioridade de foto do usuário e fallback Barrichello.

## Evidências e testes locais (executados)

- `node tests/event-photos-20261029.test.js`: PASS — 19 miniaturas, formato WebP e prioridade da foto cadastrada pelo usuário.
- `node tests/mega-worker-20261029.test.js`: PASS — 191 recursos HTTP 200 comparados byte a byte, bloqueio HTTP 404 de docs/testes/SQL/manifestos, HEAD e POST.
- `node tests/mega-auditoria-20261029.test.js`: PASS — 53 peças, 111 pilotos, 0 duplicatas exatas, 6 eventos, 24 circuitos, imagem resolvida para Barrichello.
- `node tests/colecoes-s12.test.js`: PASS — três coleções, 16 Paddock, 6 verdes, 23 lendários, preservação de garagem e tratamento de níveis S12 não confirmados.
- `node --check _worker.js`: PASS — sintaxe.
- WebP inspecionados visualmente em contato de prova (não incluso no ZIP de deploy).

### Pendências

- **Não validado**: Safari real na sessão autenticada e dados individuais do Supabase. Publicar primeiro em ambiente de teste, verificar as cinco fotos do evento São Paulo e as quatro da Loucura dos Bigodes, a prioridade das fotos próprias e a navegação.
- A foto de Barrichello é um **recorte do banner de evento**, não a arte integral da carta do jogo; mantenha a Biblioteca Visual para substituição pela arte específica, se desejar.
- Níveis 2–8 das sete peças S12 continuam sem atributos oficialmente confirmados. Não foram alterados.

## Fontes técnicas consultadas

1. `engenheiro-de-segurança.txt`: fase de auditoria, evidência, mudança mínima, privilégio mínimo, rollback.
2. `arquiteto-de-software.txt`: portão de escalabilidade, reversibilidade, segurança de cache e do Worker.
3. `persona-planejadora.txt`: execução por escopo, testes de regressão e critérios de parada.
4. `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`: localizar causa raiz antes de alterar, validar e documentar.
5. GitHub `docs/adr/0001-lendarios-2026.md` e `docs/adr/0002-worker-ativos-publicos.md` (consultados na conversa anterior): aliases sem duplicar e recursos públicos restritos.
6. Banners Hutch fornecidos pelo usuário: `F1-34237_imgL_SaoPauloSpectacular_Discord_2_1920x1080.png`, `F1-42967_imgL_MoustacheMadness_Discord_2_1920x1080.png`; banner de México incluído na base anterior `assets/events/mexico-gp-2026.png`.

## Reversão

Reimplantar o ZIP anterior `GBR_RACING_LAB_MEGA_AUDITORIA_NOVEMBRO_2026_IMPLANTAVEL.zip` no Cloudflare Pages. Nenhum SQL, API, credencial, autenticação, RLS ou dado da garagem foi modificado.
