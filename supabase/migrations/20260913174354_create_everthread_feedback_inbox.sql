create table public.everthread_feedback_reports (
  id text primary key,
  schema_version integer not null check (schema_version = 1),
  product text not null check (product = 'Everthread: Life Unwritten'),
  status text not null default 'queued' check (status in ('queued','withdrawn')),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  received_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  withdrawal_reason text,
  interface_id text not null,
  interface_label text not null,
  action_id text not null,
  action_label text not null,
  kind text not null check (kind in ('technical','experience','suggestion')),
  category_id text not null,
  category_label text not null,
  description text not null check (char_length(description) between 8 and 2400),
  diagnostics jsonb,
  app_version text,
  source_commit text,
  save_version integer,
  cancellation_token_hash text not null check (char_length(cancellation_token_hash) = 64),
  triage_status text not null default 'new' check (triage_status in ('new','triaged','reproducing','fixing','regression_added','certified','resolved','unable_to_reproduce')),
  priority text check (priority is null or priority in ('low','normal','high','critical')),
  resolution_class text check (resolution_class is null or resolution_class in ('backend_defect','interface_defect','experience_design','expected_but_unclear','suggestion','unable_to_reproduce','withdrawn_by_player')),
  duplicate_of text references public.everthread_feedback_reports(id),
  triage_notes text,
  reviewed_at timestamptz,
  reviewed_against_commit text,
  fix_commit text,
  certification_run_id bigint,
  resolution_notes text,
  constraint everthread_feedback_id_format check (id ~ '^ET-[0-9]{8}-[A-Z0-9]{6,12}$'),
  constraint everthread_feedback_source_commit_format check (source_commit is null or source_commit ~ '^[0-9a-f]{7,40}$')
);

create index everthread_feedback_reports_active_idx on public.everthread_feedback_reports(status, triage_status, received_at desc);
create index everthread_feedback_reports_source_idx on public.everthread_feedback_reports(source_commit, received_at desc);
create index everthread_feedback_reports_kind_idx on public.everthread_feedback_reports(kind, received_at desc);

alter table public.everthread_feedback_reports enable row level security;
revoke all on table public.everthread_feedback_reports from anon, authenticated;
grant select, insert, update on table public.everthread_feedback_reports to service_role;

create table public.everthread_feedback_rate_limits (
  fingerprint_hash text not null check (char_length(fingerprint_hash) = 64),
  created_at timestamptz not null default now()
);
create index everthread_feedback_rate_limits_lookup_idx on public.everthread_feedback_rate_limits(fingerprint_hash, created_at desc);
alter table public.everthread_feedback_rate_limits enable row level security;
revoke all on table public.everthread_feedback_rate_limits from anon, authenticated;
grant select, insert, delete on table public.everthread_feedback_rate_limits to service_role;

create table public.everthread_feedback_review_state (
  key text primary key,
  last_checked_at timestamptz,
  last_checked_commit text,
  last_report_received_at timestamptz,
  reviewed_report_count integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.everthread_feedback_review_state enable row level security;
revoke all on table public.everthread_feedback_review_state from anon, authenticated;
grant select, insert, update on table public.everthread_feedback_review_state to service_role;

insert into public.everthread_feedback_review_state(key, last_checked_commit)
values ('main', 'd73bbfa6fdf8afb430f2604a09c9ac3053d60962')
on conflict (key) do nothing;
