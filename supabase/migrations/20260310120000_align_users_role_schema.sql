alter table public.users
  add column if not exists area text;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
    ALTER TYPE role_enum RENAME TO role_enum_old;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
    CREATE TYPE role_enum AS ENUM ('customer', 'internal', 'admin');
  END IF;
END
$$;

alter table public.users
  alter column role drop default,
  alter column role type role_enum
  using (
    case
      when role::text in ('admin') then 'admin'::role_enum
      when role::text in ('manager', 'agent') then 'internal'::role_enum
      else 'customer'::role_enum
    end
  ),
  alter column role set default 'customer';
