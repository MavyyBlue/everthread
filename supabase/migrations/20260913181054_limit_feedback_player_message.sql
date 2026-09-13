alter table public.everthread_feedback_reports
  add constraint everthread_feedback_player_message_length
  check (player_message is null or char_length(player_message) <= 1000);
