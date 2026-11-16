> **Histórico substituído:** datas e a classificação "Final parcial" deste ADR foram substituídas pela confirmação do responsável em 02/11/2026. Ver `docs/adr/0008-sao-paulo-datas-final-fixa-20261102.md`.

# ADR 0007 — Calendário oficial por etapa do GP São Paulo 2026

**Status:** candidato para homologação em prévia; atualização local preparada em 02/11/2026. Sem deploy no Cloudflare, GitHub ou banco.

## Contexto

A versão Pit Wall de 01/11/2026 preservava as sete pistas de São Paulo apenas como opções não ordenadas, com período 04–08/11, pois a primeira comunicação oficial não trazia a sequência. Em 02/11/2026, o responsável forneceu cinco capturas do F1 Clash mostrando as condições de prova, datas, classificatória, abertura, início da final e tarefas do patrocinador para quatro categorias. A faixa superior do cronograma registra **04–09/11**, superando o intervalo abreviado anterior de **04–08/11**. A captura da Final está encoberta pelo botão "Voltar" após o início da terceira corrida.

## Decisão

- Manter **um único evento** `sao-paulo-spectacular-2026` em `events-gp.js`.
- Adicionar `stageRounds` separado em `qualifying`, `opening` e `final`, com objetos `{track,laps,rain,tempMin,tempMax}` somente para as corridas legíveis.
- Classificatória: quatro; Abertura: oito; Final: três visíveis. Marcar `partialStages:['final']` e avisar explicitamente que o restante **não foi confirmado**.
- Datas: 04–05/11, 07–08/11 e 08–09/11, respectivamente, e `ends=2026-11-09`.
- Manter `tracks` com as sete pistas e não afetar os registros dos GPs anteriores, Duelos, Biblioteca de pistas ou outros modos.
- Reutilizar o seletor existente `selectedStage`, as funções de renderização, o planejamento por prova e o comparador; não criar uma segunda base de dados de pistas.
- Corrigir a comunicação da tarefa de campeão: a captura apresenta **+6 pontos de corrida** com Barrichello e Eco Cell+ destacados, mas não prova soma de +12, nem uso simultâneo obrigatório. Exigir "usar ao menos um recurso" é o texto do jogo.
- No Pit Wall, apontar para a Central de Eventos como fonte da sequência e continuar evitando stints de pneus fictícios.
- Garantir layout de três etapas no iPhone com CSS responsivo.

## Impactos e segurança

Somente recursos públicos estáticos e testes locais. Nenhuma alteração em sessões, autenticação, permissões, RLS, banco, garagem, favoritos, dados pessoais ou APIs. Não incluir os screenshots nos recursos públicos, pois mostram saldo do jogador e UI privada. O Worker embute os três recursos modificados com a mesma allowlist de 193 caminhos públicos. Documentos, testes e dados de auditoria continuam inacessíveis por HTTP.

**Escalabilidade:** OK para o escopo, sem novas solicitações remotas, nem polling. Render de até oito corridas/etapa; custo local constante e reversível. A qualidade visual real do Safari permanece sem verificação.

## Alternativas rejeitadas

- Duplicar o evento em três eventos independentes: fragmentaria o histórico e os bônus.
- Completar a Final extrapolando a Abertura: equivaleria a inventar dados do jogo.
- Definir estratégia rígida de pneus por chuva prevista: não há degradação ou durabilidade oficiais da garagem para a corrida.
- Atualizar a `main` ou produção diretamente: sem homologação e aprovação de publicação.

## Validação e reversão

`tests/sao-paulo-calendario-oficial-20261102.test.js` verifica a transcrição de 15 provas, tempos, chuva, temperaturas e tarefas. Os cinco testes anteriores devem permanecer verdes; `tests/mega-worker-20261029.test.js` confronta as 193 respostas HTTP com bytes locais e negação por padrão.

Rollback: substituir o pacote pela versão entregue pelo usuário `GBR_RACING_LAB_PIT_WALL_4_FASES_NOVEMBRO_2026_PREVIA(1).zip`. Não há migration nem restauração de banco necessária.

## Fontes consultadas

1. `engenheiro-de-segurança.txt`, regras de conduta, defesa em profundidade e rollback.
2. `arquiteto-de-software.txt`, portão de escalabilidade, alterações reversíveis, evitar duplicação.
3. `persona-planejadora.txt`, preservação de comportamento e critérios de aceite; novos critérios de produto não foram criados.
4. `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`, causa raiz e sequência de arquivos/testes.
5. `docs/adr/0005-auditoria-catalogo-novembro-2026.md` e `docs/adr/0006-pit-wall-2026.md`, decisões anteriores de catálogos, eventos e fronteiras de dados.
6. Capturas oficiais do jogo `IMG_9865(1).png` a `IMG_9869(1).png`, fornecidas pelo responsável em 02/11/2026; não republicadas no pacote.
