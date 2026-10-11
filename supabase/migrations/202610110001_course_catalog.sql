-- Shared course names, independent from users' private calendar events.
-- Safe to run again in the Supabase SQL Editor for an existing project.
begin;
create table if not exists public.course_catalog (
 code text primary key check (code ~ '^[A-Z]{2,8}[0-9]{3}$'),
 name text not null check (length(btrim(name)) between 1 and 300)
);
alter table public.course_catalog enable row level security;
revoke all on table public.course_catalog from public, anon, authenticated;
grant select on table public.course_catalog to anon, authenticated;
drop policy if exists read_course_catalog on public.course_catalog;
create policy read_course_catalog on public.course_catalog
 for select to anon, authenticated using (true);

-- Names supplied in the user's MyCourses dashboard screenshot.
-- Keep any names an administrator has already edited in the database.
insert into public.course_catalog (code,name) values
 ('ITDS211','Computer Architecture and Operating Systems'),
 ('ITDS212','Computer System Lab'),
 ('ITDS231','Computer Networks'),
 ('ITDS232','Computer Network Lab'),
 ('ITDS241','Web Technologies and Applications'),
 ('ITDS242','Web Technologies Lab'),
 ('ITDS261','Introduction to Software Engineering'),
 ('ITDS262','Software Engineering Lab'),
 ('ITDS294','Fundamentals of Electronic Commerce Systems'),
 ('ITLG201','Reading Skills')
on conflict (code) do nothing;
commit;
