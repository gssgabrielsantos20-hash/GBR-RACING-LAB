# GBR Racing Lab — Rotação de Duelos 04 a 17/11/2026

**Status:** atualização completa para **PRÉVIA** (não publicada). Fonte: tabela visual enviada pelo responsável em 02/11/2026. Vigência: 04/11 a 17/11/2026, conforme informação fornecida.

## Entradas inseridas

| Série | Pista | Piloto | Carro | Clima | Voltas |
|---|---|---|---|---|---:|
| 10 | Monza | Defesa | Velocidade | Misto | 6 |
| 10 | Mônaco | Defesa | Curvas | Misto | 5 |
| 10 | Jeddah | Defesa | Velocidade | Seco | 4 |
| 10 | Zandvoort | Defesa | Curvas | Misto | 8 |
| 11 | Miami | Ultrapassagem | Velocidade | Misto | 6 |
| 11 | Las Vegas | Ultrapassagem | Velocidade | Seco | 6 |
| 11 | Singapura | Largada | Velocidade | Misto | 6 |
| 11 | Barcelona | Gerenciamento de pneus | Velocidade | Seco | 10 |
| 12 | Spielberg | Largada | Curvas | Misto | 7 |
| 12 | Melbourne | Largada | Curvas | Misto | 9 |
| 12 | Mônaco | Defesa | Curvas | Misto | 5 |
| 12 | Suzuka | Gerenciamento de pneus | Curvas | Misto | 5 |

## Arquivos alterados

- `gbr-intelligence.js`: nova rotação vigente, arquivo da rotação anterior, prioridades e exibição de prévia; transição respeita a data local.
- `gbr-strategy-reference.js`: período dinâmico associado às rotações, sem montar estratégias numéricas inventadas.
- `app.js`: remove descrição estática do antigo período, preservando lógica genérica `TRACK_SERIES` fora de Duelos.
- `index.html`: revisões de query string para garantir atualização dos scripts no PWA.
- `_worker.js` e `AUDITORIA_MANIFEST_PUBLICOS_SHA256.json`: mesmo conjunto de 193 recursos públicos, hashes novos onde houve mudança.
- `tests/duelos-rotacao-0411-1711.test.js` e `docs/adr/0009-duelos-rotacao-04-17-novembro-2026.md`: teste e registro de decisão.

## Comportamento

- Até 03/11: rotação anterior continua **vigente**, a nova aparece como **prévia, não vigente**, sem alterar a recomendação em Duelos.
- 04/11 a 17/11: a nova rotação passa automaticamente a alimentar a Biblioteca de Pistas, o Engenheiro de Duelos e o módulo de referência de voltas.
- A partir de 18/11: a tabela nova continua consultável, porém aparece como encerrada e **não** alimenta recomendações de rotação vigente.
- A imagem informa apenas `Mixed`/`Dry`; `Mixed` significa condições mistas/variáveis e não uma chance de chuva 100% ou 0%.

## Preservação e limites

Nenhuma alteração de Supabase, autenticação, níveis/atributos de cartas, favoritos, histórico, gestão de baús, estrutura de garagem, imagens ou calendário oficial do GP de São Paulo. A nova rotação é diferente dos eventos GP.

**Validação local:** teste de rotação e seis testes legados do ZIP; Worker comparado byte a byte com o manifesto. Homologação do Safari/Cloudflare e testes com contas reais não realizados. O pacote **não foi publicado**. **Rollback:** republicar `GBR_RACING_LAB_PIT_WALL_SAO_PAULO_ETAPAS_CORRIGIDAS_20261102_PREVIA.zip`.

## Fontes técnicas

`engenheiro-de-segurança.txt` — Regras de Conduta (AppSec); `arquiteto-de-software.txt` — Portão de Escalabilidade; `persona-planejadora.txt` — Limites e Critérios de Parada; `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt` — Regra Principal, diagnóstico e arquivos envolvidos. Ver `docs/adr/0009-duelos-rotacao-04-17-novembro-2026.md`.
