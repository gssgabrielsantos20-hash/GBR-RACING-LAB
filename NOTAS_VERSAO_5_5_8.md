# GBR Racing Lab 5.5.8 — Setups salvos na Minha garagem

## Objetivo
Substituir a seção "Inteligência / Série 12" da página **Minha garagem** por uma vitrine funcional de **Setups salvos**, integrada ao recurso já existente de favoritos.

## Alterações principais
- Removida da **Minha garagem** a seção de comparação comunitária.
- Inserida no mesmo espaço uma nova seção:
  - contador de favoritos salvos (`0/8` até `8/8`);
  - botão **Abrir meus setups**;
  - botão **Novo favorito**;
  - cards com até **6 setups recentes**;
  - atalho para abrir/editar cada setup.
- A aba **Meus setups** continua sendo a central completa para edição, criação, exportação PNG e exclusão.

## Arquivos alterados
- `favorites.js`
- `favorites.css`
- `gbr-intelligence.js`

## Impacto
- Sem alteração em autenticação, Supabase, políticas de acesso ou estrutura de dados.
- Mudança visual e funcional reversível.

## Validação executada
- `node --check favorites.js`
- `node --check gbr-intelligence.js`

## Ajuste solicitado
- A vitrine da Minha garagem exibe até **6 favoritos recentes**, em lugar de 3.
- O limite de armazenamento continua sendo **8 favoritos por jogador**; os demais favoritos continuam acessíveis em **Meus setups**.
- Estrutura do ZIP na raiz do projeto e Worker atualizado para refletir os scripts da versão 5.5.8.
