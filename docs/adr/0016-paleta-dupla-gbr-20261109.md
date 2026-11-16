# ADR 0016 — Dois temas visuais GBR (09/11/2026)

**Status:** implementação local para homologação; não publicada.

## Contexto
O ZIP de 07/11/2026 tinha regras CSS claras, porém `gbr-theme.js` (head) forçava `data-theme=dark` e removia preferências `light`. A tela Configurações e o FAQ anunciavam que o modo claro estava suspenso. A imagem de referência fornecida mostra a direção visual desejada: azul-marinho, ciano/turquesa, azul-gelo e hierarquia editorial de tipografia.

## Decisão
Reativar o modo claro no **mesmo** diálogo de Configurações e manter a chave local já existente `gbr-visual-theme-v1`. Tema padrão continua **escuro**, respeitando a aparência anterior. Aplicar CSS específico de apresentação `gbr-visual-20261109.css` no final da cascata, sem reescrever módulos, cálculos, autenticação, sincronização, logotipos ou imagens de cartas. Estender o mesmo controle à Biblioteca Visual. Preferência fica somente no aparelho: não faz escrita de rede ou sincronização de garagem.

## Alternativas descartadas
- Criar framework/design system novo: aumento de regressão sem benefício comprovado.
- Substituir toda a página por imagem estática: funcionalidades e acessibilidade perdidas.
- Duplicar páginas para temas separados: manutenção maior, estados divergentes.

## Consequências, reversibilidade e escala
Alteração de mão dupla: CSS e JS podem ser revertidos sem migração de dados. Sem novas requisições externas; CSS adicional ≈15KB antes de compressão e um recurso novo no Worker. Em 10x usuários, a escolha ainda é local e não gera escrituras no banco; avaliar custo de distribuição e cache se surgirem evidências de tráfego. O cadastro de fotos, RLS e Supabase não são modificados.

**Portão de escalabilidade:** OK para a mudança de apresentação; monitoramento e cargas reais não medidos. **Rollback:** restaurar `index.html`, `gbr-theme.js`, `mobile-premium.js`, `auditoria-imagens.html`, `_worker.js` do ZIP de referência e retirar `gbr-visual-20261109.css`; não há migração de banco.

## Aceite
- Alternar e persistir Escuro/Claro, atualizar logo e ícones do kit, respeitar foco/teclado.
- Capturas estáticas desktop/iPhone em ambos os modos; Safari real pendente.
- Zero modificação de níveis, setups, login, garagens ou imagens publicadas.
- Worker manter recursos anteriores e HTTP 404 dos arquivos internos.
