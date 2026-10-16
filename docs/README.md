# Governança técnica — GBR Racing LAB

**Status:** cinco documentos aprovados pelo responsável do projeto em **16/10/2026**.

Este diretório reúne normas de desenvolvimento, segurança e qualidade para as futuras decisões técnicas do GBR Racing Lab. Os cinco documentos foram elaborados com base em fontes disponibilizadas no projeto ChatGPT e na inspeção do sistema real. **Não são cópias de um protocolo AppSec anterior encontrado.** Sua aprovação torna as diretrizes válidas para os próximos trabalhos; **não constitui evidência de que controles, testes ou metas estejam implementados**.

## Ordem de consulta e documentos

1. [Protocolo AppSec](governance/protocolo-appsec.md): duas fases, autorização/identidades, superfície de ataque, evidência e rollback.
2. [Manual do Projeto/Arquitetura](architecture/manual-projeto.md): stack observada, módulos, decisões reversíveis e portão de escalabilidade.
3. [Persona do Desenvolvedor Sênior](personas/desenvolvedor-senior.md): limites de atuação e fluxo de implementação.
4. [Manual de Testes](testing/manual-de-testes.md): matriz de regressão, testes negativos e condições de liberação.
5. [Persona de Testes](personas/testes-qualidade.md): responsabilidade de QA e prova de resultados.

## Fontes predecessoras

Os documentos foram preparados após consultar `arquiteto-de-software.txt`, `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt` e `persona-planejadora.txt`, disponibilizados no Projeto ChatGPT, além dos relatórios existentes no repositório, do código da aplicação e de metadados de leitura do Supabase e Cloudflare Pages. Essas fontes originais têm precedência quando tratam de fatos comprovados e limites mais restritivos. Divergências exigem análise explícita, não resolução por suposição.

## Ponto de partida e limites

- Baseline documental: GitHub `main` em `e82562bf0de96464f4d27b41a3a0378485649247`; pasta da aplicação `GBR_Racing_Lab_5_5_5_HILL_CORRIGIDO_VALIDADO/`.
- Publicação: Cloudflare Pages `gbr-racing-lab`, ainda com deploy por upload ad hoc; equivalência exata entre produção e commit não comprovada.
- Dados: Supabase `GBR Racing Control`; não modificar schema, políticas RLS, usuários ou garagens sem etapa aprovada.
- Documentação é **alteração não executável**. Criar/mesclar os documentos não autoriza corrigir vulnerabilidades, alterar regras de negócio nem publicar o app.
- Novas correções seguem **Fase A (somente leitura) → proposta individual, evidências e testes → aprovação da Fase B → validação → aprovação e deployment de produção separados**.

## Acompanhamento

| Verificação | Status nesta entrega documental |
|---|---|
| Aprovação das cinco diretrizes | Confirmada na conversa em 16/10/2026 |
| Código da aplicação alterado | Não |
| Banco e produção alterados | Não |
| Controles AppSec testados | Não; diagnóstico parcial preexistente |
| Testes funcionais E2E executados nesta entrega | Não |

Registros futuros de arquitetura devem usar `docs/adr/NNNN-titulo.md`, quando houver uma decisão estrutural real a registrar.

## Retomada verificada em 16/10/2026 — versão 5.5.9A

- **Histórico:** o baseline `e82562b`, com a aplicação dentro de `GBR_Racing_Lab_5_5_5_HILL_CORRIGIDO_VALIDADO/`, documenta o momento original de aprovação e não representa a estrutura mais recente.
- **GitHub atual na retomada:** branch `main`, commit `8c69b912ed48117a6d859cf5344748a12ee1f4cc`; arquivos da aplicação na **raiz** do repositório, incluindo `favorites-model.js`, `favorites.js`, `favorites.css` e `tests/favorites-model.test.js` e `tests/favorites-spotlight-six.test.js`.
- **Release:** `NOTAS_VERSAO_5_5_9A.md` descreve ajustes visuais para iPhone; sua publicação efetiva e comportamento em Safari não foram comprovados nesta retomada.
- **Proveniência:** os cinco documentos de diretrizes são recuperados integralmente da cópia aprovada em 16/10/2026, sem reescrever suas normas. Divergências factuais entre o inventário histórico e o código atual exigem nova investigação, não edição retroativa do histórico.
- **Mudanças permitidas nesta branch:** documentação apenas. Este registro não concede autorização para alterar Supabase, RLS, dados, Cloudflare ou produção.
