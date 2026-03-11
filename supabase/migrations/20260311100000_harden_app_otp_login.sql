alter table public.users
  alter column email type text,
  alter column email set not null;

update public.users set email = lower(trim(email));

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
    ALTER TABLE public.users
      ALTER COLUMN role TYPE text USING role::text;
    DROP TYPE role_enum;
  END IF;
END
$$;

alter table public.users
  alter column role type text,
  alter column role set default 'customer';

update public.users
set role = case
  when role in ('internal') then 'internal_support'
  when role in ('admin', 'super_admin', 'customer', 'internal_support') then role
  else 'customer'
end;

alter table public.users
  add constraint users_role_valid_check
  check (role in ('customer', 'internal_support', 'admin', 'super_admin'));

create unique index if not exists users_email_lower_unique_idx on public.users ((lower(email)));
