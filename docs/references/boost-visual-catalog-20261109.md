# Catálogo visual de boosts — 09/11/2026

## Escopo

Atualização visual da Biblioteca Visual e da consulta de boosts no Assistente de Pistas. A aba `Boosts` da planilha `F1 Clash 2026 Resource Sheet v1.1 by TR The Flash (1).xlsx` foi tratada como fonte dos nomes; ela contém 65 nomes distintos e não contém imagens incorporadas.

## Resultado da auditoria de imagens

- 65 boosts listados no catálogo visual.
- 50 URLs com resposta HTTP 200 no teste da origem AllClash (49 identificadas pelo extrator; `Tire Water` respondeu 200 com MIME `image/png`, mas sem confirmação visual).
- 49 dessas URLs foram reconhecidas pelo extrator de imagem; `Tire Water` respondeu 200 com MIME `image/png`, mas o extrator não identificou o conteúdo visual. A validação no Safari continua pendente.
- 15 itens sem imagem acessível: Champion, Confetti, Crown, Djinn, Eggcepton, Feral, Ghoulfuel, Heartbreaker, Launch Pad, Livewire, Merlion, Palm, Reindeer, Schooner, Tune-In.
- `Nuke Boost` aparece em referências externas, mas não consta na planilha; por isso não foi adicionado ao catálogo.
- Os 13 caminhos antigos que retornaram HTTP 404 não são carregados no site. Permanecem no manifesto apenas como candidatos rejeitados.

## Arquitetura aplicada

1. `GBRBoostCatalog.items` continua com os 11 boosts do motor de recomendação. Nenhum atributo, ranking ou cálculo foi alterado.
2. `GBRBoostCatalog.visualItems` contém os 65 nomes da planilha, independentemente de GP/série.
3. Resolução de imagem em `card-art.js`: foto compartilhada do Supabase → foto local do aparelho → fallback neutro. Referências AllClash não entram no resolvedor.
4. As URLs de referência ficam apenas como metadados de auditoria; não são exibidas em `<img>`, não são copiadas para o bucket e não são gravadas em `gbr_card_images`.
5. Upload de arquivo e URL autorizada continua no mesmo fluxo administrativo de pilotos e peças. A autorização final continua no Supabase/RLS.
6. URLs AllClash permanecem bloqueadas para `saveLocal`, `saveRemote` e migração em lote; as referências são apenas uma fonte visual de leitura.
7. A Biblioteca Visual agora mostra todos os 65 boosts, oferece busca/filtros e distingue fotos compartilhadas, referências localizadas pendentes e itens sem fonte conhecida.
8. O teste de imagens usa concorrência limitada (6 por vez) e timeout de 5 segundos para evitar a espera serial excessiva.
9. O fallback “Sem foto” é exibido se uma URL externa falhar no navegador.

## Arquivos alterados

- `gbr-boost-catalog.js`
- `card-art.js`
- `boosts-plus.js`
- `boosts-plus.css`
- `auditoria-imagens.js`
- `auditoria-imagens.html`
- `index.html`
- `docs/references/boost-imagens-externas-pendentes-20261105.json`
- testes específicos de boost.

## Segurança e originalidade

- A migração anterior já habilitou `boosts` no CHECK e na política de upload administrativa. Consulta read-only em 09/11/2026 confirmou 97 registros: 68 pilotos, 28 peças e 1 boost (`Ballast`); o objeto `boosts/ballast-cd9b941b-8251-41c6-8bf1-ea8ca3096928.webp` existe no bucket como `image/webp` (5.648 bytes).
- Nenhum dado de garagem, login, autenticação, permissão, tabela de pilotos/peças ou política RLS foi alterado nesta atualização.
- Fotos compartilhadas continuam sob RLS e perfil administrador.
- A permissão de reutilização das imagens externas não foi verificada documentalmente. O ADR 0015 proíbe hotlink, download ou re-hospedagem sem licença. O pacote mantém apenas metadados de referência, sem exibir essas imagens.
- A aprovação do usuário autoriza a alteração do GBR, mas não substitui uma licença do titular. Para exibir ou publicar arte externa, ainda é necessário autorização escrita do titular; como alternativa, usar capturas próprias do inventário do jogo dentro das regras de fan content.

## Validação

- Testes específicos do catálogo visual, resolvedor de imagem, Biblioteca Visual e Assistente de Pistas: aprovados.
- Testes gerais e Worker: executar após reconstrução do payload.
- Carregamento real em Safari/iPhone: não verificado neste ambiente; usar `Verificar fotos` na Biblioteca Visual após homologar.
- Cloudflare e GitHub: não publicados/alterados.

## Rollback

Reverter os arquivos acima e o payload de `_worker.js` para a versão anterior do pacote `GBR_LAB6_BOOST_REFERENCES_COMPLETO_09NOV2026.zip`. Como não houve alteração no banco nem gravação de imagens, não é necessário rollback de dados Supabase.
