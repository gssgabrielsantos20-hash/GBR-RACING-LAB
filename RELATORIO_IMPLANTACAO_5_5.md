# GBR Racing Lab 5.5 — pacote preparado para implantação

**Status:** preparado para homologação; **não publicado**. Base: `GBR_Racing_Lab_5_4_BIBLIOTECA_SINCRONIZADA.zip` (última versão local recuperada da Biblioteca), não o ZIP antigo v5.1. Data de preparo: 16/10/2026.

## O que mudou na versão 5.5

1. **Nightmare Fuel 2026:** calendário separado por fase: classificação (4 provas) e abertura/final (8 provas em 7 circuitos distintos), com a ordem dos circuitos e indicação de chuva na corrida de Silverstone. O calendário do GP não altera a biblioteca permanente das **24 pistas**.
2. **Eventos de GP por corrida:** cada corrida tem seleção individual, visualização do clima informado, prioridade dos atributos, montagem por classe e resultado considerando somente cartas marcadas como possuídas na garagem. Circuitos sem ordem/clima comprovados continuam explicitamente descritos como possibilidades, sem invenção de dados.
3. **Bônus temporário de GP:** +10% somente na janela de realização cadastrada. Fora da janela, o benefício é exibido como previsto ou encerrado, mas não é aplicado aos atributos calculados e nunca é gravado no Supabase.
4. **Série 12 / Duelos:** painel independente com rotação de 07/10/2026 (Monza, Abu Dhabi, Singapura e Jeddah), data da referência e alerta quando a revisão quinzenal for necessária. Não afirma atualização automática dos circuitos nem altera a seleção permanente de pistas.
5. **Referências de setup × garagem real:** novo painel somente leitura compara, por categoria, peças principais e alternativas recomendadas pelo AllClash com a disponibilidade e o nível cadastrados. Nenhuma compra, evolução ou mudança automática.
6. **Estratégia dos dois pilotos:** painel de dupla e paradas escalonadas nos Eventos GP. Somente para a prova 1 do Nightmare Fuel, categoria Campeão, há exemplo numérico validado pela fonte. As demais provas recebem orientações gerais e indicação de que durabilidade/voltas não foram verificadas.
7. **Imagens e importação por prints:** preservadas da base 5.4, sem reformular ou destruir o que já funciona. Biblioteca visual da academia sincronizada via `gbr_card_images`, miniaturas em telas relevantes e importação assistida por OCR com confirmação manual.
8. **Interface/compatibilidade:** textos corrigidos para 24 pistas; novas seções responsivas e scripts com cache-busting. Área de comparação tem rolagem interna em telas estreitas.

## Origem e confiabilidade dos dados

- AllClash — evento Nightmare Fuel 2026, consultado em 16/10/2026: https://www.allclash.com/f1-clash-nightmare-fuel-event-2026-guide-junior-challenger-contender-champion/
- AllClash — Série 12, alteração de rotação publicada em 07/10/2026, consultado em 16/10/2026: https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/
- Calendário, bonificações de cartas e datas do GP dos Estados Unidos mantidos da base anterior; consultar o jogo para validação operacional.
- Recomendações são referências informativas, não promessas de desempenho ou cópia de conteúdo exclusivo.

## Componentes existentes preservados

- As 24 pistas e traçados já existentes, excluindo Ímola.
- Garagem privada por usuário e estado individual armazenado na tabela `garage_states`, sem escrita no banco durante o preparo.
- Login, confirmação e recuperação de senha, equipes da academia e controles existentes.
- Montador, Duelos, localização de baús e histórico salvo.
- Fotos e a auditoria de imagens com publicação compartilhada no Supabase; fallback de imagens e sincronização existentes.
- Seleção dos tipos de pilotos (incluindo Lendário e Escolhas do Paddock), sistema de importação/exportação JSON e importação por captura de tela.

## Testes efetuados e limites

- `node --check` para scripts JavaScript atualizados, com êxito.
- **18/18 testes de lógica** aprovados, abrangendo estrutura do calendário, regra do +10%, permissões de raridade, dupla sem piloto repetido, preservação dos dados da garagem, caminhos de arquivos e biblioteca de pistas.
- O pacote ZIP deve ser verificado após montagem, incluindo integridade do Worker e sua relação com os arquivos estáticos.
- **O navegador automatizado bloqueou o endereço local por política do ambiente**; testes visuais interativos em navegador, Safari físico, login com usuários reais e envio real de imagens autenticado permanecem **pendentes**. Nenhuma alegação de validação funcional ponta a ponta.
- Na biblioteca 5.4 ainda existiam fotos ausentes. A versão 5.5 não inventa nem baixa materiais não autorizados; a cobertura depende das inclusões feitas pelo administrador na biblioteca compartilhada.

## Banco de dados e segurança

- Supabase: projeto `GBR Racing Control`, ativo; RLS ligado nas tabelas de garagem e imagens. **Nenhuma alteração de schema, policy, conta, senha ou garagem nesta versão.**
- O arquivo `MIGRACAO_BIBLIOTECA_VISUAL_5_4.sql`, incluído apenas para rastreabilidade, é registro de migração **já aplicada**. **NÃO executá-lo novamente.**
- Auditoria de segurança Supabase retornou avisos preexistentes de RPCs `SECURITY DEFINER` com `EXECUTE` para papéis públicos e tabelas sem políticas próprias; exige auditoria de permissões em tarefa separada, para não interromper cadastro/login/equipes em produção.
- As fotos publicadas no bucket já existente têm acesso público; não colocar documentos pessoais nas imagens.

## Checklist de homologação, antes de publicar

1. Fazer backup do ZIP atual da produção e exportar um backup JSON da garagem de teste.
2. Em navegador desktop, abrir a prévia e conferir 24 pistas, Montador, Duelos, Imagens, Baús, Equipes, login e recuperação de senha.
3. Na central de Eventos, escolher Nightmare Fuel, conferir 8 corridas; escolher Classificação, conferir 4 provas; selecionar corrida 5 (Silverstone, chuva 100%).
4. No calendário dos duelos Série 12, confirmar os quatro circuitos contra a rotação efetiva no jogo, especialmente se a rotação ocorrer novamente após outubro.
5. Validar um cadastro de peças e pilotos (inclusive Lendário e Escolhas do Paddock), seleção por raridade, comparação de garagem e importação por print, sem duplicação.
6. No Safari de iPhone, conferir layout, navegação, lista longa de peças, fotos e sincronização após recarregar e abrir em segundo aparelho.
7. Na conta de administrador, enviar/atualizar uma foto de teste na Biblioteca Visual e conferir a miniatura numa conta de usuário; verificar permissões para usuário não administrador.
8. Confirmar no Cloudflare que o deployment ficou `success`; realizar teste de regressão de logins/garagens e manter caminho claro de rollback.

## Implantação futura — somente após aprovação do usuário

- Projeto Cloudflare Pages: `gbr-racing-lab`, branch `main`, domínio: https://gbr-racing-lab.pages.dev .
- Enviar o ZIP completo **`GBR_Racing_Lab_5_5_PREPARADO_PARA_IMPLANTACAO.zip`** por upload direto no Pages, mantendo seus arquivos na raiz (principalmente `_worker.js`, `index.html` e `assets/`). A publicação *não* depende da migração SQL incluída no arquivo.
- Último deployment de produção consultado antes do preparo: `17f12f07-c946-48a1-9573-5dc80a280b62`, status `success`, data 16/10/2026 10:46 UTC. Salvar o identificador de produção mais recente novamente imediatamente antes da publicação para rollback; este identificador pode mudar se houver outra implantação.
- **Não publicar enquanto pendentes a aprovação e a homologação real**, especialmente iPhone, login e operações de mídia.
