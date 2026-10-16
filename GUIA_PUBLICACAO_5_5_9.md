# Implantação oficial — GBR Racing Lab 5.5.9

**Estado anterior verificado:** produção no Cloudflare Pages com manifesto 5.5.8, em 16/10/2026, branch `main`.

## Preparar
1. Use somente o arquivo `GBR_Racing_Lab_5_5_9_PREPARADO_PUBLICACAO.zip` fornecido nesta entrega. Os arquivos `index.html` e `_worker.js` estão **na raiz** do ZIP.
2. Faça backup, se aplicável, do ZIP da última versão aprovada (5.5.8). A troca de versão no Cloudflare não modifica o Supabase.
3. Para validar primeiro em preview, use uma branch diferente da produção (ex.: `teste_5_5_9`), quando o painel oferecer essa opção.

## Publicar
1. Entre no Cloudflare Dashboard → Workers & Pages → `gbr-racing-lab`.
2. Use **Create deployment** → Direct Upload → selecione o ZIP preparado.
3. Se estiver satisfeito com o preview, selecione a branch **`main`** para publicar a versão oficial.
4. Aguarde status `Success` e confira que o deployment contém `/MANIFEST_SHA256_5_5_9.json` e `/NOTAS_VERSAO_5_5_9.md`.

## Validar no iPhone
1. Abra `https://gbr-racing-lab.pages.dev` no Safari, preferencialmente em aba nova.
2. Entre em **Mais → Meus setups**.
3. Confirme 8 slots visíveis, carros/peças/pilotos, atributos e ações editar/exportar/duplicar/excluir.
4. Faça um teste na demonstração local antes de usar a garagem real; não substitua os dados reais por um backup de teste.
5. Confira **Minha garagem → Seus setups salvos**, que mostra até 6 recentes.
6. Confirme navegação de Duelos, Pistas, Equipes, Avisos e Biblioteca Visual.

## Rollback
No Cloudflare, reimplante o ZIP validado da versão **5.5.8** na branch `main`. A nova interface foi criada sem migração de banco. Setups criados depois do rollback podem permanecer no estado do usuário porque o schema de favoritos não mudou.

## Estado de testes
Aprovados testes unitários de modelo, vitrine e interações em Chromium isolado nas larguras de 390px e 1200px. Não é homologação do Safari real nem do login autenticado no ambiente de preview.
