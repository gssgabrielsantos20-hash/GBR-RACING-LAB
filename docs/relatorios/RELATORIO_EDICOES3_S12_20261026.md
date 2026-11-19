# GBR Racing Lab — correção das 3 coleções especiais e segurança dos níveis S12

**Data:** 26/10/2026. **Estado:** ZIP COMPLETO PARA TESTE / HOMOLOGAÇÃO. Nenhuma publicação automática.

## Base de atualização
- Base exata: `GBR_RACING_LAB_UPDATE63_PADDOCK_SIGNATURE_GP_MEXICO_IMPLANTAVEL.zip`, SHA-256 `9b1b94db68e15b38f8b1efd99ac45358286e76f348b11b949b51831f433f5115`.
- Mantém GP do México e todas as funções da base. Site estático HTML/JavaScript com `_worker.js` embutido, Supabase Auth/RLS e garagem individual.
- Scripts e assets existentes mantidos salvo alterações específicas no escopo. Não houve alteração em `config.js`, `cloud.js`, `events-gp.js`, migrations, policies ou dados pessoais.

## Modificações por arquivo
1. `special-editions.js` — catálogo comum de três grupos com classificação e aliases históricos. **Paddock** e **Turbo** permanecem 8 pilotos cada. **Edições Especiais (fundo verde)** cadastra seis pilotos efetivamente identificados no print fornecido (`IMG_9794(3).jpeg`), todos sem posse, nível ou atributos imputados.
2. `index.html` — seletor **Coleção especial** com três opções e aviso das peças S12. Correção dos parâmetros de cache dos JS/CSS alterados.
3. `app.js` (`renderGarage`) — filtro por coleção separado de raridade; etiquetas visuais distintas; preservação de nível/posse/estatísticas. O filtro por coleção seleciona raridade Especial automaticamente. Reset contextual do filtro ao abrir Peças.
4. `garage-plus.js` (`extractEdition`, `showEditor`, `sameCard`) — OCR separa Paddock, Turbo e Edições Especiais; edição manual com seletor de coleção, comparações que reconhecem `Signature Collection` como alias do grupo verde e validação contra duplicatas. Ao mudar o nível de uma peça nova S12 para nível sem valores verificados, os cinco atributos **não são herdados** do nível anterior.
5. `card-art.js` (`getSource`) — coleção verde nunca tenta adivinhar URL de imagem; mantém prioridade de fotos oficiais publicadas pela Biblioteca Visual e fotos locais autorizadas.
6. `garage-plus.css` — chips distintos (Paddock, Turbo, verde) e indicadores dos limites de dados S12.
7. `auditoria-imagens.html` e `auditoria-imagens.js` — Biblioteca Visual carrega as três coleções do catálogo, distingue a edição na identidade da imagem e permite que o administrador associe uma imagem autorizada à carta verde correta. Remove cinco entradas Paddock redundantes que antes eram codificadas manualmente, mantendo a referência legada `D. Hill`.
8. `notices.js` — corrige o aviso do jogo para citar os seis pilotos verdes efetivamente encontrados e a limitação das sete peças S12.
9. `_worker.js` — reconstruído com exatamente os recursos públicos selecionados; docs, testes e manifestos não acessíveis por URL.
10. `tests/colecoes-s12.test.js` — testes automatizados de catálogo, OCR, migração, exclusão, duplicidade e integridade do nível 1.

## Peças S12: limite de dados REAIS
`Adrenaline`, `Eco Cell+`, `Thunderbolt`, `The Singularity`, `Flex XXL`, `The Reverse` e `Control` têm **atributos verificáveis do nível 1** nas referências do pacote original (screenshots mencionados por nome em `catalog.js`). **Níveis 2–8 não foram confirmados** por capturas oficiais e continuam sem autofill. A mudança corrige o comportamento perigoso do editor, que podia carregar valores de um nível anterior quando o novo nível não existia no catálogo. O utilizador deve informar os cinco atributos do nível superior após conferir a tela correspondente do jogo.

**Fonte comunitária adicional consultada:** https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/ (21/10/2026). Essa página oferece estatísticas calculadas por nível, mas seus números decimais interpolados e parte dos valores de nível 1 não coincidem com os prints da base. NÃO foram importados como valores reais do jogo.

## Edições verdes
- O arquivo anexado `Android.zip` contém um tema `collectiontheme_signaturecollection_...bundle`. Separadamente, o screenshot do jogo `IMG_9794(3).jpeg` mostra seis cartas verdes assinadas, rotuladas SPECIAL EDITION, dos pilotos **Verstappen, Leclerc, Lawson, Hadjar, Piastri e Sainz**. Esse é um registro de tela, não uma tabela de níveis nem confirmação de disponibilidade em todas as contas/versões.
- O utilizador determinou três grupos de interface: Paddock, Paddock Turbo e Edições Especiais fundo verde. O software aceita `Signature Collection` como título legado pertencente ao grupo verde sem modificar os dados já salvos.
- Não foram inventadas imagens de cartas nem IDs internos de jogadores. As seis cartas verdes são pré-cadastradas como não possuídas, sem níveis/atributos; basta marcar posse e preencher valores reais, via cadastro manual/print.
- Fonte Hutch: https://hutch.helpshift.com/hc/pt-br/10-f1-clash/faq/1795-what-are-special-edition-drivers/ (cartas especiais podem participar de múltiplas coleções, por isso a coleção integra a identidade).
- Fonte Hutch: https://www.hutch.io/blog/games/paddock-picks/ (oito Paddock Picks em duas variantes).

## Fontes obrigatórias consultadas diretamente
- **Fonte 1 — `engenheiro-de-segurança.txt`:** defesa em profundidade, não alterar autorização/RLS, segredos fora do frontend, negar por padrão, teste e rollback.
- **Fonte 2 — `arquiteto-de-software.txt`:** idempotência, reversão simples, mudanças incrementais, sem infraestrutura nova; crescimento linear com o número de cartas.
- **Fonte 3 — `persona-planejadora.txt`:** preservar regras de negócio e respeitar critérios de aceite; depende também de manuais externos não localizados — homologação final continua pendente.
- **Fonte 4 — `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`:** localizar responsabilidade, causa-raiz, dependências, revisar segurança e regressões antes de alteração.
- ADRs existentes via GitHub: `docs/adr/0001-lendarios-2026.md` e `docs/adr/0002-worker-ativos-publicos.md` — não duplicar cadastros nem expor arquivos auxiliares via Worker.

## Homologação
1. Implantar este ZIP completo em **ambiente de prévia** no Cloudflare Pages.
2. Testar logins de duas contas e conferir cada garagem sem conceder posse automaticamente.
3. Em **Minha garagem → Pilotos → Coleção especial**, verificar Paddock (8), Turbo (8) e Edições Especiais (fundo verde; 6 cartas), marcar uma carta verde de teste como possuída e preencher os valores reais; a foto, quando autorizada, entra pela Biblioteca Visual.
4. Conferir preservação de uma antiga carta com rótulo `Signature Collection` e estatísticas personalizadas.
5. Em **Peças**, verificar as sete peças novas; mudar nível 1 → 2 no editor: os valores anteriores **não devem permanecer**. Informar dados reais de nível 2 e salvar; testar que esse cadastro pessoal permanece após recarga.
6. Verificar GP México, visual iPhone/Safari, filtros e importação de prints. Não homologar correção completa dos níveis S12 até existirem dados do jogo para todos os níveis.

## Reversão
- Reimplantar o ZIP-base exato identificado acima (ou usar o rollback do Cloudflare Pages). Nenhuma alteração de banco ou migração precisa ser revertida.
- Fazer backup/exportação da garagem antes dos testes manuais. Não apagar os dados de teste/produção.

## Limitações
- Não executado teste end-to-end com conta Supabase autenticada nem Safari real.
- Atributos de níveis S12 2–8 permanecem pendentes; os testes não provam valores inexistentes.
- Identidade dos seis pilotos verdes está comprovada por screenshot fornecido, mas os IDs internos/atributos/níveis exatos não são comprovados e exigem mais prints ou fontes oficiais.
