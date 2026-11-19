# GBR Racing Lab — Release candidate NOVEMBRO 2026

Este ZIP é um **site estático completo para deploy manual no Cloudflare Pages** (testar primeiro em prévia/staging). Contém `_worker.js` com 206 arquivos públicos embutidos (contagem conferida em 18/11/2026; verifique com `node tools/sincronizar-worker.mjs --check`), os demais arquivos locais para conferência, testes e documentos não acessíveis pela rota HTTP.

1. Faça backup do último deploy funcional: `GBR_RACING_LAB_3_COLECOES_S12_ROTULO_LIMPO_TESTE.zip`.
2. Importe **este ZIP completo** em um projeto/ambiente de teste do Cloudflare Pages, não envie apenas `index.html` ou subpastas.
3. Confirme na Central de Eventos: São Paulo (04/11), Bigodes (11/11), Las Vegas (18/11) e Catar (25/11); os dois últimos não presumem elegibilidade.
4. Confirme os ícones dos 66 pilotos padrão, 16 Paddock e seis Edições Especiais; imagens remotas dependem do site externo. Barrichello ainda requer imagem própria na Biblioteca Visual.
5. Em duas contas distintas, confira a garagem, favoritos, RLS, importação por print, níveis S12 e eventos históricos México/EUA. Execute no iPhone/Safari.
6. Se houver regressão, restaure o ZIP anterior. Não execute migração SQL nem force push no GitHub.

**Testes locais:** `node tests/colecoes-s12.test.js`, `node tests/mega-auditoria-20261029.test.js`, `node tests/mega-worker-20261029.test.js`. Mais detalhes: `RELATORIO_MEGA_AUDITORIA_20261029.md`.
