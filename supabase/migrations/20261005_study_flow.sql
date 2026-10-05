-- Additive migration for the existing personal, anonymous study application.
alter table public.study_subjects add column if not exists days integer[];
alter table public.study_subjects add column if not exists archived boolean not null default false;
alter table public.study_subjects add column if not exists deck_key text;
do $$ begin
 if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='study_subjects' and column_name='routine_initialized') then
 alter table public.study_subjects add column routine_initialized boolean not null default true;
 update public.study_subjects set routine_initialized=false;
 end if;
end $$;
update public.study_subjects set days=case when name in ('AWS IA','JavaScript') then array[0,1,2,3,4,5,6] else array[]::integer[] end where days is null;
update public.study_subjects set deck_key=case when name='AWS IA' then 'AWS' else name end where deck_key is null;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='study_subjects' and policyname='subject_routine_update') then
 create policy subject_routine_update on public.study_subjects for update to anon using(true) with check(true);
 end if;
end $$;
grant update on public.study_subjects to anon;
create or replace function public.rename_study_subject(subject_id uuid,new_name text,routine integer[],is_archived boolean)
returns void language plpgsql security invoker set search_path='' as $$
declare previous_name text;
begin
 if length(trim(new_name))=0 or exists(select 1 from unnest(routine) d where d<0 or d>6) then raise exception 'Invalid routine'; end if;
 select name into previous_name from public.study_subjects where id=subject_id for update;
 if not found then raise exception 'Subject not found'; end if;
 update public.study_subjects set name=new_name,days=routine,archived=is_archived,routine_initialized=true where id=subject_id;
 update public.study_queue set subject=new_name where subject=previous_name;
end $$;
create or replace function public.complete_study_topic(topic_id uuid,finished_at timestamptz,study_date date)
returns void language plpgsql security invoker set search_path='' as $$
declare item public.study_queue;
begin
 update public.study_queue set status='done',completed_at=coalesce(completed_at,finished_at) where id=topic_id returning * into item;
 if not found then raise exception 'Topic not found'; end if;
 insert into public.study_activity(activity_date,kind,label) values(study_date,'learning',case when item.subject='' then item.title else item.subject||' — '||item.title end) on conflict(activity_date,kind,label) do nothing;
end $$;
revoke all on function public.complete_study_topic(uuid,timestamptz,date) from public;
revoke all on function public.rename_study_subject(uuid,text,integer[],boolean) from public;
grant execute on function public.complete_study_topic(uuid,timestamptz,date) to anon;
grant execute on function public.rename_study_subject(uuid,text,integer[],boolean) to anon;
