create policy "deny public feedback report access"
on public.everthread_feedback_reports
for all
to anon, authenticated
using (false)
with check (false);

create policy "deny public feedback rate access"
on public.everthread_feedback_rate_limits
for all
to anon, authenticated
using (false)
with check (false);

create policy "deny public feedback review access"
on public.everthread_feedback_review_state
for all
to anon, authenticated
using (false)
with check (false);
