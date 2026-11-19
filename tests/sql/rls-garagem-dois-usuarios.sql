-- Teste de isolamento (RLS) com dois usuários reais — não grava nada (ROLLBACK no fim).
-- Rodar no SQL Editor do Supabase ou pelo conector. Resultado de 19/11/2026: 8/8 conforme esperado.
begin;
create temp table _rls_result(teste text, valor text) on commit drop;
grant insert, select on _rls_result to authenticated;
do $$
declare a uuid; b uuid;
begin
  select user_id into a from public.garage_states order by user_id limit 1;
  select user_id into b from public.garage_states where user_id<>a order by user_id limit 1;
  perform set_config('test.a', a::text, true); perform set_config('test.b', b::text, true);
end $$;
insert into _rls_result select 'privilégio authenticated em academy_admins (esperado false)', has_table_privilege('authenticated','public.academy_admins','select')::text;
insert into _rls_result select 'privilégio authenticated em academy_access_codes (esperado false)', has_table_privilege('authenticated','public.academy_access_codes','select')::text;
insert into _rls_result select 'privilégio anon em garage_states (esperado false)', has_table_privilege('anon','public.garage_states','select')::text;
insert into _rls_result select 'privilégio anon em gbr_card_images (esperado false)', has_table_privilege('anon','public.gbr_card_images','select')::text;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',current_setting('test.a'),'role','authenticated')::text, true);
insert into _rls_result select 'A vê garagens (esperado 1)', count(*)::text from public.garage_states;
insert into _rls_result select 'A vê garagem de B (esperado 0)', count(*)::text from public.garage_states where user_id=current_setting('test.b')::uuid;
with u as (update public.garage_states set revision=revision where user_id=current_setting('test.b')::uuid returning 1)
  insert into _rls_result select 'A altera garagem de B (esperado 0)', count(*)::text from u;
insert into _rls_result select 'A vê perfis (esperado 1)', count(*)::text from public.academy_profiles;
reset role;
select * from _rls_result;
rollback;
