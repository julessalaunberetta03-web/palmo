-- Base de données de Palmo : chaque ligne et chaque fichier n'est accessible qu'à son propriétaire.

create table if not exists public.docs (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  path text not null,
  collection text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, path)
);
create index if not exists docs_collection_idx on public.docs (user_id, collection);

alter table public.docs enable row level security;

revoke all on public.docs from anon;
grant select, insert, update, delete on public.docs to authenticated;

drop policy if exists "docs_select_own" on public.docs;
drop policy if exists "docs_insert_own" on public.docs;
drop policy if exists "docs_update_own" on public.docs;
drop policy if exists "docs_delete_own" on public.docs;
create policy "docs_select_own" on public.docs for select to authenticated using (user_id = auth.uid());
create policy "docs_insert_own" on public.docs for insert to authenticated with check (user_id = auth.uid());
create policy "docs_update_own" on public.docs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "docs_delete_own" on public.docs for delete to authenticated using (user_id = auth.uid());

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'docs') then
    alter publication supabase_realtime add table public.docs;
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('justificatifs', 'justificatifs', false, 20971520, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "files_select_own" on storage.objects;
drop policy if exists "files_insert_own" on storage.objects;
drop policy if exists "files_delete_own" on storage.objects;
create policy "files_select_own" on storage.objects for select to authenticated using (bucket_id = 'justificatifs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "files_insert_own" on storage.objects for insert to authenticated with check (bucket_id = 'justificatifs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "files_delete_own" on storage.objects for delete to authenticated using (bucket_id = 'justificatifs' and (storage.foldername(name))[1] = auth.uid()::text);
