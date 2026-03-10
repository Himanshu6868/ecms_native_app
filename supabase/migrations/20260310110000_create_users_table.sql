create extension if not exists pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
    CREATE TYPE role_enum AS ENUM ('admin', 'manager', 'agent', 'user');
  END IF;
END
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role role_enum not null default 'user',
  area_id uuid,
  otp_hash text,
  otp_expires_at timestamptz,
  otp_retry_count int4 not null default 0,
  otp_verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  reports_to uuid,
  constraint users_reports_to_fkey
    foreign key (reports_to)
    references public.users(id)
    on delete set null
);

create index if not exists users_email_idx on public.users(email);
create index if not exists users_area_id_idx on public.users(area_id);
create index if not exists users_reports_to_idx on public.users(reports_to);
