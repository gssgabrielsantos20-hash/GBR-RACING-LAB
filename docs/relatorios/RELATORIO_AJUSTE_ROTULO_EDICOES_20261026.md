# GBR Racing Lab — ajuste cosmético do rótulo "Edições Especiais"

**Escopo:** remoção da expressão `(fundo verde)` na interface e no aviso integrado. O nome apresentado fica **Edições Especiais**.

**Base:** `GBR_RACING_LAB_3_COLECOES_ESPECIAIS_S12_CORRECOES_TESTE.zip` (implantação em teste).

**Arquivos alterados:** `index.html` (opção do filtro e cache bust de JS); `special-editions.js` (`collections[2].label`); `notices.js` (texto do aviso); `_worker.js` (reempacotamento dos 173 recursos estáticos do Cloudflare Pages).

**Invariantes:** ID `green` preservado; valor de `editionLabel` preservado; `Signature Collection` continua sendo um alias histórico; 8 cartas Paddock, 8 Turbo, 6 cartas verdes e peças S12 mantidas. Nenhuma alteração de catálogo numérico, permissões, banco, Supabase, autenticação ou GP do México.

**Fontes verificadas:** `engenheiro-de-segurança.txt` (mudança mínima e rollback); `arquiteto-de-software.txt` (baixo risco, testes); `persona-planejadora.txt` (preservar validações existentes); `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt` (responsabilidade do componente e impacto), além dos ADRs 0001 e 0002 aplicáveis ao catálogo e aos arquivos públicos. Consultadas; nenhuma orientação adicional impeditiva para a alteração do texto.

**Validação:** comparação byte a byte dos 173 assets servidos pelo Worker com arquivos do ZIP, confirmação de alteração exata nos quatro arquivos, testes automatizados preexistentes de catálogo e migração; não há teste visual real Safari com usuário autenticado.

**Rollback:** reimplantar o ZIP-base acima no ambiente de teste. Não há migração de banco para reverter.
