# GBR Racing Lab — Eventos Las Vegas e Catar, 04/11/2026

## Objetivo e situação
Atualizar os dois eventos no pacote local do GBR Racing Lab **sem modificar a versão em produção** enquanto não houver publicação verificável.

- **Las Vegas (18–22/11):** Glamour, +10% em Carlos Sainz (Comum/Raro/Épico/Coleção Exclusiva), Isack Hadjar (Comum/Raro/Épico/Paddock Standard/Coleção Exclusiva), Control, Curver 3.0, Tailwind; Lendários não permitidos; especiais permitidas; 7 pistas possíveis; recompensas e níveis por etapa.
- **Catar (25–29/11):** Turquia, +10% em Michael Schumacher Lendário, Rubens Barrichello Lendário, The Singularity, Downforce, Stratos; Lendários/especiais permitidos; 7 pistas possíveis; recompensas e níveis por etapa.
- **Sem atribuir ordem das provas, voltas ou clima**. O bônus futuro é projetado somente na análise, não escrito na garagem. Não inserir conteúdo externo de AzzaW.

## Arquivos modificados
- `events-gp.js`: cadastros, requisitos de patrocinador por etapa, filtro de raridades e edições participantes, aviso contextual, clima desconhecido quando não informado.
- `index.html`: versão do script `events-gp.js` para evitar cache antigo.
- `_worker.js`: pacote de recursos públicos recomposto a partir do Worker original, com 197 arquivos (195 existentes e 2 imagens novas).
- `assets/events/las-vegas-gp-2026.webp` e `assets/events/qatar-legendary-2026.webp`: cartazes do usuário convertidos em WebP de alta qualidade para reduzir o peso da distribuição.
- `MANIFEST_PUBLICOS_EVENTOS_20261104_SHA256.json`: hashes dos 197 recursos públicos no Worker.
- `tests/mega-auditoria-20261029.test.js` e `tests/mega-worker-20261029.test.js`: expectativas de cadastro e manifesto ajustadas. Testes específicos adicionados.

## Evidências verificadas
- `tests/eventos-las-vegas-catar-20261104.test.js`: PASS — eventos, recompensas, 7 pistas cada, raridades, cálculo de bônus sem modificar atributos da garagem.
- Nove testes locais sem Worker pesado: PASS — S9–S12, eventos anteriores, Pit Wall, Pódio, catálogo.
- `tests/worker-events-smoke-20261104.test.js`: PASS — HTTP 200 para 4 recursos, 404 para 4 recursos privados, método POST negado.
- Inspeção com Python: 197 recursos do Worker coincidem com os arquivos e o manifesto SHA-256, byte a byte.
- **Limitação:** o teste `mega-worker-20261029.test.js` completo foi encerrado pelo limite de memória do ambiente; não é dado como aprovado. Resta testar o navegador Safari, autenticação e Supabase com duas contas reais.

## Projeto real / publicação
- Cloudflare: projeto `gbr-racing-lab` identificado via conexão, produção em `gbr-racing-lab.pages.dev`.
- Último deploy verificado durante esta análise: `d95d06ab-7310-440d-946d-028f78805e87`, 04/11/2026, 12:19 UTC, `success`.
- Consulta à produção via Firecrawl confirmou que `events-gp.js` ainda continha as descrições antigas de Las Vegas/Catar.
- **Sem novo deploy:** o conector permite consultar e gerenciar o Cloudflare, mas o envio do pacote binário do Worker não pôde ser concluído por este fluxo. Publicar apenas fragmentos faria o Worker perder os demais recursos. Não foi feita publicação parcial.
- Backup lógico para rollback: a versão registrada acima pode ser selecionada no Cloudflare Pages para rollback, sujeito à disponibilidade no painel.

## Quatro fontes consultadas
1. `engenheiro-de-segurança.txt` — fases A/B, isolamento de dados, RLS, proteção de segredos, testes antes de publicar; nada de publicar sem evidência suficiente.
2. `arquiteto-de-software.txt` — portão de escalabilidade, alterações pequenas, medição, rollback. Observação: Worker atual já armazena base64 de todos os recursos, aumentando a memória na borda; preferência futura por assets estáticos separados.
3. `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt` — examinar causa/arquivos/impacto, sequenciar alterações, proteger comportamentos existentes.
4. `persona-planejadora.txt` — sem regras inventadas, observar critérios de parada e manuais complementares; Documento de Solicitação/Manual do Projeto/Manual de Testes/Persona de Testes não foram encontrados neste ambiente como documentos independentes. As referências disponíveis não bastam para certificar teste de homologação real.

## Portão de escalabilidade
**ATENÇÃO:** alteração estática, reversível e sem migrações, porém a arquitetura atual empacota todos os recursos no próprio Worker e precisa de validação no ambiente real. Sem alteração de RLS ou envio de dados ao Cloudflare. Não presuma resistência a 10x sem medição.

## Próxima ação
Importar/publicar o ZIP completo por um fluxo de upload binário autorizado do Cloudflare Pages, sem sobrescrever com arquivo parcial; depois verificar banner, elegibilidade, bônus, sponsor, S9 e sincronização no iPhone. Se falhar, efetuar rollback para o deploy anterior registrado.
