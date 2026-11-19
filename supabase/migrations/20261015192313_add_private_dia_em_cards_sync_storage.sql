-- Exportada de supabase_migrations.schema_migrations em 19/11/2026.
-- Observação: tabela de outro aplicativo (Dia em Cards) no mesmo projeto Supabase.
create table if not exists public.dia_em_cards_agendas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  entries jsonb not null default '[]'::jsonb,
  revision bigint not null default 1 check(revision > 0),
  updated_at timestamptz not null default now(),
  constraint dia_em_cards_entries_array check(jsonb_typeof(entries)='array')
);
alter table public.dia_em_cards_agendas enable row level security;
revoke all on public.dia_em_cards_agendas from anon;
grant select, insert, update on public.dia_em_cards_agendas to authenticated;
create policy "dia_em_cards_select_own" on public.dia_em_cards_agendas
 for select to authenticated using ((select auth.uid())=user_id);
create policy "dia_em_cards_insert_own" on public.dia_em_cards_agendas
 for insert to authenticated with check ((select auth.uid())=user_id);
create policy "dia_em_cards_update_own" on public.dia_em_cards_agendas
 for update to authenticated using ((select auth.uid())=user_id)
 with check ((select auth.uid())=user_id);
