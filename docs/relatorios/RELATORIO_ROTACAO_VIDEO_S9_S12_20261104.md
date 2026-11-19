# GBR Racing Lab — rotação conferida no vídeo (04/11/2026)

**Status:** correção implementada **somente no ZIP de prévia**, integrado ao Modo Pódio Global. Nenhum deploy, push no GitHub ou alteração de banco executada.

## Diagnóstico e fonte primária

O vídeo enviado `ScreenRecording_11-04-2026 08-16-22_1.mp4` mostra **quatro séries** (S9, S10, S11, S12) e respectivas listas de quatro pistas, voltas e dois atributos prioritários. A prévia anterior mantinha entradas S10–S12 divergentes do jogo, e não possuía calendário de S9 no módulo `gbr-intelligence.js`.

| Série | Pista | Voltas | Piloto | Carro |
|---|---|---:|---|---|
| 9 | Barcelona | 7 | Gerenciamento de pneus | Velocidade |
| 9 | Monza | 4 | Defesa | Velocidade |
| 9 | Jeddah | 6 | Defesa | Velocidade |
| 9 | Silverstone | 7 | Gerenciamento de pneus | Velocidade |
| 10 | Baku | 7 | Gerenciamento de pneus | Unidade de potência |
| 10 | Cidade do México | 9 | Gerenciamento de pneus | Unidade de potência |
| 10 | Barcelona | 10 | Gerenciamento de pneus | Velocidade |
| 10 | Silverstone | 7 | Gerenciamento de pneus | Velocidade |
| 11 | Miami | 6 | Ultrapassagem | Velocidade |
| 11 | Las Vegas | 6 | Ultrapassagem | Velocidade |
| 11 | Spa-Francorchamps | 6 | Ultrapassagem | Unidade de potência |
| 11 | Hungaroring | 8 | Ultrapassagem | Curvas |
| 12 | Montreal | 8 | Largada | Unidade de potência |
| 12 | Melbourne | 9 | Largada | Curvas |
| 12 | Spielberg | 7 | Largada | Curvas |
| 12 | Singapura | 6 | Largada | Velocidade |

**Janelas estimadas a partir do contador da gravação feita em 04/11/2026:** S9 de 04 a 10/11 (contador `6d 21h`), S10–S12 de 04 a 17/11 (`13d 21h`). Datas de término são **inferidas**, não informadas como datas oficiais no vídeo; rever quando ocorrer a troca. **Clima não aparece no vídeo**, portanto todos os registros atuais usam `weather:null`; não inferir seco/misto a partir da pista ou da época do ano. Para planejar pneus, informe as condições observadas na partida.

## Arquivos alterados e por quê

- `gbr-intelligence.js`: substituição apenas da rotação ativa; inclusão de S9; ciclo próprio por série; vigência independente; exibição de clima não informado; dados históricos de 21/10–03/11 mantidos sem mutação.
- `gbr-duel-engineer.js`: mensagens não classificam clima desconhecido como misto; planejador recebe `null` quando o tempo não está confirmado.
- `index.html`: nova versão nas URLs de scripts modificados para atualização de cache no PWA.
- `notices.js`: aviso informativo local sobre a nova rotação e o Modo Pódio Global, sem escritura em banco.
- `tests/duelos-rotacao-0411-1711.test.js`: 16 correspondências, datas separadas, expiração, bloqueio de estratégias, histórico e preservação do Pódio Global. A suíte de Duelos instancia também o motor real `GBRDuelEngineer.planFor()` para provar que o clima desconhecido bloqueia stints, mesmo havendo durabilidade cadastrada, e que registros de GP não viram evidência de Duelos.
- `AUDITORIA_MANIFEST_PUBLICOS_SHA256.json` + `_worker.js`: hashes, assets efetivamente servidos e allowlist reconstruídos a partir da versão anterior com Pódio Global.
- `docs/adr/0011-rotacao-duelos-series-9-a-12-video-20261104.md`: decisão, riscos, validação e rollback.

## Dependências, impactos e portão de escalabilidade

**Portão de Escalabilidade: OK com atenção à atualização das datas.** Dados estáticos limitados a 16 combinações, sem novas requisições, cache privado, estado por usuário, fila ou mudança estrutural. Desempenho O(1) por consulta de série (lista de quatro pistas). Rotação por data local, sem dependência de Supabase, sem chamadas externas. Porta de mão dupla, reversível pela versão ZIP anterior. Se a rotação for modificada pelo jogo antes das janelas inferidas, o catálogo pode ficar desatualizado até a atualização seguinte. Não altera RLS, autenticação, autorização, dados da garagem, GP São Paulo nem `gpPodiumObservations`.

## Fontes e critérios

Referência funcional adicional: `assets/manual-gbr-racing-lab-2026.pdf`, seção **10 · Duelos** (página 3) e **08 · Pistas**: rotação depende da série, clima/voltas são revisáveis e GP não deve contaminar a estratégia de Duelos. O PDF é manual do usuário, **não** substitui o Manual de Projeto ou Manual de Testes citados pela persona planejadora.


1. `engenheiro-de-segurança.txt` — Regras de Conduta e Etapas 2–3/9: preservar autorização/RLS, não inserir segredos e tratar dados ausentes como não verificados.
2. `arquiteto-de-software.txt` — Portão de Escalabilidade e Etapas 8/10: atualização reversível, sem polling, regressões antes de liberar.
3. `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt` — Regra Principal/Seções 1/2/10: investigar funções/arquivos reais, mudanças em ordem de dependência, testes.
4. `persona-planejadora.txt` — Limites de Atuação, Critérios de Parada e Ordem Obrigatória: não inventar regras de negócio; manuais de projeto/testes e persona de testes adicionais citados no documento **não foram encontrados no pacote**; homologação em ambiente real permanece pendente.

## Validação e rollback

- Oito suítes Node executadas e aprovadas, incluindo `tests/duelos-rotacao-0411-1711.test.js`, `tests/podium-global-20261104.test.js` e `tests/mega-worker-20261029.test.js`; teste visual em navegador real não executado.
- `node tests/mega-worker-20261029.test.js`: hashes e bytes de todos os assets públicos precisam ser iguais aos arquivos ZIP atualizados.
- Inspeção manual pendente no Safari do iPhone e no Cloudflare Pages de homologação, com duas contas e verificação da sincronização do Pódio Global.
- **Rollback:** use o ZIP anterior `GBR_RACING_LAB_MODO_PODIO_GLOBAL_20261104_PREVIA.zip`. Sem migrations ou dados novos, a reversão altera somente código estático.
