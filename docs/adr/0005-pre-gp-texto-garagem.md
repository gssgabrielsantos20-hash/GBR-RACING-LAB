# ADR 0005 — GBR Pré-GP por texto do evento e garagem individual

**Status:** implementação candidata na branch `feature/gbr-pre-gp-texto-garagem-20261020`; **não publicada**, sem aprovação de merge/deploy.

## Objetivo

Para GPs cadastrados, usar o briefing textual do evento e a garagem pessoal para gerar setup e plano de corrida por pista e categoria, sem buscar vídeos, sites, IA remota ou dados de terceiros durante a análise. Não confundir plano condicional com garantia de vitória.

## Diagnóstico da base

- `events-gp.js` já cadastra o GP dos Estados Unidos e monta peças/pilotos da garagem, respeitando série e proibição de Legendary/Special.
- `app.js` já oferece 24 pistas, prioridades internas por pista/série e durabilidade manual de pneus em `garage.trackPlans`; `window.F1Tracks.plans` calcula stints com limites informados.
- `gbr-recommendation-engine.js` mantém evidência pessoal com salvaguardas de amostra e snapshot; o Pré-GP não requer histórico mínimo.
- `boosts-plus.js` apresenta categorias de efeito, **não inventário de Boosts**. Não é possível escolher com segurança nome/quantidade de reforço que o usuário possui.
- A produção Cloudflare é publicada por ZIP e pode divergir da `main` do GitHub; esta branch não altera produção.

## Decisão de arquitetura

1. `gbr-pre-gp-engine.js`: módulo determinístico, puro no núcleo, que reconhece apenas pistas do catálogo, categorias, voltas, chuva e prioridades explicitamente mencionadas. Campos ausentes permanecem `null`. Resolve conflitos de categoria/etapa/rodada sem adivinhar.
2. `events-gp.js`: reutiliza o otimizador de garagem existente; quando o relatório identifica um strong stat para aquela pista/categoria, usa esse foco na pontuação de peças e pilotos. Não altera login, dados ou RLS.
3. `gbr-pre-gp-ui.js`: leitura do texto apenas em memória por evento/conta, com descarte ao mudar a sessão, e explicação de pneus, boxes, potência, Overtake Mode, efeito de Boost e confiança.
4. `index.html` e `events-gp.css`: carregamento e apresentação; nenhuma biblioteca nova.
5. `tests/pre-gp-texto-garagem.test.js`: testes de parsing, categorias, clima, foco, propriedade das cartas, dois pilotos, limites e plano condicional.

O texto pode ser configurado em `event.briefingText` (registro versionado do GP) ou colado temporariamente na interface. O texto colado **não registra globalmente o GP**. Registro global por painel administrativo exigirá design de autorização, RLS, revisão humana e aprovação específica antes de nova migração.

## Formato aceito na versão 1

Uma corrida por linha; seções opcionais por categoria:

```text
GP dos Estados Unidos
Júnior:
Corrida 1: Austin | 6 voltas | chuva 0% | carro: curvas | piloto: largada
Corrida 2: Baku | 7 voltas | chuva 35% | carro: potência | piloto: pneus
Competidor:
Corrida 1: Austin | 6 voltas | chuva 100% | carro: velocidade | piloto: defesa
```

O parser não é uma IA generativa universal: texto livre sem pista identificável, conflitos e dados incompletos geram avisos. Aceita até 20 mil caracteres, 160 linhas e 64 corridas. O texto de briefing é dado não confiável; a interface escapa HTML, não executa instruções nem consulta rede.

## Regras de estratégia e limites

- Apenas peças `owned` e pilotos permitidos no evento/categoria; a seleção de duas identidades distintas permanece no módulo existente.
- Voltas e chuva vêm do briefing; se faltarem, não há stints numéricos.
- Durabilidade de pneus vem de `garage.trackPlans[series:trackId]`, previamente cadastrada pelo usuário; não é estimativa automática baseada em Tyre Management. As opções são condicionais, não previsão de desgaste real.
- Overtake Mode não é indicado na volta 1; a gestão posterior é qualitativa, sem setores/telemetria inventados. Ausência de bateria implica alerta.
- Boost: indica **efeito desejado**, não nome, estoque ou ganho percentual. Não atribui ganho de classificação a Boost.
- O histórico pessoal pode explicar o nível de evidência, mas não é pré-requisito para o plano.
- Sem acesso à telemetria por setor e ao inventário de Boosts, não se promete precisão ou vantagem competitiva mensurada.

## Segurança e privacidade

- Sem alteração de `cloud.js`, `config.js`, `_worker.js`, Supabase, políticas RLS, autenticação ou garagem.
- Não envia o texto do GP para serviços externos e não persiste texto colado em `localStorage`/Supabase.
- Ao trocar de sessão, descarta briefings locais para evitar compartilhamento entre contas no mesmo dispositivo.
- `garage_states` continua com RLS habilitado, conforme consulta somente leitura de 20/10/2026; nenhuma migração criada.
- Entrada limitada, nomes reconhecidos por catálogo e saída escapada; ambiguidades geram aviso.

## Fontes e limites de verificação

- ADRs [0003](0003-importacao-setup-por-print.md) e [0004](0004-diagnostico-tres-corridas.md) consultados diretamente: reutilização, revisão humana e separação entre pré-GP e diagnóstico.
- Pesquisa aprofundada recebida no projeto: regras de pneus, OM, Boost e diferenciação entre fontes verificadas e hipóteses. A transcrição integral do vídeo de origem não estava acessível.
- Os quatro anexos normativos informados pelo responsável (`01-protocolo-appsec.md`, `arquiteto-de-software.txt`, `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`, `persona-planejadora.txt`) não puderam ser reabertos nesta execução; a implementação permanece isolada em branch, sem mudança de autenticação ou produção. Conferir o conteúdo integral antes do merge.

## Validação

- Código do motor, interface e integração compilado em V8: **aprovado**.
- Cenários do teste `tests/pre-gp-texto-garagem.test.js` executados no V8 com shims equivalentes aos módulos Node utilizados: **aprovados**.
- `node tests/pre-gp-texto-garagem.test.js` em Node real: **não executado** (ambiente sem terminal).
- Testes anteriores da suíte, navegador real/Safari, sincronização de duas contas e Preview Cloudflare: **não executados**.
- Benchmark de desempenho e ganho em GPs reais: **não verificado**.

## Aprovação, publicação e rollback

Antes de publicar: reler quatro fontes normativas, executar suíte Node, testar UI em Safari/PC com duas contas, revisar diff, validar correspondência de `_worker.js` e assets com o pacote real do Cloudflare, e fazer deployment de Preview separado. Não publicar na homologação Freemium congelada. Rollback: reverter commits da branch/PR ou republicar deployment oficial anterior comprovadamente íntegro, sem apagar dados.

## Próxima evolução

Inventário de Boosts por usuário, durabilidade por piloto, catálogo de perfis de pista com proveniência e validação, importação global do texto GP por administrador autenticado e RLS, simulação de stints e telemetria própria por trecho. Cada etapa exige critérios de aceite e autorização próprios.
