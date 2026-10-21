# GBR Racing Lab — reconciliação da versão oficial / FASE B Etapa 1

**Referência do usuário:** ZIP informado como publicado oficialmente em 21/10/2026, SHA-256 `eea38550a345a66e622d575941a4cca12c8f3e1d302e8684dde57b7d389e7233` (165 recursos públicos).

**Candidato aprovado para sincronização do código:** SHA-256 `5b029f0ab51d55a7e48636c245a042d71fe5fc8fb96622dd3b13df8ad7e26f6e`; altera apenas `app.js` e o dicionário de recursos em `_worker.js` relativamente ao ZIP oficial. `app.js` corrigido tem Git blob `ba78d0e20a4c33f3b81e16192b2ef8fd9b368c24`.

## O que foi executado

- A branch `gbr/fase-b-etapa1-elegibilidade-20261021` contém a correção, o teste e os registros de QA.
- Baseline local da versão corrigida: **14/14**; suíte independente de elegibilidade: **15/15**; Worker público: **20/20**.
- Um script de sincronização foi validado em repositório Git remoto **simulado localmente**, incluindo envio de branch, preservação de documentação, verificações de integridade e não alteração de `main`.
- O script rejeita o ZIP original, que não contém a correção.

## Pendente antes de encerrar a Etapa 1

A sincronização **remota integral dos 165 recursos** não foi concluída: não há acesso à internet no terminal de arquivos e o conector GitHub não recebe os binários locais diretamente. O envio completo deve partir de um PC com Git + Python e autenticação GitHub configurada, utilizando o pacote técnico fornecido na conversa.

**Não afirmar que esta branch está sincronizada com a versão pública até comparar os blobs dos 165 recursos.**

Não executar deploy, merge na `main`, alterações Supabase, ou Fase B Etapa 2 nesta operação.