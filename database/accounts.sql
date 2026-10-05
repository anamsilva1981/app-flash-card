create table public.account_studies (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null default '{"subjects":[],"queue":[],"activity":[],"progress":[],"cards":[],"preferences":{}}',
 updated_at timestamptz not null default now()
);
alter table public.account_studies enable row level security;
create policy own_studies on public.account_studies to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
grant select,insert,update on public.account_studies to authenticated;
revoke all on public.account_studies from anon;
create table public.account_operations(user_id uuid references auth.users(id) on delete cascade, operation_id uuid not null, created_at timestamptz not null default now(), primary key(user_id,operation_id));
alter table public.account_operations enable row level security;
create policy own_operations on public.account_operations to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
grant select,insert on public.account_operations to authenticated;
revoke all on public.account_operations from anon;
create table public.support_requests(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade, message text not null check(length(message) between 10 and 2000), created_at timestamptz default now());
alter table public.support_requests enable row level security;
create policy own_support on public.support_requests to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
grant select,insert on public.support_requests to authenticated;
revoke all on public.support_requests from anon;
create function public.apply_account_operation(operation_id uuid, path text, payload jsonb, prefer text default '') returns void language plpgsql security invoker set search_path='' as $$
declare uid uuid:=auth.uid(); doc jsonb; arr jsonb; item jsonb; field text; old_name text; label text; key text;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 if octet_length(payload::text)>2000000 then raise exception 'Payload too large'; end if;
 insert into public.account_studies(user_id) values(uid) on conflict do nothing;
 select data into doc from public.account_studies where user_id=uid for update;
 if exists(select 1 from public.account_operations o where o.user_id=uid and o.operation_id=apply_account_operation.operation_id) then return; end if;
 if path like 'study_subjects%' then field:='subjects'; key:='id';
 elsif path like 'study_queue%' then field:='queue'; key:='id';
 elsif path like 'seed_card_progress%' then field:='progress'; key:='card_id';
 elsif path like 'account_cards%' then field:='cards'; key:='id';
 elsif path like 'study_activity%' then field:='activity';
 elsif path='rpc/rename_study_subject' then
  select x->>'name' into old_name from jsonb_array_elements(doc->'subjects') x where x->>'id'=payload->>'subject_id';
  if old_name is null then raise exception 'Subject not found'; end if;
  select coalesce(jsonb_agg(case when x->>'id'=payload->>'subject_id' then x||jsonb_build_object('name',payload->>'new_name','days',payload->'routine','archived',payload->'is_archived','routine_initialized',true) else x end),'[]') into arr from jsonb_array_elements(doc->'subjects') x;
  doc:=jsonb_set(doc,'{subjects}',arr);
  select coalesce(jsonb_agg(case when x->>'subject'=old_name then x||jsonb_build_object('subject',payload->>'new_name') else x end),'[]') into arr from jsonb_array_elements(doc->'queue') x;
  doc:=jsonb_set(doc,'{queue}',arr);
 elsif path='rpc/complete_study_topic' then
  select x into item from jsonb_array_elements(doc->'queue') x where x->>'id'=payload->>'topic_id';
  if item is null then raise exception 'Topic not found'; end if;
  item:=item||jsonb_build_object('status','done','completed_at',coalesce(item->>'completed_at',payload->>'finished_at'));
  select coalesce(jsonb_agg(case when x->>'id'=item->>'id' then item else x end),'[]') into arr from jsonb_array_elements(doc->'queue') x;
  doc:=jsonb_set(doc,'{queue}',arr);
  label:=case when coalesce(item->>'subject','')='' then item->>'title' else (item->>'subject')||' — '||(item->>'title') end;
  payload:=jsonb_build_object('activity_date',payload->>'study_date','kind','learning','label',label);field:='activity';
 elsif path='account_preferences' then doc:=jsonb_set(doc,'{preferences}',coalesce(doc->'preferences','{}')||payload);
 else raise exception 'Unsupported operation'; end if;
 if field is not null then
  if field='activity' then
   if not exists(select 1 from jsonb_array_elements(doc->field) x where x->>'activity_date'=payload->>'activity_date' and x->>'kind'=payload->>'kind' and x->>'label'=payload->>'label') then doc:=jsonb_set(doc,array[field],(doc->field)||jsonb_build_array(payload));end if;
  else
   if payload->>key is null then raise exception 'Missing id'; end if;
   select coalesce(jsonb_agg(x),'[]') into arr from jsonb_array_elements(doc->field) x where x->>key<>payload->>key;
   doc:=jsonb_set(doc,array[field],arr||jsonb_build_array(payload));
  end if;
 end if;
 update public.account_studies set data=doc,updated_at=now() where user_id=uid;
 insert into public.account_operations(user_id,operation_id) values(uid,operation_id);
end $$;
revoke all on function public.apply_account_operation(uuid,text,jsonb,text) from public,anon;
grant execute on function public.apply_account_operation(uuid,text,jsonb,text) to authenticated;
