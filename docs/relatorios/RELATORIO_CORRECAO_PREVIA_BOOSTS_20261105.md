# GBR LAB 6 — Correção do cadastro de fotos dos boosts (05/11/2026)

## Objetivo e diagnóstico

Captura recebida: cartão Warrior da Biblioteca Visual exibindo checkbox obrigatória de direito de uso, campo com URL AllClash e ícone neutro. Causa comprovada: em `auditoria-imagens.js`, `hasRightForBoost()` bloqueava `runSave()`/`runUpload()` sem a checkbox, e a interface não pré-visualizava o endereço digitado. A imagem visualizada no painel vem exclusivamente de `GBRCardArt.getSource()`; se a foto não foi salva nem compartilhada, é exibido o estado neutro. O endereço citado pode também falhar por bloqueio do host; não há confirmação de que ele forneça imagem carregável em outros domínios.

O Supabase oficial `gkjqfirlcmmlhuokszlz`, conferido em leitura em conversa anterior, tem `gbr_card_images.kind` limitado a `drivers`/`parts`, e a política `gbr_art_upload_admin` limita as pastas do Storage a `drivers/`/`parts/`. Essas restrições impedem hoje a publicação compartilhada dos boosts. Não executamos alterações de produção nem alteramos a proposta de migração em SQL.

## Fontes

- `engenheiro-de-segurança.txt`: preservar RLS/admin, tratar URLs como não confiáveis, nunca falsificar validação, rollback.
- `arquiteto-de-software.txt`: módulos pequenos, portão de escalabilidade e reversibilidade.
- `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`: inspecionar causa raiz, respeitar responsabilidade de cada arquivo.
- `persona-planejadora.txt`: limites de autorização e mudanças por etapa.
- `REGRAS-DE-ORIGINALIDADE.txt`: não copiar imagens de terceiros sem permissão.
- Documentos aprovados na Biblioteca em 16/10/2026: `01-protocolo-appsec.md`, `02-manual-projeto.md`, `03-desenvolvedor-senior.md`, `04-manual-de-testes.md`, `05-persona-testes.md`.
- Supabase [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control): políticas de INSERT com RLS para uploads; compartilhamento não se confunde com imagem local.

## Modificações locais

- `auditoria-imagens.js`, render/form: remove checkbox e `hasRightForBoost()`; adiciona prévia voluntária do link (`runPreview()` e `canDisplay()`) e distingue `runSave()` de `runPublish()` para boosts.
- `card-art.js`, `saveLocal()` e export: permite associar uma URL HTTPS carregável ao ID do boost somente no `localStorage`, mantendo `saveRemote()` e suas verificações de admin e RLS. Nada no banco/garagem é gravado por `saveLocal()`.
- `auditoria-imagens.html`: texto atualizado, prévia com `object-fit:contain` e referência a origem remota bloqueável; não solicita atestação por checkbox.
- `index.html` e `boosts-plus.js`: atualização de cache e explicação de imagem compartilhada/local.
- `tests/boost-library-20261105.test.js` e `tests/boost-library-preview-20261105.test.js`: validação de ausência de checkbox, fluxo de prévia e segurança de URLs locais.
- `docs/adr/0013-biblioteca-visual-boosts-20261105.md`: decisão revisada.
- `_worker.js` e os ZIPs: recursos reempacotados, sem tocar no restante do app.

## Limites conhecidos

- **Nenhuma fotografia do jogo foi cadastrada**. A prévia mostra a URL informada pelo administrador somente se o host permitir o carregamento; não há garantia de que endereços AllClash possam ser incorporados.
- A URL local não acompanha outros celulares ou contas. O cadastro compartilhado ainda depende de migração, teste negativo em ambiente seguro e aprovação específica de banco.
- A planilha Resource Sheet analisada anteriormente contém dados, sem fotos incorporadas.
- Não houve alteração de RLS, upload/storage, login, garagens ou deploy.

## Rollback

Para reverter interface, restaurar o ZIP prévio `GBR_LAB6_BIBLIOTECA_BOOSTS_COMPLETO_PREVIA.zip`; como a alteração é estática e não migra banco, não existe rollback SQL desta entrega. Valores de URL salvos localmente por esta versão não são migrados; permanecem no navegador até o administrador limpá-los. Produção requer nova aprovação após testes móveis e de conta.
