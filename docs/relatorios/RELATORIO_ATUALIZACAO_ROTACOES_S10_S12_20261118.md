# Atualização oficial — rotações de Duelos S10–S12
**Data de registro:** 18/11/2026  
**Vigência registrada:** 18/11/2026 a 01/12/2026 (14 dias inclusivos; contador do jogo mostrava aproximadamente 13d23h).  
**Fonte:** capturas de tela do jogo fornecidas pelo responsável em 18/11/2026.

## Dados incorporados
| Série | Pista | Voltas | Foco do piloto | Foco do carro |
|---|---|---:|---|---|
| 10 | Miami | 6 | Ultrapassagem | Velocidade |
| 10 | Las Vegas | 6 | Ultrapassagem | Velocidade |
| 10 | Singapura | 6 | Largada | Velocidade |
| 10 | Barcelona | 10 | Gerenciamento de pneus | Velocidade |
| 10 | Lusail | 5 | Largada | Velocidade |
| 11 | Spielberg | 7 | Largada | Curvas |
| 11 | Melbourne | 9 | Largada | Curvas |
| 11 | Madrid | 6 | Ultrapassagem | Curvas |
| 11 | Suzuka | 5 | Gerenciamento de pneus | Curvas |
| 12 | Shanghai | 7 | Defesa | Unidade de potência |
| 12 | Sakhir | 8 | Gerenciamento de pneus | Unidade de potência |
| 12 | Baku | 7 | Gerenciamento de pneus | Unidade de potência |
| 12 | Cidade do México | 9 | Gerenciamento de pneus | Unidade de potência |

## Regras preservadas
- Histórico anterior permanece em `PREVIOUS_SERIES_ROTATIONS` e `LEGACY_SERIES_ROTATIONS`.
- Clima permanece `null`: as capturas não informam clima.
- Nenhuma estratégia de pneus, probabilidade de chuva ou recomendação numérica foi inventada.
- A atualização é estática no catálogo de Duelos; não altera garagem, login, Supabase, RLS ou dados pessoais.
- A rotação vigente é resolvida no período acima. Após 01/12/2026, o catálogo não deve ser tratado como vigente sem nova captura.

## Arquivos alterados
- `gbr-intelligence.js`: `SERIES_ROTATIONS`, fonte/data e janela `ROTATION_START`/`ROTATION_END`.
- `_worker.js`: payload comprimido reconstruído para servir a mesma versão atualizada de `gbr-intelligence.js`.

## Observação
Pacote de homologação atualizado. Não houve publicação no Cloudflare nem push para GitHub. Não foi executada bateria de testes, conforme solicitado.
