# GBR Racing Lab 5.5.10 — Relatório técnico da implementação

## Objetivo
Incluir no app os 15 lendários pendentes, preservando os 7 já conhecidos, com identificação inequívoca e sem inventar estatísticas, séries, propriedade ou imagens.

## Arquivos
- **Novo:** `legendary-drivers.js`: catálogo de nomes canônicos, abreviações, referência de imagens verificadas, registro não destrutivo no catálogo.
- `catalog.js`: extensão do catálogo base através do novo módulo, sem substituir as 66 cartas previamente conhecidas.
- `app.js`: migração respeitando abreviações, exclusões e posse existente; pesquisa por alias no filtro da garagem.
- `card-art.js`: respeita prioridade de imagens compartilhadas > locais > referência AllClash verificada. Reconhece aliases, mantendo separados os Hill e Villeneuve.
- `garage-plus.js`: OCR reconhece abreviações sem depender apenas de substrings ambíguas.
- `auditoria-imagens.js`: catálogo visual agora inclui todos os lendários a partir do catálogo, mais a chave legada `D. Hill` para edição de fotos antigas.
- `index.html`, `auditoria-imagens.html`: importam o módulo antes dos consumidores e usam revisão nova dos scripts para evitar cache antigo.
- `_worker.js` e `MANIFEST_SHA256_5_5_10.json`: empacotamento e integridade dos arquivos.

## Regras preservadas
- Nenhuma alteração nas tabelas, migrações, RLS, autorização, chaves ou APIs.
- Usuários continuam possuindo apenas as cartas que marcarem; níveis, estatísticas e série não são inferidos.
- Mudanças antigas da garagem continuam idempotentes e não são sobrescritas.
- Exclusão manual de uma carta lendária é respeitada mesmo quando existir alias diferente.
- Nenhum registro em `gbr_card_images` foi criado/alterado/excluído.
- Cinco imagens externas não confirmadas não são vinculadas automaticamente.

## Validação
Rodar `node tests/legendary-catalog.test.js`, `node tests/legendary-migration.test.js`, `node tests/legendary-ocr.test.js`, e os testes de favoritos existentes.
Validação estrutural em navegador/Safari real: pendente.

## Fontes consultadas
- Protocolo AppSec separado: não localizado, auditoria completa não verificada.
- `arquiteto-de-software.txt`: migração idempotente, sem sobrescrita, risco regressivo e reversibilidade.
- `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`: alteração localizada, teste antes de publicação.
- `persona-planejadora.txt`: dependências obrigatórias de manuais extras não disponíveis; especificidade da validação e limitações declaradas.
- `GBR_RACING_LAB_REFERENCIAS_IMAGENS_22_LENDARIOS_2026.json`: referências de imagens previamente examinadas; URLs ainda não verificadas ficaram pendentes.

## Rollback
Reimplantar o ZIP oficial 5.5.9A. Dados já salvos pelos usuários nas próprias garagens não são modificados por rollback do frontend. O módulo não cria nova tabela nem altera o modelo de persistência.
