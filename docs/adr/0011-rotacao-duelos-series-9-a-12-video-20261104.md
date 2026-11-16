# ADR 0011 — Rotação de Duelos S9–S12 baseada em gravação de 04/11/2026

**Status:** implementada em prévia, não publicada. **Data:** 04/11/2026.

## Contexto

A base enviada para a atualização do Modo Pódio Global continha apenas S10, S11 e S12, com pistas divergentes da gravação F1 Clash enviada depois. A gravação mostra S9, que gira em ~7 dias, enquanto as demais exibem ~14 dias. A tabela anterior carecia de fonte para clima e não representava corretamente a prioridade vigente no jogo.

## Decisão

- Alterar somente `SERIES_ROTATIONS` em `gbr-intelligence.js` para 16 tuplas de pistas/voltas/focos comprovadas pela gravação; manter `PREVIOUS_SERIES_ROTATIONS` como histórico inalterado.
- Representar condição meteorológica como `null`: não trocar ausência de dado por valores `dry`/`mixed`; o Engenheiro de Duelos deve identificar o clima como desconhecido e não inventar stints.
- Manter `rotationAt`, `duelContext`, `priorityFor` e `listNewSeries` como contratos; filtrar dinamicamente S9 após 10/11 e S10–S12 após 17/11. O fim de cada janela é inferido do contador e revalidável. A ficha da Biblioteca de Pistas só recebe prioridades da rotação válida.
- Não misturar informações de Duelos e GP ou alterar Pódio Global, login, garagens, RLS, formatos de sincronização e contratos de API.

## Alternativas

- Usar janela de 14 dias também para S9: rejeitada, conflita com contador ~7 dias.
- Copiar clima da rotação arquivada ou de outra série: rejeitada, não comprovada.
- Salvar calendário novo no Supabase: rejeitado, adicionaria migração, autorização e risco sem necessidade para 16 itens estáticos.

## Escalabilidade, segurança e reversibilidade

**OK com atenção às datas:** 16 entradas estáticas, sem chamadas adicionais, sem novos segredos ou dados pessoais e sem novas queries. Porta de mão dupla, reversível pela restauração do ZIP de prévia anterior. Riscos: término inferido pode mudar, validação real de dispositivos/Supabase não realizada. Gatilho: novo vídeo/screenshot do jogo ou próxima rotação, sobretudo S9 em 11/11, S10–S12 em 18/11.

## Provas e próximos testes

`tests/duelos-rotacao-0411-1711.test.js` comprova as 16 tuplas, prévia/histórico, expiração independente, ausência de clima e integração de referência. A distribuição Worker deve servir bytes idênticos aos hashes do manifesto. Safari e homologação com duas contas permanecem pendentes. Não modificar RLS para contornar falhas.

## Correção de apresentação da Série 9 — 04/11/2026 (prévia UI-2)

Uma captura do aplicativo no iPhone exibia o aviso antigo “rotações verificadas das Séries 10, 11 e 12” ao selecionar Série 9. O ZIP de prévia anterior já continha a configuração S9, mas sua interface remota não refletia o pacote: a causa exata entre publicação anterior e cache do navegador **não pôde ser isolada sem homologação no ambiente real**.

Para tornar a exibição verificável e diminuir o erro de escolha de pista, a interface agora identifica explicitamente as quatro séries e destaca a série selecionada, e o seletor do Assistente oferece as pistas da rotação vigente antes das demais pistas históricas, sem removê-las. Ao trocar de série, a pista anterior é desmarcada. Após a expiração de S9, ela não é rotulada como rotação vigente. Mudança somente de apresentação; modelo, autenticação, Duelos, Pódio Global e armazenamento permanecem inalterados.

Arquivos: `gbr-intelligence.js` (`mount`, `rotationHTML`, `refresh`, `syncDuelTrackOptions`), `gbr-intelligence.css`, `index.html` (versão dos assets). Evidência: `tests/duelos-s9-ui-20261104.test.js` e regressões existentes. Porta de mão dupla; rollback por restauração do ZIP S9–S12 de prévia anterior. O envio do ZIP **não atualiza automaticamente** o site em Cloudflare nem os caches já instalados no iPhone.
