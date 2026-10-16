# GBR Racing Lab 5.5.8 — Ajuste da vitrine para seis favoritos

## Escopo e diagnóstico
A vitrine da seção **Minha garagem** exibida por `favorites.js` chamava `recentItems(3)`, apesar de o recurso pessoal permitir até 8 configurações. O pedido é mostrar **até 6 itens recentes** nessa vitrine, preservando a capacidade de armazenamento de oito setups e a aba completa **Meus setups**.

## Arquivos alterados
- `favorites.js`: `recentItems()` passa a adotar limite padrão 6 e `renderGarageSpotlight()` chama `recentItems(6)`.
- `index.html`: cache-busting de `favorites.js`, `favorites.css` e `gbr-intelligence.js` para evitar arquivo anterior.
- `NOTAS_VERSAO_5_5_8.md`: documentação atualizada para até seis favoritos recentes.
- `tests/favorites-spotlight-six.test.js`: adicionados testes de apresentação 0, 3, 6 e 8 favoritos.
- `_worker.js` e `MANIFEST_SHA256_5_5_8.json`: recompostos para refletir os bytes reais da versão.

## Preservado
- Limite de **8** no modelo (`favorites-model.js`, `MAX=8`).
- Edição/remoção e PNG no menu independente `Meus setups`.
- Não houve alteração de banco, RLS, serviços, login ou permissões.
- O bloco de referência comunitária continua substituído pela vitrine de favoritos dentro de `Minha garagem`, conforme pedido anterior.
- Demais funções do app preservadas no pacote-fonte sem mudanças.

## Verificações reais
- Node: sintaxe JavaScript aprovada.
- Testes preexistentes de domínio: 13 casos aprovados.
- Novo teste: cenários 0/3/6/8 aprovados; 8 favoritos salvos mostram os 6 mais recentes.
- Comprimido do Worker: 64 arquivos comparados byte a byte com a pasta de origem; manifesto válido.
- ZIP íntegro, com `index.html` e `_worker.js` na raiz (corrigido erro estrutural do ZIP anterior).

## Riscos e pendências
- Teste autenticado Safari/iPhone e sincronização entre PC e iPhone: **não verificados nesta alteração**.
- Protocolo AppSec separado citado nas instruções do projeto: **indisponível**, sem atestar auditoria integral de segurança.

## Rollback
Reimplantar o último deployment estável (atualmente 5.5.6 se nenhum deployment posterior foi efetuado), mantendo `garage_states` intocado. A mudança é apenas de frontend e de apresentação.

## Status
Pacote pronto para homologação. Nenhuma publicação foi realizada no Cloudflare nesta etapa.
