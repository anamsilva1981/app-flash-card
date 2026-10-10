-- Remove the anonymous write surface from the historical study API.
-- The application now persists through account-scoped RPCs guarded by auth.uid().
do $$
begin
  if exists (
    select 1
      from pg_policies
     where schemaname = 'public'
       and tablename = 'study_subjects'
       and policyname = 'subject_routine_update'
  ) then
    execute 'drop policy subject_routine_update on public.study_subjects';
  end if;
end
$$;

revoke execute on function public.rename_study_subject(uuid, text, integer[], boolean)
  from public, anon;
revoke execute on function public.complete_study_topic(uuid, timestamptz, date)
  from public, anon;
