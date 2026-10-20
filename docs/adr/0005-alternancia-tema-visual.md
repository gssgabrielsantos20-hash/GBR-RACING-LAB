# ADR 0005 — Alternância visual clara/escura no GBR Racing Lab

**Status:** implementação em branch candidata; não homologada nem publicada em produção.

## Contexto
O aplicativo usa 19 folhas de estilo e tokens/hardcodes predominantemente escuros. A navegação não tinha menu Configurações. A Biblioteca Visual (auditoria-imagens.html) é uma página separada. Autenticação e garagem não precisam sofrer alterações para permitir aparência clara/escura.

## Decisão
- Manter **Escuro** como padrão preservando CSS existente.
- Adicionar gbr-theme.css, carregado após os outros estilos, com overrides somente em html[data-theme="light"].
- Centralizar alternância em gbr-theme.js: preferência limitada a dark e light, salva em localStorage da origem, aplicada ao html no head antes da renderização, sincronizada entre abas pelo evento storage.
- Oferecer Configurações → Aparência no PC (barra lateral), no iPhone (Mais) e no login. Usar dialog nativo com controles de rádio e foco restituído. Na Biblioteca Visual, há seletor equivalente.
- Preferência **por navegador/perfil**, não sincronizada entre aparelhos. Sem escrita no Supabase, alteração de RLS, dados, contratos de API, Worker ou imagens de cartas.
- O tema claro não altera nem inverte artes. O banner fotográfico principal pode manter o contraste escuro próprio.

## Alternativas
1. Duplicar todas as folhas CSS: rejeitada por manutenção duplicada.
2. Aplicar filter: invert(1) na página: rejeitada por distorcer fotos e banners.
3. Salvar no banco por usuário: rejeitada por modificação desnecessária de esquema, permissões e sincronização.
4. Substituir progressivamente todos os literais por tokens: opção futura, mas risco de regressão maior nesta entrega.

## Escalabilidade, privacidade e acessibilidade
- **Portão de escalabilidade: OK** para mudança isolada. Apenas leitura/escrita local de pequena string. Sem endpoint novo, worker, cache privado, query ou incremento de requisições.
- Valores aceitos em allowlist. Falha de armazenamento bloqueado não impede uso.
- color-scheme, controle nativo por teclado, foco restaurado e prefers-reduced-motion.
- Contraste WCAG AA e comportamento no Safari/iPhone ainda devem ser testados visualmente. Alguns painéis incluem cores de estados e miniaturas literais.

## Validação e rollback
1. Rodar node tests/gbr-theme.test.js seguido dos testes existentes em checkout completo.
2. No PC e iPhone, verificar todas as abas, menu Mais, login, diálogo via Escape/teclado, contraste, formulários, imagens e persistência entre recargas.
3. Abrir auditoria-imagens.html, trocar tema e conferir mesma escolha ao retornar.
4. Verificar que login, sincronização e cálculos de setups não foram alterados.
5. Cloudflare Pages usa uploads manuais: GitHub não equivale automaticamente à produção; pacote do deploy precisa incluir os dois novos arquivos e ambas páginas modificadas. Conferir empacotamento do _worker.js/ativos quando aplicável.
6. Usar implantação Preview e somente após homologação publicar em Production; rollback pelo último deployment anterior válido, sem migração de banco.

## Arquivos afetados
- index.html — menu PC/iPhone/login, diálogo e referências.
- auditoria-imagens.html — seletor compartilhado.
- gbr-theme.js — controlador de interface e persistência local.
- gbr-theme.css — superfície clara para módulos.
- tests/gbr-theme.test.js — estrutura e cenários de alternância.
- docs/adr/0005-alternancia-tema-visual.md — esta decisão.

Nenhuma migração, segredo, mudança no banco ou regra de autorização integra o escopo.
