# GBR RACING LAB — pacote implantável Update 63 + coleções especiais
Data: 2026-10-26
Estado: CANDIDATO DE IMPLANTAÇÃO MANUAL; PRODUÇÃO NÃO MODIFICADA.

## Base
`GBR_RACING_LAB_GP_MEXICO_2026_SOMENTE_GP_IMPLANTAVEL.zip`, fornecido na conversa, contém o GP do México e assets públicos. Não substituímos por `main` do GitHub, que possuía conteúdo diferente.

## Conteúdo alterado
- `special-editions.js`: adiciona 8 pilotos x 2 variantes Paddock Picks (Standard/Turbo) ao catálogo estático, sem posse, nível, série ou atributos atribuídos, usando a edição como identidade.
- `app.js` (`init`, `emptyGarage`, `migrateGaragem`, seleção de referência): mantém edições distintas, respeita exclusões e cartas pessoais, sem migração SQL ou alteração de chave de usuário. Num catálogo misto, o rótulo da edição integra a identidade.
- `garage-plus.js` (`extractEdition`, OCR de raridade): reconhece texto Signature Collection em screenshots para cadastro assistido, com revisão humana.
- `app.js` / `garage-plus.css`: etiqueta visual verde para as cartas Signature cadastradas pelo jogador; não é a foto real da carta.
- `card-art.js` (`getSource`): não fabrica URL de imagens Signature; imagens publicadas pelo administrador e overrides locais continuam prioritárias.
- `index.html`: carrega o catálogo especial após `catalog.js` e antes de `app.js`; links e cache-busting dos JS; link oficial à nota de Lusail.
- `notices.js`: comunicado de F1 Clash 63 com dados oficiais e limite de identificação das Signature.
- `_worker.js`: reempacotado com os assets públicos; relatórios/manifestos/testes não são públicos.

## Evidência primária
- Hutch, 'Paddock Picks: Ones to Watch in F1 Clash', 2026-08-07, https://www.hutch.io/blog/games/paddock-picks/ (oito pilotos; duas versões Standard/Turbo Charged).
- Hutch, 'Patch Notes: Update 63', 2026-10-26, https://www.hutch.io/our-games/f1-clash/patch-notes/patch-notes-update-63-objectives-updates-more/ (Lusail liberado após release; Loyalty Club futuro; melhorias em Objectives e Objectives Store).
- Arquivo `Android.zip` fornecido: `Android/collectiontheme_signaturecollection_assets_all_cd8fd0356dc8ae1b367bd709bfffebd6.bundle` e `Android/collectiontheme_paddockpicks_assets_all_3b1eaef17db84531c68199c80698ecf0.bundle`, cabeçalho `UnityFS` verificado; coleções distintas.
- Sete arquivos `uniquecardvisuals_paddockpicks_turbo_<name>_...bundle` verificados. A ausência de um bundle nomeado não significa ausência de carta; a fonte oficial confirma oito variantes Turbo.

## Restrições e diferenças em relação a relatórios anteriores
O Android.zip tem 455 arquivos `.bundle`, não comprovou PNGs em `assets/cards/signature/*.png` nem `data/cards-en.json` e `data/cards-pt.json` citados no relatório de Pesquisa Aprofundada. Esses caminhos e `signature_*` eram exemplos, NÃO IDs internos comprovados. Não adicionamos 8 pilotos à Signature Collection: o conjunto citado para ela coincide com a lista oficial Paddock Picks e não constitui prova de pertencimento às duas coleções.
Sem extrator Unity e licença para redistribuir arte proprietária: nenhuma imagem do jogo extraída ou usada. Imagens Signature somente via biblioteca visual existente e revisão do administrador.

## Fontes orientadoras
- `engenheiro-de-segurança.txt`: não afrouxar RLS, negacão por padrão, evitar exposição de dados e segredos, testes e rollback.
- `arquiteto-de-software.txt`: mudança pequena, reversível, sem superengenharia, preservar contratos e medir/testar.
- `persona-planejadora.txt`: não inventar regras de negócio; documentos adicionais de 'Manual de Projeto/Manual de Testes/Persona de Testes' não localizados nesta entrega, portanto homologação integral pendente.
- `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`: analisar fluxo/arquivos e dependências antes de alterar, validar por testes e indicar rollback.
- `docs/adr/0001-lendarios-2026.md` e `docs/adr/0002-worker-ativos-publicos.md`: módulos independentes, identidade não ambígua e Worker lista pública fechada; consultados no repositório acessível do projeto.

## Homologação e rollback
1. Fazer backup do deployment atual em Cloudflare Pages.
2. Publicar primeiro numa prévia/staging, testar login em duas contas, garagem antiga, cartas adicionadas e removidas, manual OCR Signature, Paddock Turbo, GP México, links e imagens; conferir Safari/iPhone.
3. Somente após homologação manual, publicar o ZIP completo em Cloudflare Pages. O Worker atende os arquivos públicos; não publicar SQL/relatórios.
4. Se necessário reverter pelo histórico de deploy do Cloudflare Pages para o deployment anterior, ou reimplantar `GBR_RACING_LAB_GP_MEXICO_2026_SOMENTE_GP_IMPLANTAVEL.zip`. Nenhuma operação Supabase ou migração precisa de rollback.

## Resultados de validação local (26/10/2026)
- ZIP: CRC (`zipfile.testzip`) íntegro; manifesto SHA-256 gerado.
- Node.js: `node --check` em todos os JS públicos, sem erros.
- VM: 16 Paddock Picks, 22 lendários preservados, idempotência, exclusões por edição, atributos e posse existentes preservados.
- Worker: paridade byte a byte dos 173 recursos públicos; GET/HEAD; 404 de arquivos privados, 405 de métodos indevidos.
- Chromium/Playwright: inicialização do navegador bloqueada por política do ambiente (`ERR_BLOCKED_BY_ADMINISTRATOR`); não é falha comprovada do aplicativo.
- Arquivos de jogos Android nunca foram executados.

## Não verificado
- Atributos oficiais das novas edições, vinculação de pilotos à Signature Collection, propriedade/URL de fotos, autorização de redistribuição de artes, tempos reais de Lusail.
- E2E com autenticação/Supabase, iPhone/Safari físico, comparação bit a bit com deployment publicado atual.
