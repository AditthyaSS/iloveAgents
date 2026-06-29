create table if not exists public.shared_outputs (
  id uuid primary key,
  agent_id text not null,
  agent_name text not null,
  inputs jsonb not null default '{}'::jsonb,
  output text not null,
  output_type text not null default 'markdown' check (output_type in ('markdown', 'text', 'json')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint shared_outputs_expiry_window check (
    expires_at > created_at and expires_at <= created_at + interval '7 days'
  )
);

alter table public.shared_outputs enable row level security;

create policy "Anyone can create seven-day shared outputs"
  on public.shared_outputs
  for insert
  to anon, authenticated
  with check (
    expires_at > now()
    and expires_at <= now() + interval '7 days'
    and char_length(output) <= 100000
  );

create policy "Anyone can read unexpired shared outputs"
  on public.shared_outputs
  for select
  to anon, authenticated
  using (expires_at > now());

create index if not exists shared_outputs_expires_at_idx
  on public.shared_outputs (expires_at);

comment on table public.shared_outputs is
  'Anonymous, read-only agent output shares. Expired rows may be deleted by a scheduled cleanup job.';
