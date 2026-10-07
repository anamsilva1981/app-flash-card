-- All backup operations share one database transaction and one replay identity.
create or replace function public.apply_account_batch(batch_id uuid, operations jsonb)
returns void language plpgsql security invoker set search_path='' as $$
declare uid uuid:=auth.uid(); operation jsonb;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 if jsonb_typeof(operations) is distinct from 'array' or jsonb_array_length(operations)>10000 or octet_length(operations::text)>2000000 then raise exception 'Invalid batch'; end if;
 insert into public.account_studies(user_id) values(uid) on conflict do nothing;
 perform 1 from public.account_studies where user_id=uid for update;
 if exists(select 1 from public.account_operations where user_id=uid and operation_id=batch_id) then return;end if;
 for operation in select value from jsonb_array_elements(operations) loop
  if operation->>'id' is null or operation->>'path' is null or not operation ? 'body' then raise exception 'Invalid operation';end if;
  perform public.apply_account_operation((operation->>'id')::uuid,operation->>'path',operation->'body',coalesce(operation->>'prefer',''));
 end loop;
 insert into public.account_operations(user_id,operation_id) values(uid,batch_id);
end $$;
revoke all on function public.apply_account_batch(uuid,jsonb) from public,anon;
grant execute on function public.apply_account_batch(uuid,jsonb) to authenticated;
