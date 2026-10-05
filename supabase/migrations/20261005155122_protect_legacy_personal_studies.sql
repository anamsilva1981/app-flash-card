-- Preserve the historical rows, but remove their formerly shared API access.
do $$ declare t text; begin
 foreach t in array array['study_subjects','study_queue','study_activity','seed_card_progress','subjects','topics','flashcards','card_progress','review_events','review_sessions'] loop
  execute format('revoke all on table public.%I from anon, authenticated',t);
 end loop;
end $$;
revoke execute on function public.rename_study_subject(uuid,text,integer[],boolean) from public,anon,authenticated;
revoke execute on function public.complete_study_topic(uuid,timestamptz,date) from public,anon,authenticated;
