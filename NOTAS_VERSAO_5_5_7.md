# GBR Racing Lab 5.5.7 — Meus Setups Favoritos

## Novidade

- Novo menu **Meus setups** no PC e em **Mais → Meus setups** no iPhone.
- Cada jogador pode salvar **até 8 setups favoritos** em sua garagem individual.
- Composição manual de **6 peças principais, bateria opcional e 2 pilotos diferentes**, usando cartas de qualquer série, sem limite de série.
- Cada favorito tem **nome**, **pista opcional** e **observações sobre a corrida**.
- Os atributos e níveis das cartas são preservados no momento em que o setup é salvo, mesmo que a garagem seja atualizada depois.
- Consultar, editar, excluir e **exportar PNG** reutilizando o gerador do Montador.
- Sincronização com iPhone/PC pela mesma conta, usando a persistência existente em `garage_states`.

## Compatibilidade

- Nenhuma migração SQL, tabela, função RPC, política RLS ou segredo novo.
- Histórico antigo de setups (`saved`), 24 pistas, biblioteca visual, garagem, equipes, duelos, rotação, baús, GP e avisos foram preservados.
- Em modo demonstração, dados não são sincronizados.
- A limitação de 8 é validada no modelo do aplicativo; o JSON armazenado no banco ainda não tem uma `CHECK` exclusiva para essa regra (escopo futuro, com auditoria AppSec).

**Status:** pacote preparado para validação. Não publicado no Cloudflare.
