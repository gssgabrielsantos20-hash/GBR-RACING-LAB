# GBR Racing Lab 5.5.6 — Relatório de correção estrutural

## Causa raiz e evidência
- `index.html`, seção `#academy`: havia um `</div>` extra logo após o texto `Sua garagem é individual.`, fechando a seção antes de `#adminPanel`.
- O `#adminPanel` ficava fora de `section#academy`, deixando-o visível mesmo ao selecionar o Painel.
- `cloud.js`, função `renderAdmin()`, mantém o controle de visualização e alteração por RPC `am_i_academy_admin()` e `admin_move_player()`.

## Alteração
- `index.html`: remover somente o fechamento de `div` excedente entre o fim do bloco de perfil e o início de `#adminPanel`, sem tocar nas RPCs ou na camada de dados.
- `_worker.js`: reempacotar somente os recursos estáticos atualizados, sem mudar a lógica HTTP.
- `MANIFEST_SHA256_5_5_6.json`: registrar os hashes dos arquivos incorporados.

## Testes
- Parser HTML confirma `#adminPanel` como descendente de `section#academy`, e não do `#dashboard`.
- Confirma a existência de um único `#adminPanel`, `#adminPlayers`, `#adminRefresh` e elementos de navegação.
- Comparação de hashes dos recursos não modificados com o ZIP 5.5.5.
- Verificação byte a byte da correspondência entre recursos locais e Worker após reempacotamento.
- `node --check` dos scripts JavaScript e do Worker.
- Não foi executado teste autenticado em Safari físico.

## Reversão
- Restaurar a versão de produção 5.5.5 usando o histórico de deployments do Cloudflare.
- Nenhum dado foi alterado no Supabase, não há migração a reverter.

## Limites das fontes
- Fonte AppSec separada, Manual de Projeto, Manual de Testes e Persona de Testes não estavam disponibilizados sob esses nomes neste ambiente. A mudança preserva integralmente os controles existentes e não depende de operações privilegiadas.
