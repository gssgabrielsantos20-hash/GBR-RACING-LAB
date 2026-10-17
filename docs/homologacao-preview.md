# Preview isolado — GBR Racing LAB

Projeto Cloudflare: `gbr-racing-lab-homologacao` (independente de `gbr-racing-lab`, o site oficial). Endereço reservado: `https://gbr-racing-lab-homologacao.pages.dev`.

## Isolamento validado

- GitHub branch: `staging/app-preview-20261016`; produção permanece no `main`.
- `config.js` conecta apenas ao Supabase **homologação** `oageqjzrzalkpyujfyzj` usando uma chave **publicável**.
- `index.html` apresenta faixa amarela **AMBIENTE DE TESTES — DADOS FICTÍCIOS** e metatag `noindex`.
- `.github/workflows/staging-pages-package.yml` verifica destino da API e marcador visual, depois empacota os arquivos estáticos em artefato ZIP. Sem copiar credenciais privadas ou dados de produção.
- Nenhuma alteração no banco ou deploy oficial do Cloudflare ocorreu.

## Resultado de execução

- GitHub Actions run [38990932518](https://github.com/gssgabrielsantos20-hash/GBR-RACING-LAB/actions/runs/38990932518): **SUCCESS**; artefato `GBR-RACING-LAB-HOMOLOGACAO-ARQUIVOS` (aproximadamente 8 MB), válido por 14 dias.
- Cloudflare Pages: projeto separado criado, mas **deploy ainda não executado**. Git integration rejeitou com o erro Cloudflare `8000011` (problema interno da instalação GitHub) e a conexão Git deve ser reparada no painel para automatização.
- O projeto foi criado para **Direct Upload**; o arquivo ZIP de artefato já contém os arquivos do site na raiz.
- **Sem testes E2E em URL pública** enquanto não houver deployment.
- A configuração de URLs permitidas de redirecionamento para Supabase Auth de homologação permanece **não verificada**. Antes de testar cadastro/recuperação, deve-se validar o redirecionamento do domínio novo no painel Supabase.

## Publicação pela interface (um upload, sem SQL)

1. Acesse [o pacote em GitHub Actions](https://github.com/gssgabrielsantos20-hash/GBR-RACING-LAB/actions/runs/38990932518), seção **Artifacts**.
2. Baixe `GBR-RACING-LAB-HOMOLOGACAO-ARQUIVOS` (ZIP, os arquivos do site estão na raiz desse ZIP).
3. No Cloudflare, abra **Workers & Pages → gbr-racing-lab-homologacao → Create deployment / Upload assets**. Escolha o ZIP e publique no ambiente de **produção desse projeto de HOMOLOGAÇÃO**, não em `gbr-racing-lab`.
4. Abra `https://gbr-racing-lab-homologacao.pages.dev`, verifique faixa de testes, a rede chamando apenas `oageqjzrzalkpyujfyzj.supabase.co`, e as rotas/elementos estáticos.
5. Não cadastre contas reais nem importe garagens do site oficial. Criar usuários fictícios e validar o acesso pelo Supabase Auth de testes posteriormente.

## Rollback

- Cloudflare: remover deployment do projeto `gbr-racing-lab-homologacao` (nunca do projeto `gbr-racing-lab`).
- GitHub: reverter somente a branch `staging/app-preview-20261016`; nunca substituir `main` pela configuração de homologação.
- A homologação é independente do Supabase oficial; a configuração pública não dá acesso a dados sem políticas e autenticação.

## Pendências

- Automação Cloudflare GitHub: bloqueada pelo conector Git.
- Publicação de URL: bloqueada até upload do ZIP.
- Testes reais no navegador / cadastro / Auth / Storage: **não executados**.
- Verificações de RLS SQL em staging foram realizadas em [PR #6](https://github.com/gssgabrielsantos20-hash/GBR-RACING-LAB/pull/6), não equivalem a teste E2E.

**Portão de escalabilidade:** simples projeto estático, sem mudar arquitetura nem custos estruturais. Não foi feita medição de carga.


## Verificação após primeiro upload — bloqueio detectado

**Atualização: implantação 16/10/2026 às 22h31 BRT.** Cloudflare Pages confirmou uma implantação ativa `success` no projeto separado `gbr-racing-lab-homologacao` (ID `e2a264f5-999d-4262-94ad-05443b845652`), mas a checagem do conteúdo servido via Cloudflare Browser Rendering **NÃO** correspondeu ao pacote de homologação:
- HTML de `/` sem o marcador visual `AMBIENTE DE TESTES` e sem `noindex,nofollow,noarchive`.
- **CRÍTICO:** `/config.js` do domínio de homologação contém a referência ao projeto Supabase oficial `gkjqfirlcmmlhuokszlz`, e **não** a `oageqjzrzalkpyujfyzj`.
- A configuração correta continua na branch `staging/app-preview-20261016`; o workflow seguro gerou artefato com sucesso em [run 38990932518](https://github.com/gssgabrielsantos20-hash/GBR-RACING-LAB/actions/runs/38990932518).
- A tentativa de remover somente o deployment incorreto foi bloqueada pelo Cloudflare: `8000034: You cannot delete the active production deployment` (note-se: "production" é a branch de produção **deste projeto isolado**, não a produção pública GBR).
- Acesso público ao preview ainda é **INSEGURO PARA TESTES**; não autenticar com conta real ali, não considerar homologação funcional concluída. Nenhuma mudança feita em Supabase oficial.

**Correção recomendada:** enviar uma **nova** implantação para o mesmo projeto Cloudflare `gbr-racing-lab-homologacao` utilizando especificamente o ZIP de artefato `GBR-RACING-LAB-HOMOLOGACAO-ARQUIVOS` gerado no run indicado (sem substituí-lo por ZIP da versão oficial). Após status success, repetir verificações HTTP de `/` (marcador/noindex) e `/config.js` (deve conter SOMENTE `oageqjzrzalkpyujfyzj`). Se falhar, interromper uso e não cadastrar usuários.

O site oficial Cloudflare continua com último deployment `0a7eab31-75a0-4af0-b9f8-fbf689b6b43f` e sem alterações por esta operação.
