alter table public.everthread_feedback_rate_limits add column id bigint generated always as identity primary key;
create index everthread_feedback_reports_duplicate_idx on public.everthread_feedback_reports(duplicate_of) where duplicate_of is not null;
