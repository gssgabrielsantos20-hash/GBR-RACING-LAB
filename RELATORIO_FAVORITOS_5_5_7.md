# Relatório técnico — Meus Setups (5.5.7)

## 1. Diagnóstico

- O Montador já salva entradas no array `db.saved` em `app.js` e `builder-plus.js` e sincroniza a garagem pelo módulo `cloud.js`.
- O histórico atual usa IDs de peças/pilotos; ao remover/alterar uma carta, o registro original pode perder referências ou atualizar atributos retrospectivamente.
- As restrições de série pertencem ao Montador calculado. O pedido exige composições livres entre séries e registros de setups que funcionaram.

## 2. Decisão

Implementar `favoriteSetups` como propriedade independente no JSON da garagem individual, limitada a **8 entradas**, sem criar tabela ou tela de administração compartilhada.

**Portão de escalabilidade: OK / atenção.** Até oito composições com cópias pequenas dos atributos têm custo e tamanho constantes por usuário. Não há requisições adicionais, credenciais ou permissões novas. Sincronização existente usa controle de revisão otimista e rascunho local, mas exige confirmação visual no dispositivo real.

## 3. Fontes consultadas

1. Protocolo AppSec separado: **não disponível nos arquivos anexados pesquisados**. Não foi possível conferir o texto integral. Nenhuma nova regra de autorização foi implantada; foram mantidas as políticas já existentes.
2. `arquiteto-de-software.txt`, *Regras de conduta*, *Portão de Escalabilidade*, *frontend e mobile*, *rollback*: mudança pequena, reversível, sem novo banco.
3. `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`, *Regra principal*, *identificação da causa*, *testes*: reutilização do fluxo real da garagem e separação do novo módulo.
4. `persona-planejadora.txt`, *Limites de Atuação* e *Stop Conditions*: sem alteração de regras de outros módulos e sem publicação automática.

**Manuais complementares de projeto/testes citados em `persona-planejadora.txt`**: não identificados sob esses nomes no conjunto de arquivos acessível. Testes novos foram criados e executados, mas não equivalem à validação exigida por manuais indisponíveis.

## 4. Arquivos

- `app.js`: `init()`, `migrateGaragem()`, `tab()`, `renderDashboard()` e nomes da navegação; propriedade `favoriteSetups` e menu.
- `index.html`: rota visual `section#favorites`, opção no menu desktop e em Mais do iPhone, links para scripts/estilos.
- `favorites-model.js` (novo): regras e snapshots, limite de oito, seis peças, bateria opcional, dois pilotos únicos e conferência de propriedade `owned`.
- `favorites.js` (novo): cartões, consulta, criação, edição, exclusão, exportação PNG e sincronização via `F1Session.scheduleSave()`; limpa o editor ao trocar de conta.
- `favorites.css` (novo): layout responsivo.
- `mobile-premium.js`: reconhecimento do menu como ferramenta em Mais e conteúdo de Ajuda.
- `_worker.js`: incorpora os novos recursos mantendo a rotina HTTP original.
- `tests/favorites-model.test.js` (novo): testes de lógica executáveis com Node.

## 5. Segurança, privacidade e riscos

- `garage_states` mantém políticas de leitura, INSERT e UPDATE vinculadas ao `auth.uid()` e à associação à academia (consulta SQL efetuada em 16/10/2026).
- Validação do limite, dos IDs, das categorias e de dois pilotos diferentes no modelo frontend; apenas cartas marcadas como `owned` podem iniciar novos favoritos.
- Campos de texto escapados no HTML e URLs de imagem gerenciadas pelo componente visual existente.
- Os dados salvos são snapshots independentes das cartas da garagem, para proteção contra alterações posteriores.
- Validação exclusiva no banco de `favoriteSetups` ainda não implementada; requer avaliação AppSec e migração aprovada para impor limite contra clientes adulterados.
- **Nenhuma alteração em RLS/auth/banco**. Demonstração local não sincroniza.

## 6. Testes

- `node --check` nos scripts editados/novos: aprovado.
- 13 testes de domínio com Node: aprovado (séries mistas, snapshots, cartas não possuídas, duplicação de pilotos, bateria opcional, limite oito, integridade, nomes e observações).
- 14 verificações da interface em navegador automatizado isolado: aprovado (CRUD, exportador via chamada, contagem, histórico legado, preservação de rascunho durante refresh, limpeza de edição ao mudar de conta).
- Navegação real de Mais → Meus setups em app montado em `page.set_content`: confirmado em Chromium (simulação; sem sessão autenticada).
- Teste integral com sessão Supabase, sincronização real entre iPhone/PC, Safari físico e exportação final do arquivo PNG: **não verificado**.
- Confirmação de integridade do ZIP, bytes do Worker e preservação de arquivos críticos: consultar `TESTES_FAVORITOS_5_5_7.json` após geração.

## 7. Implantação e rollback

1. Fazer backup do deployment 5.5.6 e de uma garagem de teste.
2. Testar a versão 5.5.7 primeiro na prévia do Cloudflare, sem publicar em `main`.
3. Em conta de teste, criar 8 favoritos, provar bloqueio do 9º, editar/excluir, reabrir em outro dispositivo e comparar atributos.
4. Conferir 24 pistas, Montador anterior e histórico `saved`, Duelos, Baús, Equipes, avisos, fotos e login.
5. Após homologação e aprovação, publicar na `main`. Depois, registrar nota 5.5.7 na Central de Avisos.
6. Rollback: reimplantar o ZIP da versão 5.5.6. Registros `favoriteSetups` permanecem no JSON da garagem se clientes anteriores preservarem propriedades desconhecidas; não são removidos deliberadamente.

**Status:** preparação local. Não houve publicação, alteração de banco ou teste real autenticado nesta etapa.
