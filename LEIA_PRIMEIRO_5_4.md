# GBR Racing Lab 5.4 — Biblioteca Visual Sincronizada

## O que mudou

- A Biblioteca Visual usa a tabela `public.gbr_card_images` do Supabase para ler as fotos compartilhadas.
- Um **administrador** da academia pode publicar URL HTTPS, enviar foto da galeria do iPhone, substituir e remover o mapeamento da carta.
- O envio da galeria compacta para até 760 px e armazena no bucket **público** `gbr-card-art` do Supabase Storage; somente administradores autorizados podem enviar/modificar arquivos pelas políticas RLS.
- Integrantes **autenticados** leem o catálogo compartilhado. O aplicativo prioriza foto compartilhada, depois referência local do navegador, depois referência visual externa preexistente.
- A tela permite importar o JSON legado da versão 5.3 e publicar as URLs locais em lote (sem sobrescrever um registro já compartilhado).
- O app tenta atualizar a biblioteca ao receber mudanças em tempo real; também tem atualização periódica e botão **Sincronizar agora** na Biblioteca Visual.
- O cadastro de imagens não altera `garage_states`, atributos, peças, níveis, login, duelos e cálculos.
- **Não** foram inventadas nem incluídas as 84 fotos ausentes. Elas continuam a exigir arquivos/URLs autorizados.

## Banco de dados

A migração `MIGRACAO_BIBLIOTECA_VISUAL_5_4.sql` **já foi aplicada** ao projeto Supabase GBR Racing Control na preparação deste pacote. Não é preciso executá-la novamente. Estruturas confirmadas após migração:

- `public.gbr_card_images`, com RLS ativado e acesso de leitura limitado a integrantes e gravação limitada a administradores da academia;
- bucket `gbr-card-art` com fotos públicas, limite 1,5 MiB por arquivo e envio protegido por RLS.

As imagens publicadas têm **endereço público**; não envie fotografias privadas ou informações pessoais ao bucket.

## Publicação Cloudflare Pages

1. Faça backup da versão atual e publique o ZIP inteiro no projeto `gbr-racing-lab` na branch `main` usando o fluxo habitual.
2. Confirme que o deployment está `success`.
3. Entre com a conta de administrador em https://gbr-racing-lab.pages.dev e abra `Garagem > Abrir Biblioteca Visual da Academia`, ou entre diretamente em https://gbr-racing-lab.pages.dev/auditoria-imagens.html após autenticar-se.
4. Envie uma foto de teste para uma carta, verifique o status de publicação e confira a miniatura em Pistas, Duelos e Eventos.
5. Valide em outro dispositivo/conta autenticada: a mesma imagem deve aparecer sem republicar o aplicativo. Se necessário, atualize a página.

### Como aproveitar os registros 5.3

No iPhone que guardou o cadastro anterior, abra a Biblioteca Visual 5.4. Se houver imagens locais, use **Enviar URLs locais para a nuvem**. As imagens existentes no Supabase não serão substituídas por esse processo.

## Cuidados e limitações

- Não existem credenciais de serviço no frontend; somente chave pública do Supabase.
- Um administrador é determinado pela estrutura já existente `academy_admins` / `am_i_academy_admin()`; usuários comuns não podem publicar.
- O frontend foi testado localmente. **Não houve validação completa no Safari físico, com usuário autenticado, nem teste fim-a-fim de upload com foto real.**
- A versão 5.4 **não foi publicada no Cloudflare** durante a preparação deste ZIP.
- O script SQL é um registro da migração aplicada, não um convite para executá-la novamente.
- Referências de terceiros devem ser usadas somente com permissão.

## Verificações realizadas

- JavaScript (`node --check`) validado para `card-art.js`, `auditoria-imagens.js`, `cloud.js` e `_worker.js`.
- Renderização local Chromium com viewport de 390 px e 1440 px: 123 entradas, sem rolagem horizontal e sem erros de JS.
- Worker embutido entrega `index.html`, `auditoria-imagens.html`, `auditoria-imagens.js`, `card-art.js` e demais arquivos byte a byte; rota desconhecida retorna 404.
- Supabase: tabela com RLS ligada e bucket criado; nenhum dado de garagem alterado.
