import { signal } from '@angular/core';
import { accountSession, accountScope, storageName, supabase } from './account';
type Operation={id:string;path:string;body:unknown;method:string;prefer:string};
const storageKey='study-pending-v1';
export const syncStatus=signal('Salvo neste dispositivo');
export function cached<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(storageName(key))||'null')??fallback}catch{return fallback}}
export function cache(key:string,value:unknown){localStorage.setItem(storageName(key),JSON.stringify(value))}
let inFlight:Promise<void>|null=null;let revision=0;
export function writeRevision(){return revision}
export async function api(path:string,options:RequestInit={}){
 if(!accountSession())return new Response('[]',{status:200,headers:{'Content-Type':'application/json'}});
 const scope=accountScope();
 const {data,error}=await supabase.from('account_studies').select('data').eq('user_id',scope).abortSignal(AbortSignal.timeout(12000)).maybeSingle();
 if(error){syncStatus.set(navigator.onLine?'Sincronização indisponível · dados salvos':'Offline · usando dados salvos');throw error}
 if(scope!==accountScope())throw new Error('Account changed');
 const field=path.startsWith('study_subjects')?'subjects':path.startsWith('study_queue')?'queue':path.startsWith('study_activity')?'activity':path.startsWith('seed_card_progress')?'progress':path.startsWith('account_cards')?'cards':'preferences';
 return new Response(JSON.stringify(data?.data?.[field]??(field==='preferences'?{}:[])),{status:200,headers:{'Content-Type':'application/json'}});
}
async function drain(){const scope=accountScope();try{while(hasPending()&&scope===accountScope()){
 if(!accountSession())return;
 const op=cached<Operation[]>(storageKey,[])[0];
 const {error}=await supabase.rpc('apply_account_operation',{operation_id:op.id,path:op.path,payload:op.body,prefer:op.prefer}).abortSignal(AbortSignal.timeout(12000));
 if(error)throw error;
 if(scope!==accountScope())return;
 cache(storageKey,cached<Operation[]>(storageKey,[]).filter(p=>p.id!==op.id));
 }syncStatus.set('Sincronizado')
 }catch{syncStatus.set(navigator.onLine?'Alterações aguardando sincronização':'Offline · alterações salvas')}}
export function flush():Promise<void>{if(!accountSession())return Promise.resolve();if(inFlight)return inFlight;inFlight=(async()=>{try{if(navigator.locks)await navigator.locks.request('study-sync:'+accountScope(),drain);else await drain()}finally{inFlight=null}})();return inFlight}
export function write(path:string,body:unknown,method='POST',prefer='resolution=merge-duplicates,return=minimal'){
 revision++;if(!accountSession()){syncStatus.set('Salvo neste dispositivo');return}
 const pending=cached<Operation[]>(storageKey,[]);pending.push({id:crypto.randomUUID(),path,body,method,prefer});cache(storageKey,pending);syncStatus.set('Salvo · sincronizando…');void flush();
}
export function hasPending(){return cached<Operation[]>(storageKey,[]).length>0}
window.addEventListener('online',()=>void flush());
window.setInterval(()=>{if(hasPending())void flush()},30000);
