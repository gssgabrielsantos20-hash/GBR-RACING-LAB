-- Exportada de supabase_migrations.schema_migrations em 19/11/2026.
revoke execute on function public.admin_list_players() from public, anon;
revoke execute on function public.admin_move_player(uuid,uuid) from public, anon;
revoke execute on function public.am_i_academy_admin() from public, anon;
revoke execute on function public.join_academy(text,text) from public, anon;
grant execute on function public.admin_list_players() to authenticated;
grant execute on function public.admin_move_player(uuid,uuid) to authenticated;
grant execute on function public.am_i_academy_admin() to authenticated;
grant execute on function public.join_academy(text,text) to authenticated;
