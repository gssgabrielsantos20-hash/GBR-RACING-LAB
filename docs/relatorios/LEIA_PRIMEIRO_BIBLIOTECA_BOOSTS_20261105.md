# GBR Racing Lab — Biblioteca Visual de Boosts (PRÉVIA, 05/11/2026)

**ESTADO: código preparado e testado localmente. NÃO PUBLICADO.**

## Mudanças
- A Biblioteca Visual lista 11 boosts do catálogo GBR, com identificação pela chave `boosts|nome_normalizado||` já suportada por `GBRCardArt`.
- Usuários comuns veem fotos compartilhadas após sincronização; somente administradores têm ações de edição.
- Para publicar um boost individualmente, o administrador precisa declarar o direito de uso da imagem. Não há importação em lote desses itens.
- A seção de boosts em Pistas possui link para a Biblioteca Visual com filtro específico.
- Se não existe imagem cadastrada, aparece `Sem foto`; nenhum desenho de IA ou foto de terceiro foi acrescentado.

## Ordem obrigatória para ativação
1. Fazer backup/verificar restauração do banco e registrar o deployment do site em produção (não confiar apenas no ZIP como equivalente à produção).
2. Criar uma migração real no projeto Supabase, partindo de `docs/sql-review/PROPOSTA_gbr_card_images_boosts_20261105.sql`. **A consulta SQL é proposta, não foi aplicada**. Usar Supabase CLI no repositório/ambiente de homologação com versão instalada verificada.
3. Em homologação, revisar políticas e testar: anônimo não lista imagens protegidas nem faz upload; membro pode ler e não pode escrever; administrador pode gravar/editar/excluir imagem de boost; tipo estranho e pasta não autorizada são negados. Verificar autorização também em chamadas diretas, não só na UI.
4. Após aprovação separada, publicar **o pacote de implantação Cloudflare** e conferir visualmente no Safari/iPhone e navegador de PC.
5. Com autorização de uso de imagens reais, o administrador abre `auditoria-imagens.html?kind=boosts`, seleciona foto e confirma o direito de compartilhamento.
6. Verificar visualização da imagem pelo membro da academia na seção de boosts de Pistas e retorno `Sem foto` em falhas.

## Segurança/licenças
- As 59 URLs de imagem catalogadas do AllClash são **apenas referências**, sem licença de reutilização demonstrada. Nenhuma foi incorporada ao app.
- As imagens do bucket são públicas; só publique conteúdos autorizados e sem dados privados.
- A confirmação no navegador não substitui RLS/Storage e não prova titularidade.
- O SQL não contém alterações de RLS/grants; preserva políticas atuais e só amplia o tipo e a pasta admitida para upload administrativo.
- **Não executar a proposta SQL diretamente em produção** sem homologação e plano de rollback demonstrado.

## Rollback
- Voltar ao pacote anterior `GBR_LAB_6_BOOSTS_REAIS_DEPLOY_05NOV2026.zip` no Cloudflare (com aprovação).
- Para banco, `docs/sql-review/ROLLBACK_gbr_card_images_boosts_20261105.sql` — script não executado, aborta se houver registros/arquivos de boosts para evitar perda de dados.
- Nenhuma migração de dados de garagem/contas é parte deste pacote.

## Limitações
- Ainda não há fotos reais dos boosts disponibilizadas pelo usuário ou autorizadas para uso; esta atualização prepara o cadastro, não preenche as 11 imagens.
- A migração/autorizações, testes negativos de RLS/Storage e testes reais de iPhone/PC/produção **continuam pendentes**.
- A configuração de produção não foi alterada nesta entrega.


> **SUPERSEDIDO EM 09/11/2026:** consulte `LEIA_PRIMEIRO_BOOSTS_VISUAL_20261109.md`. A migração Supabase foi aplicada e validada; o catálogo visual foi ampliado para 65 nomes. O estado atual do banco tem 1 registro de imagem de boost (Ballast).