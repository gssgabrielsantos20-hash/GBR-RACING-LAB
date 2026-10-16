# Relatório de correção — GBR Racing Lab 5.5.5

## Objetivo
Corrigir a confusão entre os pilotos lendários **Graham Hill** e **Damon Hill** na Biblioteca Visual e nas miniaturas exibidas no aplicativo.

## Causa raiz identificada
1. O arquivo `card-art.js` reduzia o nome do piloto ao último sobrenome para buscar a referência visual.
2. Assim, `Graham Hill` e `Damon Hill` eram ambos reduzidos a `hill`.
3. O mapeamento de `hill|Legendary|` apontava para `driver-dhill-legendary`, causando foto incorreta em cartas de Graham Hill.
4. Na tela `auditoria-imagens.js`, a lista auxiliar continha `D. Hill`, mas não apresentava `Graham Hill` separadamente.
5. Em `garage-plus.js`, a lista de candidatos do OCR/importação por print não incluía Graham Hill nem Damon Hill explicitamente.

## Arquivos alterados
- `card-art.js`
- `auditoria-imagens.js`
- `garage-plus.js`
- `index.html` e `auditoria-imagens.html` (versão das referências JavaScript para atualização de cache)
- `_worker.js`
- `MANIFEST_SHA256_5_5_5.json`
- `NOTAS_VERSAO_5_5_5.md`

## O que foi corrigido
- Separação explícita dos slugs de **Graham Hill** (`driver-ghill-legendary`) e **Damon Hill** (`driver-dhill-legendary`).
- Fallback visual refeito para tentar primeiro **nome completo**, depois aliases, e só então outras variações controladas.
- Biblioteca Visual atualizada para exibir **Graham Hill** e **Damon Hill** como entradas distintas, sem remover a entrada legada **D. Hill** usada em versões anteriores.
- OCR/importação por print melhorado com candidatos lendários adicionais.

## Testes realizados
- `node --check` em todos os arquivos JavaScript da versão.
- 10 verificações de resolução de imagens, incluindo ambos Hill, iniciais, piloto sem sobrenome completo e um piloto não relacionado.
- 2 verificações de reconhecimento por OCR, com números dos prints, uma para cada Hill.
- Testes de precedência de imagem manual e independência dos registros dos pilotos.
- Confirmação de chaves distintas no editor e de parâmetros de cache atualizados.
- Comparação de arquivos contra a 5.5.4: apenas 6 arquivos já identificados diferem.
- 50 hashes do manifesto de ativos conferidos contra o ZIP final.
- 13 verificações do Worker (entrega byte a byte, index, GET, HEAD, 404 e 405).
- Teste local do resolvedor de imagens confirmando:
  - `Graham Hill` → `driver-ghill-legendary`
  - `Damon Hill` → `driver-dhill-legendary`
  - `G. Hill` → `driver-ghill-legendary`
  - `D. Hill` → `driver-dhill-legendary`
  - `Hill` → sem fallback ambíguo

## Limites conhecidos
- Se existir algum cadastro antigo salvo manualmente apenas como `Hill`, ele deixará de herdar fallback ambíguo automático. Nesse caso, o ideal é editar o nome para `Graham Hill` ou `Damon Hill`.
- A correção não publica automaticamente uma foto compartilhada no Supabase; ela corrige o mapeamento e permite cadastrar o piloto certo.

## Dependências e limitações verificadas
- **Cloudflare Pages**: a implantação oficial precisa do ZIP 5.5.5 atualizado; publicar na branch `main` após teste em prévia. Nesta sessão a transferência direta do arquivo ao Pages não está disponível.
- **Supabase**: consulta somente leitura à tabela `gbr_card_images` não encontrou registros compartilhados contendo `Hill`. Nenhum registro, permissão ou garagem foi alterado.
- **Fonte AppSec**: o protocolo separado referido pelas instruções do projeto não foi localizado nos arquivos disponíveis; controles existentes foram preservados, mas não se pode afirmar auditoria AppSec completa.
- **URLs externas de imagem**: o resolvedor retorna os slugs `ghill`/`dhill`, porém a disponibilidade real da imagem externa não foi confirmada por teste de carregamento remoto. O administrador poderá cadastrar foto autorizada para Graham Hill na Biblioteca Visual.
- **Validação em produção/iPhone**: pendente após o upload. Não afirmar testes reais no Safari ou publicação concluída.

## Rollback
- Implantação: restaurar no Cloudflare a versão 5.5.4 que estava em produção antes da correção.
- Dados: não exige migração, desfazer tabelas ou restaurar estado de garagem; nenhum dado Supabase é alterado por este pacote.

## Status
Correção concluída localmente e ZIP preparado para publicação; ainda não publicada em produção. Necessária validação pós-deploy no app autenticado.
