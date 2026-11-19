# GBR LAB 6 — Vinculação visual dos 11 boosts (05/11/2026)

## Objetivo e autorização
Pedido: vincular as ilustrações aos nomes dos boosts e continuar a melhoria de apresentação do catálogo, preservando a base aprovada de 05/11/2026. **Escopo restrito a interface, atributos visuais e arquivos estáticos.** Não há autorização independente para publicar nesta etapa.

## Baseline e fonte de verdade
- Arquivo de origem: `GBR_LAB_6_BOOSTS_COMPLETO_05NOV2026.zip`, 246 entradas; a pasta de trabalho foi comparada com cada entrada desse ZIP e nenhuma divergência prévia foi encontrada.
- Fonte do usuário: `GBR_LAB_6_IMAGENS_BOOSTS_05NOV2026(1).md` (59 URLs externas e alerta explícito de licença não verificada).
- Imagens usadas: **11 ilustrações originais geradas para o GBR Racing Lab**, recortadas de `a_high_detail_screenshot_of_the_gbr_racing_lab_web.png`; **não são a arte do F1 Clash**. Vinculação textual pelos nomes originais do catálogo e IDs estáveis.
- O ZIP usado como base para a distribuição pública foi `GBR_LAB_6_BOOSTS_DEPLOY_05NOV2026.zip`.

## Fontes e critérios técnicos
1. `engenheiro-de-segurança.txt`, regras e etapas 3/5/9: não usar imagens remotas não autorizadas, impedir HTML arbitrário, não alterar contas e garagens.
2. `arquiteto-de-software.txt`, Portão de Escalabilidade e frontend: recursos estáticos, carregamento sob demanda, reversibilidade.
3. `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`, regras 1–6: localizar o módulo existente, não duplicar cálculo, indicar arquivo e função.
4. `persona-planejadora.txt`, limites e critérios de parada: alteração limitada e testada, sem novas regras do jogo.
5. `REGRAS-DE-ORIGINALIDADE.txt`, itens 1/4/5: não copiar arte de terceiros, diferenciar fatos de elementos ilustrativos.
6. Documentos de governança aprovados em 16/10/2026 (Biblioteca): `01-protocolo-appsec.md`, `02-manual-projeto.md`, `03-desenvolvedor-senior.md`, `04-manual-de-testes.md`, `05-persona-testes.md`. Exigem prova, teste negativo, rollback e aprovação independente para produção.

## Alterações verificáveis
- `gbr-boost-catalog.js`, bloco `ART` e mapeamento `DATA`: adicionados os campos `imageSrc` e `imageType='ilustracao_gbr'` para os 11 IDs, sem mudar pontuação, estoque ou atributos.
- `boosts-plus.js`, funções `boostArt()`, `inventorySection()`, `suggestionsHTML()` e `install()`: cada nome mostra sua própria imagem local tanto na grade como na sugestão; erro de imagem remove o `<img>` para revelar o fallback; indicação de **imagens ilustrativas** adicionada no painel.
- `boosts-plus.css`: responsividade móvel, disposição da imagem + texto + quantidade, miniaturas compactas nas sugestões.
- `index.html`: versão dos três recursos mudada para `20261105boostart1` para evitar reuso de JS/CSS antigo no PWA.
- `assets/boosts-original/{id}.webp`: **11 novos arquivos locais**, de `butterfly` a `hex`; todos com formato WebP e nomes correspondentes aos IDs.
- `docs/references/boost-imagens-externas-pendentes-20261105.json`: **59 nomes/URLs externos apenas para conferência futura**, com permissão não verificada. Nenhum deles é acessado pelo site.
- `docs/adr/0012-catalogo-boosts-referencia-local-20261105.md`: adendo da decisão e rollback.
- `_worker.js`: manifesto recompilado com 209 recursos, imagens novas com `image/webp`.

## Segurança, originalidade e escala
- **Nenhum HTML/imagem carregado do AllClash**. URL externa só aparece em documentação de desenvolvimento, não na UI.
- O ID define a associação, nunca a posição. Nome e caminho são dados locais constantes; atributos de jogo continuam tratados como referências pendentes de confirmação.
- Fotos ilustrativas não pretendem reproduzir as cartas oficiais. Fallback textual preserva identificação quando falham.
- Inventário permanece temporário em memória, sem cloud/sync, e a garagem não foi editada.
- **Portão de Escalabilidade: ATENÇÃO, não bloqueante.** 11 arquivos WebP locais e lazy loading; sem chamadas adicionais de API ou consultas. Benchmarks com 10x usuários ainda não realizados.

## Validação executada
- `node --check` em **43 scripts** de primeira camada do projeto, sem falhas.
- **12 testes automatizados** passaram: arte por ID/WebP, catálogo e estoque, coleções, rotação, UI S9, imagens de eventos, Vegas/Catar, mega auditoria, Pit Wall, Pódio Global, São Paulo e smoke do Worker.
- Integridade: Worker decompressão/recompressão com **209 recursos**, todos byte a byte coincidentes com os caminhos locais; **194 recursos anteriores inalterados**, **4 recursos editados** e **11 imagens novas**. Zero arquivos públicos removidos.
- `tests/mega-worker-20261029.test.js` **não executado** por limite anterior de memória deste ambiente; o smoke do Worker foi executado e passou.
- Teste visual Chromium: **não concluído** (timeout do ambiente), portanto **não homologado**.
- Safari físico/iPhone, login, Supabase real, isolamento A/B e carga: **não executados** nesta mudança exclusivamente visual.

## Plano de rollback
Restaurar os arquivos públicos e `_worker.js` de `GBR_LAB_6_BOOSTS_DEPLOY_05NOV2026.zip`. A reversão remove as 11 ilustrações e campos de apresentação novos, mantendo intacto o catálogo original de 11 boosts. Não há migração de banco nem alteração de dados privados.

## Próxima etapa lógica
Homologar no Safari/iPhone as imagens, o fallback e a legibilidade dos cartões e confirmar que não há rolagem horizontal. Depois, prosseguir para o **ajuste de chave e fonte por registro em `gbr-strategy-reference.js`** antes de importar referências de pneus de outros eventos. Sem publicação automática.
