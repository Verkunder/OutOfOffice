create extension if not exists pgcrypto;

create type public.post_visibility as enum ('private', 'public');
create type public.idea_status as enum ('todo', 'done');

create table public.admin_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1
    from public.admin_emails
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_seed_key text,
  title text not null,
  body text not null,
  mood text,
  location_name text,
  visited_at timestamptz not null default now(),
  visibility public.post_visibility not null default 'private',
  created_at timestamptz not null default now()
);

create unique index posts_user_seed_key_idx
on public.posts (user_id, client_seed_key)
where client_seed_key is not null;

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  address text,
  rating numeric(2, 1) check (rating is null or rating between 0 and 5),
  notes text,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status public.idea_status not null default 'todo',
  priority int not null default 2 check (priority between 1 and 3),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;
alter table public.photos enable row level security;
alter table public.places enable row level security;
alter table public.ideas enable row level security;
alter table public.admin_emails enable row level security;

revoke all on public.admin_emails from anon;
revoke insert, update, delete, truncate, references, trigger on public.admin_emails from authenticated;
grant select on public.admin_emails to authenticated;

create policy "Admins can read admin emails"
on public.admin_emails for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'));

create policy "Users can read own posts"
on public.posts for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read public posts"
on public.posts for select
to anon, authenticated
using (visibility = 'public');

create policy "Admins can create posts"
on public.posts for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update posts"
on public.posts for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete posts"
on public.posts for delete
to authenticated
using (public.is_admin());

create policy "Public can read photos for public posts"
on public.photos for select
to anon, authenticated
using (
  exists (
    select 1
    from public.posts
    where posts.id = photos.post_id
      and posts.visibility = 'public'
  )
);

create policy "Admins can manage photos"
on public.photos for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage places"
on public.places for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage ideas"
on public.ideas for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('trip-photos', 'trip-photos', true)
on conflict (id) do nothing;

create policy "Users can upload trip photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'trip-photos'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Users can update own trip photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'trip-photos'
  and (select auth.uid())::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'trip-photos'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Users can read trip photos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'trip-photos');
