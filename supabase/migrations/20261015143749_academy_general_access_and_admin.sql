-- Exportada de supabase_migrations.schema_migrations em 19/11/2026.
-- SEGURANÇA: o código de acesso real foi substituído por <CODIGO_DE_ACESSO_REDIGIDO>.
-- Nunca versionar códigos de convite: o repositório é público.
create table if not exists public.academy_access_codes (
 id integer primary key default 1 check (id=1),
 code text not null,
 updated_at timestamptz not null default now()
);
alter table public.academy_access_codes enable row level security;
revoke all on public.academy_access_codes from anon,authenticated;
insert into public.academy_access_codes(id,code) values (1,'<CODIGO_DE_ACESSO_REDIGIDO>') on conflict(id) do update set code=excluded.code,updated_at=now();
alter table public.academy_members alter column team_id drop not null;
create table if not exists public.academy_admins (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.academy_admins enable row level security;
revoke all on public.academy_admins from anon,authenticated;
create table if not exists public.academy_team_changes (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 previous_team_id uuid references public.academy_teams(id),
 new_team_id uuid references public.academy_teams(id),
 changed_by uuid not null references auth.users(id),
 changed_at timestamptz not null default now()
);
alter table public.academy_team_changes enable row level security;
revoke all on public.academy_team_changes from anon,authenticated;
create or replace function public.join_academy(p_code text,p_nickname text)
returns table(team_id uuid,team_name text)
language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid:=auth.uid();v_nick text:=btrim(p_nickname);v_expected text;
begin
 if v_uid is null then raise exception 'Entre na sua conta primeiro.';end if;
 if v_nick is null or char_length(v_nick)<2 or char_length(v_nick)>40 then raise exception 'Informe seu nome de jogador no F1 Clash (2 a 40 caracteres).';end if;
 select code into v_expected from public.academy_access_codes where id=1;
 if v_expected is null or upper(btrim(p_code))<>v_expected then raise exception 'Código da academia inválido.';end if;
 insert into public.academy_members(user_id,team_id) values(v_uid,null) on conflict(user_id) do nothing;
 insert into public.academy_profiles(user_id,nickname) values(v_uid,v_nick)
 on conflict(user_id) do update set nickname=excluded.nickname,updated_at=now();
 return query select m.team_id,t.name from public.academy_members m left join public.academy_teams t on t.id=m.team_id where m.user_id=v_uid;
end $$;
revoke all on function public.join_academy(text,text) from public;
grant execute on function public.join_academy(text,text) to authenticated;
revoke all on function public.join_academy_team(text) from public,anon,authenticated;
create or replace function public.admin_move_player(p_user_id uuid,p_team_id uuid)
returns void language plpgsql security definer set search_path=''
as $$
declare v_old uuid;
begin
 if auth.uid() is null or not exists(select 1 from public.academy_admins where user_id=auth.uid()) then raise exception 'Somente o administrador pode alterar equipes.';end if;
 if p_team_id is not null and not exists(select 1 from public.academy_teams where id=p_team_id) then raise exception 'Equipe inexistente.';end if;
 select team_id into v_old from public.academy_members where user_id=p_user_id for update;
 if not found then raise exception 'Jogador não encontrado.';end if;
 if v_old is distinct from p_team_id then
 update public.academy_members set team_id=p_team_id where user_id=p_user_id;
 insert into public.academy_team_changes(user_id,previous_team_id,new_team_id,changed_by) values(p_user_id,v_old,p_team_id,auth.uid());
 end if;
end $$;
revoke all on function public.admin_move_player(uuid,uuid) from public;
grant execute on function public.admin_move_player(uuid,uuid) to authenticated;
create or replace function public.admin_list_players()
returns table(user_id uuid,nickname text,team_id uuid,team_name text)
language plpgsql security definer set search_path=''
as $$
begin
 if auth.uid() is null or not exists(select 1 from public.academy_admins where academy_admins.user_id=auth.uid()) then raise exception 'Acesso restrito ao administrador.';end if;
 return query select m.user_id,p.nickname,m.team_id,t.name from public.academy_members m
 left join public.academy_profiles p on p.user_id=m.user_id
 left join public.academy_teams t on t.id=m.team_id order by p.nickname nulls last;
end $$;
revoke all on function public.admin_list_players() from public;
grant execute on function public.admin_list_players() to authenticated;
create or replace function public.am_i_academy_admin()
returns boolean language sql security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.academy_admins where user_id=auth.uid())
$$;
revoke all on function public.am_i_academy_admin() from public;
grant execute on function public.am_i_academy_admin() to authenticated;
