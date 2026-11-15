-- OBRA CONTROL: esquema aplicado no Neon (projeto snowy-cloud-31290192, banco neondb).
-- Cada linha pertence ao usuário que a criou (user_id = auth.user_id()) e as políticas RLS
-- impedem ler ou gravar dados de outra conta. Despesas, recebimentos, eventos e documentos
-- exigem uma obra existente do mesmo usuário (project_id not null + verificação na política).

create table public.clients (id text primary key, user_id text not null default (auth.user_id()), data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table public.projects (id text primary key, user_id text not null default (auth.user_id()), client_id text references public.clients(id) on delete set null, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table public.expenses (id text primary key, user_id text not null default (auth.user_id()), project_id text not null references public.projects(id) on delete cascade, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table public.receipts (id text primary key, user_id text not null default (auth.user_id()), project_id text not null references public.projects(id) on delete cascade, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table public.project_events (id text primary key, user_id text not null default (auth.user_id()), project_id text not null references public.projects(id) on delete cascade, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table public.project_documents (id text primary key, user_id text not null default (auth.user_id()), project_id text not null references public.projects(id) on delete cascade, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table public.audit_log (id text primary key, user_id text not null default (auth.user_id()), project_id text references public.projects(id) on delete cascade, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table public.settings (user_id text primary key default (auth.user_id()), data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());

create index clients_user_idx on public.clients(user_id);
create index projects_user_idx on public.projects(user_id);
create index projects_client_idx on public.projects(client_id);
create index expenses_user_idx on public.expenses(user_id);
create index expenses_project_idx on public.expenses(project_id);
create index receipts_user_idx on public.receipts(user_id);
create index receipts_project_idx on public.receipts(project_id);
create index project_events_user_idx on public.project_events(user_id);
create index project_events_project_idx on public.project_events(project_id);
create index project_documents_user_idx on public.project_documents(user_id);
create index project_documents_project_idx on public.project_documents(project_id);
create index audit_log_user_idx on public.audit_log(user_id);
create index audit_log_project_idx on public.audit_log(project_id);

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.expenses enable row level security;
alter table public.receipts enable row level security;
alter table public.project_events enable row level security;
alter table public.project_documents enable row level security;
alter table public.audit_log enable row level security;
alter table public.settings enable row level security;

create policy own_rows on public.clients for all to authenticated using ((select auth.user_id()) = user_id) with check ((select auth.user_id()) = user_id);
create policy own_rows on public.settings for all to authenticated using ((select auth.user_id()) = user_id) with check ((select auth.user_id()) = user_id);
create policy own_rows on public.projects for all to authenticated using ((select auth.user_id()) = user_id) with check ((select auth.user_id()) = user_id and (client_id is null or exists (select 1 from public.clients c where c.id = client_id and c.user_id = (select auth.user_id()))));
create policy own_rows on public.expenses for all to authenticated using ((select auth.user_id()) = user_id) with check ((select auth.user_id()) = user_id and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.user_id())));
create policy own_rows on public.receipts for all to authenticated using ((select auth.user_id()) = user_id) with check ((select auth.user_id()) = user_id and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.user_id())));
create policy own_rows on public.project_events for all to authenticated using ((select auth.user_id()) = user_id) with check ((select auth.user_id()) = user_id and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.user_id())));
create policy own_rows on public.project_documents for all to authenticated using ((select auth.user_id()) = user_id) with check ((select auth.user_id()) = user_id and exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.user_id())));
create policy own_rows on public.audit_log for all to authenticated using ((select auth.user_id()) = user_id) with check ((select auth.user_id()) = user_id and (project_id is null or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.user_id()))));

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.clients, public.projects, public.expenses, public.receipts, public.project_events, public.project_documents, public.audit_log, public.settings to authenticated;

-- Link público de acompanhamento do cliente (sem login, sem valores financeiros)
alter table public.projects add column if not exists share_token text;
create unique index if not exists projects_share_token_key on public.projects(share_token) where share_token is not null;
-- public.client_view(p_token text) returns jsonb  (security definer; ver função no banco)
-- Devolve só dados de andamento, prazos, eventos, cliente (nome/documento) e empresa. Nunca valores.
revoke all on function public.client_view(text) from public;
grant usage on schema public to anonymous;
grant execute on function public.client_view(text) to anonymous, authenticated;
