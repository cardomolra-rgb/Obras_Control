-- OBRA CONTROL: reforço de segurança (auditoria de 20/11/2026). Não apaga dados.
-- Aplicado no Neon (projeto snowy-cloud-31290192, branch production) após snapshot
-- "antes-auditoria-seguranca-2026-11-20".

-- 1) Trilha de auditoria no servidor: toda inclusão, alteração e exclusão nas tabelas
--    financeiras e de cadastro é registrada pelo próprio banco. O navegador só pode LER
--    a trilha (do próprio usuário); ninguém consegue editar ou apagar pelo app.
create table if not exists public.audit_trail (
  id bigint generated always as identity primary key,
  user_id text not null,
  actor text,
  table_name text not null,
  row_id text not null,
  op text not null check (op in ('INSERT','UPDATE','DELETE')),
  old_data jsonb,
  new_data jsonb,
  at timestamptz not null default now()
);
create index if not exists audit_trail_user_at_idx on public.audit_trail(user_id, at desc);
create index if not exists audit_trail_row_idx on public.audit_trail(table_name, row_id);
alter table public.audit_trail enable row level security;
drop policy if exists own_read on public.audit_trail;
create policy own_read on public.audit_trail for select to authenticated using ((select auth.user_id()) = user_id);
revoke all on public.audit_trail from public, anonymous, authenticated;
grant select on public.audit_trail to authenticated;

create or replace function public.trg_audit() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare r jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  if tg_op = 'UPDATE' and to_jsonb(old) - 'updated_at' = to_jsonb(new) - 'updated_at' then return new; end if;
  insert into public.audit_trail(user_id, actor, table_name, row_id, op, old_data, new_data)
  values (r->>'user_id', auth.user_id(), tg_table_name, coalesce(r->>'id', r->>'user_id'), tg_op,
          case when tg_op <> 'INSERT' then to_jsonb(old)->'data' end,
          case when tg_op <> 'DELETE' then to_jsonb(new)->'data' end);
  return case when tg_op = 'DELETE' then old else new end;
end $$;
revoke all on function public.trg_audit() from public, anonymous, authenticated;

-- 2) updated_at definido pelo servidor (o navegador não controla a data da alteração)
create or replace function public.trg_touch() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin new.updated_at := now(); return new; end $$;
revoke all on function public.trg_touch() from public, anonymous, authenticated;

do $$ declare t text;
begin
  foreach t in array array['clients','projects','expenses','receipts','project_events','project_documents','settings','bank_accounts','bank_transactions','finance_rules'] loop
    execute format('drop trigger if exists zz_audit on public.%I', t);
    execute format('create trigger zz_audit after insert or update or delete on public.%I for each row execute function public.trg_audit()', t);
    execute format('drop trigger if exists aa_touch on public.%I', t);
    execute format('create trigger aa_touch before update on public.%I for each row execute function public.trg_touch()', t);
    -- 3) integridade: "data" sempre objeto JSON e com tamanho limitado (256 kB)
    execute format('alter table public.%I drop constraint if exists data_is_object', t);
    execute format('alter table public.%I add constraint data_is_object check (jsonb_typeof(data) = ''object'' and pg_column_size(data) < 262144) not valid', t);
    execute format('alter table public.%I validate constraint data_is_object', t);
  end loop;
end $$;

-- 4) Histórico do app (audit_log): o histórico de uma obra continua existindo mesmo
--    se a obra for excluída (antes era apagado junto).
alter table public.audit_log drop constraint audit_log_project_id_fkey,
  add constraint audit_log_project_id_fkey foreign key (project_id) references public.projects(id) on delete set null;
alter table public.audit_log drop constraint if exists data_is_object;
alter table public.audit_log add constraint data_is_object check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 262144);

-- 5) Aplicado DEPOIS da publicação da versão que grava o histórico só por inserção:
-- revoke update, delete on public.audit_log from authenticated;
