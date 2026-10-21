# GBR Racing Lab — Fase B, Etapa 1 (21/10/2026)

**Status:** candidato em branch; nao implantar diretamente. **Nenhuma mudanca em Cloudflare, Supabase ou main.**

## Referencia
O usuario confirmou o ZIP oficial \`GBR_RACING_LAB_MEU_PERFIL_GUIAS_CLOUDFLARE_RC_20261021(1).zip\`, SHA-256 \`eea38550a345a66e622d575941a4cca12c8f3e1d302e8684dde57b7d389e7233\`. Os bytes do deployment remoto nao puderam ser verificados.

O \`app.js\` desse ZIP coincide com o blob pre-correcao do GitHub: \`ed67085c062d7193d498f8cfe58686c500ecdc84\`.
O blob corrigido e \`ba78d0e20a4c33f3b81e16192b2ef8fd9b368c24\`.

## Correcao
\`app.js\` / \`optimize\`: selecionar somente cartas possuidas com nivel numerico finito e positivo; aceita numero ou texto numerico nao vazio. Peso, pontuacao, regras de categoria e limite de serie nao foram alterados.

## Testes reais (local, Node 22.16.0)
- Baseline sobre ZIP oficial: **10/14 passaram**, quatro falharam nos casos nivel 0, NaN, Infinity e boolean.
- Mesma suite apos correcao: **14/14 passaram**.
- Nova suite \`tests/optimizer-eligibility.test.cjs\`: **15/15 passaram** no snapshot de \`app.js\` identico ao blob corrigido.
- Sintaxe de 38 JS do ZIP candidato: **38/38 passaram**.
- Teste de Worker candidato: **20/20 rotas/metodos passaram**, incluindo negacao de SQL, docs e tests.
- Dicionario gzip/base64 do Worker validado em 164 recursos publicos, para 165 arquivos no ZIP.
- Nao foram executados testes E2E Safari, testes de vitoria no jogo ou suite completa de testes historicos do GitHub.

## Limite da sincronizacao
Esta branch contem a correcao de \`app.js\` e o teste. **Nao equivale ao ZIP completo publicado**: assets, \`_worker.js\` e versoes de \`builder-plus.js\` e \`events-gp.js\` ainda precisam ser reconciliados para sincronizar integralmente o GitHub.

## Rollback
Reverter exclusivamente o commit de \`app.js\` ou restaurar seu blob original \`ed67085c...\`, executar \`node --test tests/optimizer-eligibility.test.cjs\` (falhas de nivel zero voltarao, como evidenciado) e conferir novamente integridade do Worker ao criar um ZIP. Reverter o ZIP completo por seu original sem tocar em dados.

## Escopo futuro nao autorizado
Nao modificar pesos, bonificacoes, pilotos, bateria, aprendizado ou interface. Etapa 2 exige aprovacao separada.
