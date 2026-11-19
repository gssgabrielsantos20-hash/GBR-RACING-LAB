# GBR Racing Lab — Biblioteca Visual unificada para boosts

**Status: pacote de prévia, NÃO publicado nem migrado em produção.**

## Resultado

- Pilotos, peças e boosts compartilham `Salvar URL`, escolha de foto e o mesmo serviço `GBRCardArt.saveRemote()/uploadRemote()`.
- Removidos controles extras `Prévia`, `Salvar neste aparelho` e `Compartilhar com academia` da página administrativa. O estado local antigo é preservado como legado, sem novos salvamentos locais pelo botão da interface.
- Erro de CHECK (`gbr_card_images_kind_check`) convertido em aviso explícito de migração pendente, sem alegar sucesso.

## Por que a foto ainda pode não aparecer

O banco oficial de produção rejeita o tipo `boosts` em `public.gbr_card_images`. O Storage também bloqueia o upload na pasta `boosts/` por política. A implementação completa exige uma migração que ainda não foi autorizada especificamente para produção. Não foi feita importação de fotos de terceiros ou migração.

## Sequência segura para liberar em produção (após aprovação específica)

1. Confirmar backup/restauração e baseline de RLS/políticas; preparar ambiente isolado e identidades de teste.
2. Aplicar `docs/sql-review/PROPOSTA_gbr_card_images_boosts_20261105.sql` no ambiente de teste, após revisão.
3. Testar cadastro de piloto, peça e boost com administrador; rejeição para usuário comum/anônimo; leitura compartilhada; gravação de foto em `boosts/`, e conflito de chave.
4. Homologar no iPhone e PC e fazer deploy do mesmo artefato validado, após aprovação específica.
5. Confirmar imagem carregada em duas contas; conservar ID do deploy anterior para rollback.

## Limitações

Nenhuma foto real dos 11 boosts está incorporada; o aplicativo depende do upload autorizado. URLs externas podem falhar por bloqueio do host e não devem ser presumidas válidas. SQL aqui é proposta; não aplicar diretamente em produção sem autorização explícita.
