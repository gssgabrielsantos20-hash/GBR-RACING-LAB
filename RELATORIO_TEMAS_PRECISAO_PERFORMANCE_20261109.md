# GBR Racing Lab 6 — temas Escuro/Claro (prévia de homologação)

**Data:** 09/11/2026. **Status:** implementação local e testes concluídos; nenhuma publicação GitHub/Cloudflare; nenhum comando de banco ou login. **Fonte dos arquivos:** `GBR_LAB6_GP_SETUPS_07NOV2026_COMPLETO_PREVIA(1).zip`, SHA-256 `4602fdf7aeaf29f39000ac98278573ed89025fcb7fef93275d106e6723968682`. A imagem fornecida pelo usuário é a referência para a direção visual, sem copiar a página externa do Canva.

## Diagnóstico e evidência

- `gbr-theme.js`, início: a função anterior `applyDark` fixava `data-theme=dark` e removia `localStorage='light'`.
- `index.html`, diálogo `#gbrSettingsDialog`: apenas "Escuro", sem controle de mudança; menu mobile dizia "escuro fixo".
- `mobile-premium.js`, FAQ: o modo claro era apresentado como suspenso.
- `gbr-theme.css`: várias regras do modo claro já existiam, mas não eram utilizáveis. Outras regras fixas, em particular `gbr-rebrand.css` e `dashboard-telemetry.css`, exigiam complemento de cascata.
- `auditoria-imagens.html`: mostrava "Escuro (fixo)", apesar de depender do mesmo mecanismo de imagem/tema.

## Alterações, escopo e reversão

1. `gbr-theme.js`: restaura escolha Escuro/Claro e chave local anterior `gbr-visual-theme-v1`; sincroniza cores da barra do sistema, estado, logo, símbolo e os ícones já previstos. Default escuro; armazenagem inacessível é tolerada. Nenhum acesso à garagem ou rede.
2. `index.html`: diálogo acessível com radio Escuro/Claro, descrições, miniaturas; atualiza mensagem de ajuda e versão de assets; adiciona `gbr-visual-20261109.css` após CSS legado.
3. `gbr-visual-20261109.css` (novo): azul-marinho/turquesa no escuro, azul-gelo/azul-profundo no claro; painel inicial, menus, cartões, login, formulários, botões e foco visível. Preserva todas as imagens reais existentes, incluindo ícones de pilotos, peças e boosts.
4. `mobile-premium.js`: atualiza a resposta do FAQ, sem alterar o mecanismo da Ajuda.
5. `auditoria-imagens.html`: aplica ambos os temas e oferece alternância local pela mesma preferência; cadastro e permissões não alterados.
6. `_worker.js`: recompila payload estático sem remover recursos. Novos testes e ADR em `tests/` e `docs/adr/0016-paleta-dupla-gbr-20261109.md`.

**Rollback:** restaurar do ZIP de referência `index.html`, `gbr-theme.js`, `mobile-premium.js`, `auditoria-imagens.html`, `_worker.js`; remover CSS novo. Não existe migração de banco.

## Fontes técnicas consultadas

- `engenheiro-de-segurança.txt`, regras 1–8: mudanças pequenas, rastreáveis, com testes e rollback; sem segredos ou alteração de RLS.
- `arquiteto-de-software.txt`, regras e portão de escalabilidade: manter arquitetura, não duplicar componentes, alteração reversível de mão dupla.
- `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`, regras de responsabilização e separação entre domínio e apresentação: nenhum peso/algoritmo alterado.
- `persona-planejadora.txt`, limites de escopo e testes: não inventar novas regras de negócio; preservar fluxos aprovados.
- `REGRAS-DE-ORIGINALIDADE.txt`: inspiração visual original; nenhum conteúdo de sites de terceiros incorporado.
- `docs/adr/0015*` do ZIP: preservar acordos de contexto GP e rotações, consultados sem orientação visual adicional.
- Os cinco documentos aprovados de governança de 16/10/2026 orientam preservar a arquitetura, testar navegação e permitir rollback; orientação visual adicional não identificada.

## Validação realizada

- `node --test` nas suítes de `tests/*.test.js` exceto `mega-worker-20261029.test.js`: **29 testes aprovados, 0 falhas**. Nova suíte valida preferências, logo, ícones, rótulos e rotas do Worker.
- `node --check` em **43 arquivos JS** da raiz: aprovado.
- Parser CSS para o novo arquivo: **0 erros**; total de 23 folhas CSS no projeto.
- Validação do manifesto e Worker: **199 recursos públicos**, dos quais 194 inalterados, 4 modificados e 1 adicionado; 0 removidos; byte a byte corresponde aos arquivos.
- Contraste das combinações principais, WCAG de texto comum: ciano escuro/navy ≈9:1; tinta naval/azul-gelo ≈13:1; texto de botão branco sobre teal claro ≈5,3:1 (amostras da paleta, não auditoria de todas as telas).
- Browser: troca de tema simulada em Chromium em memória com testes de estados, preferência e logo; quatro prévias estáticas renderizadas nos tamanhos desktop e 390px. **Não é homologação no Safari físico, nem prova de login/integração Supabase**. A navegação de rede/file:// no Chromium deste ambiente foi bloqueada; por isso a prévia visual foi alimentada por arquivos locais em memória, sem autenticação.
- A suíte pesada `tests/mega-worker-20261029.test.js` não foi executada (risco de consumo excessivo de memória).

## Impacto e riscos

**Portão de escalabilidade: OK para a troca de apresentação; desempenho em 10x não medido.** O novo CSS é estático, sem nova API e com preferência guardada no dispositivo. Riscos residuais: especificidade de CSS antigo em módulos pouco usados, foco/overflow com teclado virtual Safari, cache PWA e ícones carregados de forma assíncrona. Recomendação: validar no iPhone/PC antes da publicação; testar login, rolagem, Biblioteca Visual, Pistas, Montador, Duelos, Garagem, Eventos e temas.

**Nenhuma modificação ao Supabase e nenhuma foto adicionada.** A migração de boosts realizada anteriormente no banco não é alterada por esta versão.
