-- Issue #3 / AppSec Fase B — P1: restringir invocação anônima
-- Aplicação ao Supabase de produção NÃO autorizada nesta entrega.
-- Pré-requisitos: homologação Supabase, evidências de testes, backup/rollback e aprovação de produção.
-- Fonte verificada: pg_get_functiondef e pg_proc.proacl em 16/10/2026.
-- Não altera corpo de função, tabelas, políticas RLS ou os privilégios de authenticated.

DO $preconditions$
DECLARE fn oid := to_regprocedure('public.admin_move_player(uuid,uuid)');
BEGIN
  IF fn IS NULL THEN
    RAISE EXCEPTION 'AppSec #3: assinatura public.admin_move_player(uuid,uuid) ausente';
  END IF;
  IF NOT (SELECT p.prosecdef FROM pg_proc p WHERE p.oid = fn) THEN
    RAISE EXCEPTION 'AppSec #3: contrato SECURITY DEFINER divergiu; revisar antes de aplicar';
  END IF;
  IF NOT has_function_privilege('authenticated', fn, 'EXECUTE') THEN
    RAISE EXCEPTION 'AppSec #3: authenticated sem EXECUTE antes da migração; revisão necessária';
  END IF;
END $preconditions$;

-- REVOKE intencionalmente restrito a uma assinatura e um papel.
REVOKE EXECUTE ON FUNCTION public.admin_move_player(uuid,uuid) FROM anon;

DO $postconditions$
BEGIN
  IF has_function_privilege('anon', 'public.admin_move_player(uuid,uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'AppSec #3: EXECUTE anônimo ainda permitido (verificar PUBLIC/herança)';
  END IF;
  IF NOT has_function_privilege('authenticated', 'public.admin_move_player(uuid,uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'AppSec #3: funcionalidade autenticada comprometida';
  END IF;
END $postconditions$;

-- ROLLBACK MANUAL, se aprovado e justificado:
-- GRANT EXECUTE ON FUNCTION public.admin_move_player(uuid,uuid) TO anon;
-- O rollback somente restaura o grant anterior, não altera o corpo da RPC.
