# Relatório técnico — Boosts como pilotos e peças (09/11/2026)

## 1. Objetivo e diagnóstico

O GBR tinha dois problemas distintos:
- O motor de recomendações conhecia somente 11 boosts.
- A Biblioteca Visual também carregava somente esses 11; não consumia o catálogo completo da planilha e não tratava fotos de boosts com o mesmo repositório visual de pilotos/peças.

A planilha anexada, aba `Boosts`, contém 65 nomes distintos e nenhuma imagem incorporada. O catálogo visual foi separado do motor de recomendações para ampliar a biblioteca sem alterar cálculos.

## 2. Levantamento de imagens

- 65 nomes na planilha.
- 64 URLs externas catalogadas (59 referências antigas, incluindo um item fora da planilha, mais 5 caminhos adicionais).
- 50 URLs retornaram HTTP 200; 49 foram reconhecidas pelo extrator de imagens e `Tire Water` retornou HTTP 200 com MIME `image/png`, mas sem extração visual confirmada.
- 15 nomes não têm imagem acessível confirmada: 13 caminhos retornaram 404 e 2 nomes (`Schooner`, `Tune-In`) não têm caminho localizado.
- `Nuke Boost` não consta na planilha e não foi adicionado.
- Nenhuma imagem externa foi baixada, copiada ou embutida no Worker.

## 3. Decisão e implementação

### Catálogo
- `GBRBoostCatalog.items`: preservados os 11 itens do recomendador, sem alteração de stats, pesos, ranking ou cálculos.
- `GBRBoostCatalog.visualItems`: 65 nomes da planilha, sem filtro por GP/série.
- `getVisual()` permite localizar por ID ou nome.

### Imagens
- `card-art.js`: fotos compartilhadas no Supabase e fotos locais seguem o mesmo resolvedor de pilotos/peças; sem foto cadastrada, fallback neutro.
- URLs AllClash permanecem somente em metadados de auditoria. ADR 0015 proíbe hotlink/download/re-hospedagem sem licença escrita.
- `boosts-plus.js/css`: foto aparece no próprio cartão quando compartilhada/local; removido o link externo que substituía a foto.
- `auditoria-imagens.js/html`: lista os 65 boosts, busca, filtros, contador de referências, cadastro por URL autorizada ou upload de arquivo, e fallback para erro de imagem.
- Migração local em lote inclui boosts, mas ignora URLs AllClash; publicação segue exclusiva de administradores.

### Supabase
Consulta read-only confirmou:
- `gbr_card_images_kind_check` aceita `drivers`, `parts`, `boosts`.
- RLS ativo em `public.gbr_card_images` e `storage.objects`.
- Política de upload permanece `authenticated` + `am_i_academy_admin()` e pasta autorizada.
- 97 registros: 68 pilotos, 28 peças e 1 registro de imagem de boost (`Ballast`).
- O objeto `boosts/ballast-cd9b941b-8251-41c6-8bf1-ea8ca3096928.webp` existe no bucket (`image/webp`, 5.648 bytes). HTTP 200 confirmado; correspondência visual com o ícone do jogo ainda não inspecionada.
- Nenhuma escrita, migração ou alteração de policy foi feita nesta etapa.

## 4. Arquivos alterados

- `gbr-boost-catalog.js`
- `card-art.js`
- `boosts-plus.js`
- `boosts-plus.css`
- `auditoria-imagens.js`
- `auditoria-imagens.html`
- `index.html`
- `docs/references/boost-imagens-externas-pendentes-20261105.json`
- `docs/references/boost-visual-catalog-20261109.md`
- `docs/adr/0012-catalogo-boosts-referencia-local-20261105.md`
- `docs/adr/0013-biblioteca-visual-boosts-20261105.md`
- `docs/adr/0014-paridade-imagens-boosts-20261105.md`
- `docs/adr/0015-referencias-visuais-boosts-externas-20261109.md`
- testes e manifests.

## 5. Fontes e governança

1. **Fonte 1 — `engenheiro-de-segurança.txt` / `01-protocolo-appsec.md`:** privilégio mínimo, validação no servidor, RLS preservado, upload validado e conteúdo externo não confiável. Aplicado sem alteração de política.
2. **Fonte 2 — `arquiteto-de-software.txt`:** separar catálogo visual do motor de recomendação, preservar módulos existentes, mudança reversível e medir/testar antes de release.
3. **Fonte 3 — `INSTRUÇÕES-DE-TOMADA-DE-DECISÃO.txt`:** entender fluxo atual, investigar causa raiz, comparar alternativas e validar antes de alterar.
4. **Fonte 4 — `persona-planejadora.txt`:** escopo limitado, não alterar regra de negócio nem assumir permissões; registrar pendências.
5. **`REGRAS-DE-ORIGINALIDADE.txt` e ADR 0015:** sem hotlink, download ou re-hospedagem de arte de terceiros sem licença escrita.
6. **`02-manual-projeto.md`, `03-desenvolvedor-senior.md`, `04-manual-de-testes.md`, `05-persona-testes.md`:** preservar arquitetura, validar regressões, documentar e não declarar validação física que não ocorreu.

## 6. Validação

- `node --test tests/*.test.js`: **35/35 aprovados**.
- `node --check`: **64 arquivos JavaScript aprovados**.
- `node --input-type=module --check < _worker.js`: aprovado.
- Worker contém 199 recursos públicos; verificação byte a byte contra os arquivos locais: aprovada.
- Safari físico/iPhone: não executado.
- Inspeção visual da foto compartilhada Ballast: pendente.
- Cloudflare e GitHub: não publicados/alterados.

## 7. Rollback e pendências

- Rollback de código: restaurar os arquivos públicos listados no manifesto e o `_worker.js` do pacote anterior.
- Não há rollback de banco necessário; esta etapa não escreveu no Supabase.
- Para preencher as fotos, enviar capturas próprias do inventário do jogo ou autorização escrita do titular para uso das imagens externas.
- Homologar no Safari/iPhone antes de publicar.
