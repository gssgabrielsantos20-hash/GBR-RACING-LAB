# ADR 0014 — Paridade dos boosts na Biblioteca Visual

Data: 05/11/2026 · Status: fluxo de UI implementado; migração de produção aplicada e validada em 09/11/2026.

## Contexto

A interface oferecia três comportamentos próprios de boosts (salvar localmente, prévia, compartilhar) apesar de peças e pilotos usarem apenas `GBRCardArt.saveRemote()`/`uploadRemote()`. A captura do usuário mostrou a recusa do servidor pelo `gbr_card_images_kind_check`. A consulta ao Supabase oficial em leitura confirma que tanto esse CHECK quanto a política INSERT do bucket `gbr-card-art` só contemplam `drivers` e `parts`.

## Decisão

1. Não criar mecanismo de persistência paralelo para boosts. Usar a mesma ação `Salvar URL` e a mesma seleção de foto do celular dos outros dois tipos.
2. Aplicar a autorização administrativa já existente em `GBRCardArt` e RLS, preservando o histórico local como legado sem criar novos registros locais na UI.
3. Para habilitação compartilhada, revisar/aplicar separadamente as duas mudanças mínimas de SQL: permitir `boosts` no CHECK e `boosts/` na política administrativa INSERT de Storage. Não modificar RLS, grants ou outros itens.
4. Não importar imagens de terceiros sem autorização verificável. Até cadastro autorizado, os cartões podem exibir `Sem foto`.

## Alternativas rejeitadas

- Salvar boosts como `parts` para contornar o CHECK: integridade e autorização incorretas.
- Criar tabela e upload paralelos: duplicação de código e políticas.
- Simular sucesso com URL somente local: induz o usuário a crer que a imagem foi compartilhada.
- Fazer hotlink automático para as imagens do AllClash: permissão de reutilização e disponibilidade não verificadas.

## Segurança e escala

Portão de Escalabilidade: ATENÇÃO até homologação. Reutilização de tabela e bucket evita infraestrutura adicional; preservar privilégios existentes. Testes de usuário anônimo/comum/administrador e Safari real são pendências de ambiente, não resultados aprovados.

## Validação e rollback

Validar diff estático, o mesmo `saveRemote()` para os três tipos, recusa para cliente sem papel administrativo, integridade e Worker. Prova de RLS integrada deve preceder qualquer aprovação de produção. Rollback frontend: restaurar o deploy anterior. Rollback SQL conservador: `docs/sql-review/ROLLBACK_gbr_card_images_boosts_20261105.sql`, que aborta se houver imagens de boosts já gravadas.


## Adendo — estado atual (09/11/2026)

- Consulta read-only confirma CHECK e política de Storage com suporte a `boosts`, mantendo RLS e a exigência de administrador.
- Há atualmente 1 registro compartilhado de boost (`Ballast`) e o objeto correspondente no bucket.
- O catálogo visual agora inclui 65 nomes; o motor de recomendação continua com 11 boosts e seus cálculos não foram alterados.
- Referências AllClash não são hotlinked nem copiadas. A publicação continua limitada a fotos locais/compartilhadas autorizadas.
