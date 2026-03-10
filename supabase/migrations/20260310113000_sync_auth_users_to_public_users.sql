create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (name, email)
  values (
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(new.email, '@', 1), ''),
      'User'
    ),
    new.email
  )
  on conflict (email) do update
  set
    deleted_at = null,
    name = case
      when public.users.name is null or trim(public.users.name) = '' then excluded.name
      else public.users.name
    end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_auth_user_created();

insert into public.users (name, email)
select
  coalesce(
    nullif(trim(au.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(au.email, '@', 1), ''),
    'User'
  ) as name,
  au.email
from auth.users au
where au.email is not null
on conflict (email) do update
set
  deleted_at = null,
  name = case
    when public.users.name is null or trim(public.users.name) = '' then excluded.name
    else public.users.name
  end;
