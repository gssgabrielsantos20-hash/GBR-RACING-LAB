# Protocolo de auditoria e segurança AppSec — GBR Racing Lab

> **STATUS: APROVADO PELO RESPONSÁVEL EM 16/10/2026 — DIRETRIZ OFICIAL DO PROJETO.** Aprovação documental; não implica controles já implementados ou liberação automática para mudanças em produção.  
> Base: três fontes disponíveis (`arquiteto-de-software.txt`, `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`, `persona-planejadora.txt`), repositório GitHub `gssgabrielsantos20-hash/GBR-RACING-LAB` (commit `e82562b`), diagnóstico Fase A de 16/10/2026, metadados read-only do Supabase/Cloudflare.  
> **Proveniência:** documento elaborado a partir das fontes indicadas e aprovado expressamente em 16/10/2026. Não é transcrição de protocolo AppSec preexistente; requisitos técnicos são diretrizes, não evidência de implementação.

## 1. Objetivo e princípios

Manter segurança de contas, garagens, imagens e recursos administrativos durante evolução do produto. Segurança e evidência prevalecem sobre rapidez; privilégios mínimos, negação por padrão, segregação de responsabilidades e LGPD.

**Fase A (obrigatória e sem alterações):** inventariar código, arquitetura, superfície externa e configuração, demonstrar achados por evidências verificáveis e classificá-los em crítico/alto/médio/baixo/informativo. Não executar DDL, mudanças de senha, permissões, deploy, exclusões ou testes intrusivos na produção.

**Fase B (somente após aprovação explícita):** corrigir um único achado de cada vez, preferencialmente em ambiente isolado, com baseline, teste, rollback e confirmação pós-mudança. Não considerar um achado resolvido sem prova.

## 2. Inventário do sistema verificado (não garante funcionamento completo)

- UI/PWA em HTML, CSS e JavaScript servido por Cloudflare Pages; aplicação sob `GBR_Racing_Lab_5_5_5_HILL_CORRIGIDO_VALIDADO/` no GitHub.
- Autenticação do usuário pela biblioteca cliente Supabase no `cloud.js`; dados individuais de garagem em `public.garage_states` e políticas de propriedade com `auth.uid()` verificadas em 16/10/2026.
- Biblioteca visual em `card-art.js`, `auditoria-imagens.js`, tabela `public.gbr_card_images` e bucket público `gbr-card-art`. A URL das imagens é pública; não armazenar dados privados nesse bucket.
- Equipes/academia: RPCs e tabelas `academy_*`; comunicações em `academy_announcements`; dados de configuração locais em `config.js`, que deve conter somente credenciais publicáveis.
- A fonte real de produção é deployment ad hoc do Pages; equivalência exata entre deploy e commit **não verificada**.

## 3. Controles mínimos obrigatórios (critérios de aceite, não prova de implementação)

### 3.1 Autenticação, autorização e segregação
- Autenticação e autorização são distintas. Validar identidade e autorização para a operação **no servidor**, não somente pela visibilidade de botões.
- Em `garage_states`, `user_id` da linha deve coincidir com `auth.uid()` em SELECT, INSERT e UPDATE, com RLS ligado e política própria; uma garagem jamais pode ser lida/alterada por outra conta.
- Políticas de academia e administração devem validar filiação, permissão efetiva e escopo de operação. Cobrir IDOR/BOLA com testes negativos; negar usuários anon/não membro/usuário comum no endpoint administrativo.
- Preservar RLS, não usar `service_role`/segredos no frontend, não criar `SECURITY DEFINER` para contornar falhas. Para rotinas privilegiadas necessárias, auditar grants `EXECUTE`, função, `search_path`, validações e dependências.
- Toda alteração de equipe ou publicação administrativa deve ter autorização verificada no banco/servidor e trilha de auditoria proporcional ao risco.

### 3.2 Entrada, saída, uploads e conteúdo externo
- Validar dados de usuário e parâmetros em fronteiras do servidor; não confiar em dados do navegador, planilhas, documentos, imagens, IA ou URLs externas.
- Tratar XSS (escapar texto, evitar HTML arbitrário), injeção SQL (queries parametrizadas), CSRF em fluxos aplicáveis, path traversal, uploads maliciosos, conteúdo remoto e abuso de API.
- Upload de imagens: verificar MIME/tipo, tamanho, autorização, caminho controlado, formato permitido e ausência de arquivos sensíveis; não confiar apenas na validação do JS.
- URLs públicas só com HTTPS validado. Consentimento/direitos sobre imagens de terceiros devem ser respeitados.

### 3.3 Sessões, segredos, logging e LGPD
- Preservar fluxos de cadastro, confirmação, login, recuperação, expiração e logout. Não imprimir tokens, senhas, códigos de convites, dados de garagem ou dados pessoais em logs.
- Segredos somente em configuração protegida. Chave publicável não é autorização; políticas e funções de servidor devem aplicar restrições.
- Tratar minimização de dados, finalidade, retenção, exclusão, backup, recuperação e autorização de acesso. Testar restauração de backup antes de depender dela.

### 3.4 Disponibilidade, escala e terceiros
- Limitar consultas, downloads e tentativas de acesso, respeitando 10x de carga e políticas por usuário. Avaliar índices, paginação, cache particionado por identidade, rate limits, timeout, retry limitado e custos.
- Não otimizar sem métricas; não destruir funcionalidades em nome de segurança. Preferir correções reversíveis e monitoradas.

## 4. Achados de referência que exigem investigação (Fase A, NÃO declarar vulnerabilidade explorada)

| Item | Evidência 16/10/2026 | Risco preliminar | Próximo teste permitido na Fase A |
|---|---|---|---|
| RPCs `SECURITY DEFINER` executáveis por `anon` | Advisors Supabase apontaram `admin_list_players`, `admin_move_player`, `am_i_academy_admin`, `join_academy`; trecho das funções mostrou `auth.uid()` | **Atenção/alto potencial**, exploração não confirmada | Revisão integral das funções, grants e testes negativos em ambiente autorizado após plano aprovado |
| Proteção contra senhas vazadas desativada | Advisor `auth_leaked_password_protection` | **Médio** | Analisar impacto em cadastro/recuperação e configuração disponível |
| Quatro tabelas com RLS e sem política | Advisor `rls_enabled_no_policy` em `academy_access_codes`, `academy_admins`, `academy_team_changes`, `academy_team_invites` | **Informativo**, potencial negação por padrão | Verificar desenho intencional e privilégios indiretos das funções |
| Dados da biblioteca visual servidos por bucket público | Migração SQL `MIGRACAO_BIBLIOTECA_VISUAL_5_4.sql` | **Dependente do conteúdo** | Validar restrição de upload e proibição de dados privados |
| Camada de autorização independente do banco | Não verificada no domínio completo | **Atenção arquitetural** | Inspecionar regras antes de propor adapters/serviços |

Referências: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable ; https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy ; https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection .

## 5. Relatório padrão de achado

- ID, título, escopo e severidade fundamentada.
- Evidência: arquivo:linha, função, policy/DDL, configuração ou teste; **não verificado** quando ausente.
- Ator afetado, pré-condições, impacto, probabilidade, limitação e risco residual.
- Alternativas, decisão recomendada, dependências, regressões prováveis, teste antes/depois, rollback.
- Aprovação necessária, responsável, data, resultado e status final.

## 6. Critérios obrigatórios antes de qualquer execução

1. Documentos técnicos aprovados; hipótese sustentada por análise real.
2. Backups e meios de restauração disponíveis **e comprovados** quando houver risco sobre dados.
3. Cenários de conta anônima, comum e administradora definidos em ambiente de testes.
4. Diff mínimo, comportamento esperado, teste automatizado/manual e rollback.
5. Ação limitada ao que foi aprovado. Produção requer aprovação específica e conferência pós-deploy.

## 7. Pendências de aprovação

Definir formalmente níveis de severidade, limites aceitáveis de indisponibilidade, critérios de LGPD/retenção, controle de segredos e quem autoriza ajustes de produção. Não inventar valores de SLO nem prazos de retenção.