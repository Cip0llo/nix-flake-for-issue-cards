alter table public.workspaces
  add column if not exists indev_version text not null default '';

create or replace function public.remember_workspace_version()
returns trigger
language plpgsql
as $$
begin
  new.current_version := btrim(new.current_version);
  new.indev_version := btrim(new.indev_version);
  if new.current_version <> '' and not (new.current_version = any (new.versions)) then
    new.versions := array_append(new.versions, new.current_version);
  end if;
  if new.indev_version <> '' and not (new.indev_version = any (new.versions)) then
    new.versions := array_append(new.versions, new.indev_version);
  end if;
  return new;
end;
$$;
