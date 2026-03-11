create extension if not exists pgcrypto;

alter table if exists public.users
  add column if not exists id uuid,
  add column if not exists full_name text,
  add column if not exists avatar_url text,
  add column if not exists created_at timestamptz default now();

update public.users
set id = coalesce(id, gen_random_uuid())
where id is null;

alter table public.users
  alter column id set not null;

alter table public.users
  drop constraint if exists users_pkey;

alter table public.users
  add constraint users_pkey primary key (id);

alter table public.users
  drop constraint if exists users_id_fkey;

alter table public.users
  add constraint users_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;

alter table public.users
  alter column email type text,
  alter column email set not null;

update public.users
set email = lower(trim(email));

alter table public.users
  drop constraint if exists users_email_key;

create unique index if not exists users_email_unique_idx on public.users (email);

alter table public.users
  alter column role type text using role::text,
  alter column role set default 'customer';

update public.users
set role = case
  when role in ('internal') then 'internal_support'
  when role in ('customer', 'internal_support', 'admin', 'super_admin') then role
  else 'customer'
end;

alter table public.users
  drop constraint if exists users_role_valid_check;

alter table public.users
  add constraint users_role_valid_check
  check (role in ('customer', 'internal_support', 'admin', 'super_admin'));

alter table public.users
  drop column if exists name,
  drop column if exists area,
  drop column if exists area_id,
  drop column if exists otp_hash,
  drop column if exists otp_expires_at,
  drop column if exists otp_retry_count,
  drop column if exists otp_verified_at,
  drop column if exists deleted_at,
  drop column if exists reports_to;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url, role)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'customer'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = case when public.users.full_name is null or public.users.full_name = '' then excluded.full_name else public.users.full_name end,
      avatar_url = case when public.users.avatar_url is null or public.users.avatar_url = '' then excluded.avatar_url else public.users.avatar_url end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

insert into public.users (id, email, full_name, avatar_url, role)
select
  au.id,
  lower(au.email),
  coalesce(au.raw_user_meta_data->>'full_name', ''),
  coalesce(au.raw_user_meta_data->>'avatar_url', ''),
  'customer'
from auth.users au
where au.email is not null
on conflict (id) do nothing;

alter table public.users enable row level security;

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users for select
to authenticated
using (auth.uid() = id or exists (select 1 from public.users as me where me.id = auth.uid() and me.role in ('admin','super_admin')));

drop policy if exists "Only super_admin can update roles" on public.users;
create policy "Only super_admin can update roles"
on public.users for update
to authenticated
using (exists (select 1 from public.users as me where me.id = auth.uid() and me.role = 'super_admin'))
with check (role in ('customer', 'internal_support', 'admin', 'super_admin'));
