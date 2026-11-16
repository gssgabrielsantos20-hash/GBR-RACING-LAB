# GBR Racing Lab — MEGA AUDITORIA E CANDIDATO NOVEMBRO 2026

**Data:** 29/10/2026. **Estado:** ZIP completo gerado e testes automatizados executados; **somente homologação, sem publicação**.

## 1. Base real inspecionada
- Base usada: `GBR_RACING_LAB_3_COLECOES_S12_ROTULO_LIMPO_TESTE.zip`, última versão que o usuário declarou implantada; GitHub `main` tem defasagem histórica e não foi usado como fonte substitutiva.
- Site estático JavaScript/HTML/CSS com Cloudflare Pages `_worker.js` embutido, integração Supabase Auth e persistência individual. **Autenticação, banco e RLS não foram alterados**.
- O pacote anterior foi descompactado e todas as 173 entradas públicas do Worker foram comparadas antes da atualização.

## 2. Fontes internas consultadas
- engenheiro-de-segurança.txt (seções Fase A/B e autorização/RLS): pequenas correções, negar rotas internas, não declarar controle sem evidência.
- arquiteto-de-software.txt (escalabilidade, reversão e ADR): mudanças reversíveis, coerência do catálogo e nenhuma nova dependência de infraestrutura.
- persona-planejadora.txt (planejamento, testes e impacto): análise da base atual, proteção de regressão, testes reproduzíveis.
- INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt (passos de decisão e qualidade): comparar, isolar arquivos, documentar riscos e rollback.
- ADRs GitHub `docs/adr/0001-lendarios-2026.md`, `0002-worker-ativos-publicos.md` e `0003-importacao-setup-por-print.md` (lidos na conexão GitHub): uso de catálogo não destrutivo, URLs de arte verificadas, negação HTTP por padrão, OCR assistido sem posse inventada.
- Documentação externa Cloudflare Pages/Worker consultada na habilidade Cloudflare. Não foram alterados APIs, bindings ou limites de infraestrutura.

## 3. Fontes externas e qualidade da evidência
- Hutch 26/10/2026 Update 63: `https://www.hutch.io/our-games/f1-clash/patch-notes/patch-notes-update-63-objectives-updates-more/` — Lusail em lançamento, Loyalty Club futuro e objetivos.
- Hutch Signature 26/10/2026: `https://f1clashgame.com/news/f1-clash-signature-collection/` — **exatamente seis pilotos** Max Verstappen, Charles Leclerc, Oscar Piastri, Carlos Sainz, Isack Hadjar, Liam Lawson. Confirmado independentemente do print.
- Hutch Paddock 07/08/2026: `https://www.hutch.io/blog/games/paddock-picks/` — oito pilotos, Standard e Turbo Charged.
- AllClash Série 12, 26/10/2026: `https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/` — URLs de imagens observadas para **66 pilotos padrão, 16 cartas Paddock, 6 Signature, 19 peças antes sem referência e 5 lendários**. **Presença de URL no HTML não equivale a teste independente de HTTP 200 ou licenciamento para cópia.** Os JPEGs permanecem nos servidores de origem (não redistribuídos).
- Comunicados oficiais da Hutch recebidos diretamente do usuário em 29/10, incluindo pôster de São Paulo, planilha de recompensas e pôster de Loucura dos Bigodes.
- Criador AzzaW: canal listado pela Hutch em `https://www.hutch.io/our-people/creators/` (`https://www.youtube.com/@AzzaW_Racing`). O YouTube retornou HTTP 401 e a pesquisa não forneceu vídeos específicos confiáveis nesta sessão. **Nenhuma estatística/recomendação foi atribuída a vídeos não assistidos.**

## 4. Achados quantitativos da auditoria
| Item | Antes | Pacote candidato | Observação |
|---|---:|---:|---|
| Peças | 53 | 53 | Mantidas todas |
| Pilotos do catálogo, incluindo variantes | 110 | 111 | + Rubens Barrichello (Lendário) |
| Pilotos lendários | 22 | 23 | Um novo, sem atributos inventados |
| Paddock Standard / Turbo / verdes | 8 / 8 / 6 | 8 / 8 / 6 | Variantes independentes preservadas |
| Peças sem imagem de referência resolvida | 19 | 0 | 19 URLs concretas vistas no AllClash |
| Pilotos sem imagem de referência resolvida | 11 | 1 | Barrichello ainda sem arte individual validada |
| Duplicatas exatas de nome+raridade+edição | 0 | 0 | Não confundir variantes legítimas com duplicatas |
| Circuitos | 24 | 24 | Sem duplicação de São Paulo, Spielberg ou Austin |
| Eventos cadastrados | 2 | 6 | 4 novidades + históricos México/EUA |
| Rotas públicas no Worker | 173 | 177 | Somente 4 novas imagens públicas |

**Limitações de dados:** sete novas peças da Série 12 (`Adrenaline`, `Eco Cell+`, `Thunderbolt`, `The Singularity`, `Flex XXL`, `The Reverse`, `Control`) têm somente nível 1 comprovado pelo material antigo. Níveis 2–8 ausentes; AllClash possui interpolações fracionárias que não foram adotadas como estatísticas oficiais. Dos 111 registros de pilotos, 45 são lendários/especiais sem tabela de níveis confirmada. Os níveis padrão vieram da Resource Sheet histórica da aplicação, **sem revalidação estatística oficial individual neste ciclo**.

## 5. Conteúdo e regras dos eventos
- **São Paulo** (04–08/11): Interlagos, Yas Marina, Suzuka, Zandvoort, Xangai, Spa, Silverstone; +10% para Barrichello (Lendário), Mansell (Lendário), Eco Cell+, Aura Lock, Zephyr; reforço Samba; legendários e especiais permitidos. Recompensas por categoria transcritas do quadro fornecido. Banner fornecido pelo usuário.
- **Loucura dos Bigodes** (11–15/11): Mônaco, Jeddah, Spielberg, Monza, Spa, Hungaroring, Melbourne; +10% para Mansell, Bounce, Wobble, Axis 3000; reforço Handlebar; legendários e especiais permitidos. Banner fornecido pelo usuário.
- **Las Vegas** (18–22/11): Madrid, Spielberg, Hungaroring, Miami, Zandvoort, Austin, Las Vegas. Bônus, pilotos e restrições **não confirmados**; sem recomendações de elegibilidade e sem banner oficial (ilustração tipográfica neutra).
- **Catar** (25–29/11): pistas, regras, reforço e condições **a definir**; sem supor Lusail ou habilitar setup restrito. Ilustração tipográfica neutra.
- **Ordem das pistas desconhecida** em todos os quatro eventos. A interface usa símbolo neutro, nunca ordem numerada. Os bônus aplicam-se apenas à projeção do evento, sem reescrever dados da garagem; cartas não possuídas não são atribuídas ao jogador.

## 6. Arquivos alterados
- `_worker.js`
- `legendary-drivers.js`
- `card-art.js`
- `special-editions.js`
- `events-gp.js`
- `index.html`
- `auditoria-imagens.html`
- `notices.js`
- `tests/colecoes-s12.test.js`

Arquivos novos:
- `assets/events/sao-paulo-spectacular-2026.png`
- `assets/events/moustache-madness-2026.png`
- `assets/events/las-vegas-calendar-2026.svg`
- `assets/events/qatar-calendar-2026.svg`
- `tests/mega-auditoria-20261029.test.js`
- `tests/mega-worker-20261029.test.js`
- `AUDITORIA_MANIFEST_PUBLICOS_SHA256.json`
- `AUDITORIA_CATALOGO_20261029.json`
- `docs/adr/0005-auditoria-catalogo-novembro-2026.md`

**Não alterados:** `app.js`, `garage-plus.js`, `config.js`, `cloud.js`, `supabase-sdk-loader.js`, migrações SQL, políticas RLS, módulos de equipes, favoritos, baús e setups salvos.

## 7. Validações e status
- **Passou:** `node --check` em todos os arquivos JS da raiz e testes.
- **Passou:** `node tests/colecoes-s12.test.js` (três grupos, nivelamento conservador, OCR, preservação, tombstones).
- **Passou:** `node tests/mega-auditoria-20261029.test.js` (53 peças, 111 pilotos, sem duplicatas exatas, imagens referenciadas, preservação de Barrichello existente, calendário 4+2, 24 pistas).
- **Passou:** `node tests/mega-worker-20261029.test.js` (177 rotas GET comparadas byte a byte, índices, headers, GET/HEAD/POST, negação de internos).
- **Passou:** links locais citados no `index.html`, verificados quanto à existência no ZIP.
- **Não verificado:** HTTP 200 de todas as fotos externas no ambiente do usuário. Alguns hotlinks externos podem ser bloqueados no Safari; a Biblioteca Visual permite foto própria priorizada.
- **Não verificado:** login real, sincronização Supabase e RLS interusuários; não há acesso autorizado às sessões de teste.
- **Não verificado:** renderização visual real no navegador Chromium. Tentativa de abrir servidor local retornou `ERR_BLOCKED_BY_ADMINISTRATOR`; não é um defeito comprovado no site.
- **Não verificado:** conteúdo recente dos vídeos AzzaW. A ausência de acesso não foi compensada com suposições.
- **Não executado:** testes históricos completos que existem exclusivamente no GitHub defasado. Antes de sincronizar a `main`, reconciliar expectativas que exigiam 22 lendários/72 imagens antigas; usar branch/PR e CI.

## 8. Segurança e rollback
- Supabase, RLS, perfis, dados pessoais, domínio Cloudflare, certificados e chaves não foram alterados. Nenhum deploy automático, commit GitHub, migração SQL ou operação no banco.
- O Worker só entrega HTML, CSS, JS, imagens públicas, PDF do manual e manifesto web; arquivos `.sql`, relatórios, testes, documentação e `_worker.js` retornam 404 no teste unitário. **Não equivale a auditoria de produção/RLS integral**.
- **Rollback:** reimplantar `GBR_RACING_LAB_3_COLECOES_S12_ROTULO_LIMPO_TESTE.zip` no Pages, sem migração ou restauração de banco. Guardar o histórico e verificar autenticação / garagem após o deploy.
- **Homologar antes da produção:** login/garagem (incluindo conta com Barrichello existente), fotos das três coleções, biblioteca visual, novos banners, GP México, filtros, Série 12 níveis 2–8 não preenchidos e Safari iPhone.
