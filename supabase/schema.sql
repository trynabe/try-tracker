-- Run once in your Supabase SQL Editor. Every record is scoped to auth.uid().
create table if not exists public.tracker_records (
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check (kind in ('habits','tasks','subjects','timeblocks','notes','focusSessions','profile')),
 id text not null check(length(id) between 1 and 200),
 payload jsonb not null check(jsonb_typeof(payload)='object'),
 revision integer not null default 1,
 updated_at timestamptz not null default now(),
 primary key(user_id,kind,id)
);
alter table public.tracker_records enable row level security;
drop policy if exists own_records on public.tracker_records;
create policy own_records on public.tracker_records for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
grant select,insert,update,delete on public.tracker_records to authenticated;
revoke all on public.tracker_records from anon;
-- The transaction rejects stale revisions instead of silently overwriting another device.
create or replace function public.tracker_commit(changes jsonb)
returns void language plpgsql security invoker set search_path=public as $$
declare c jsonb; affected integer; owner_id uuid:=auth.uid();
begin
 if owner_id is null then raise exception 'Not authenticated'; end if;
 if jsonb_typeof(changes)<>'array' or jsonb_array_length(changes)>1000 then raise exception 'Invalid changes'; end if;
 perform pg_advisory_xact_lock(hashtextextended(owner_id::text,0));
 for c in select * from jsonb_array_elements(changes) loop
  if coalesce((c->>'deleted')::boolean,false) then
   delete from tracker_records where user_id=owner_id and kind=c->>'kind' and id=c->>'id' and revision=(c->>'revision')::integer;
   get diagnostics affected=row_count;
   if affected<>1 then raise exception 'TRACKER_CONFLICT'; end if;
  elsif c->>'revision' is null then
   insert into tracker_records(user_id,kind,id,payload) values(owner_id,c->>'kind',c->>'id',c->'payload');
  else
   update tracker_records set payload=c->'payload',revision=revision+1,updated_at=now() where user_id=owner_id and kind=c->>'kind' and id=c->>'id' and revision=(c->>'revision')::integer;
   get diagnostics affected=row_count;
   if affected<>1 then raise exception 'TRACKER_CONFLICT'; end if;
  end if;
 end loop;
end $$;
-- Backup restore is atomic: either all new records are inserted, or none are changed.
create or replace function public.tracker_restore(records jsonb)
returns void language plpgsql security invoker set search_path=public as $$
declare owner_id uuid:=auth.uid();
begin
 if owner_id is null then raise exception 'Not authenticated'; end if;
 if jsonb_typeof(records)<>'array' or jsonb_array_length(records)>70000 then raise exception 'Invalid backup'; end if;
 perform pg_advisory_xact_lock(hashtextextended(owner_id::text,0));
 delete from tracker_records where user_id=owner_id;
 insert into tracker_records(user_id,kind,id,payload) select owner_id,r->>'kind',r->>'id',r->'payload' from jsonb_array_elements(records) r;
end $$;
revoke all on function public.tracker_commit(jsonb) from public;
revoke all on function public.tracker_restore(jsonb) from public;
grant execute on function public.tracker_commit(jsonb) to authenticated;
grant execute on function public.tracker_restore(jsonb) to authenticated;
