import { signal } from '@angular/core';
const url='https://elzkhndhkkkfxvtbhilt.supabase.co/rest/v1/';
const KEY='sb_publishable_YFZqSuAst3q1ERiC3HA71A_u4fmIP9j';
type Operation={id:string;path:string;body:unknown;method:string;prefer:string};
const storageKey='study-pending-v1';
export const syncStatus=signal('Conectando…');
export function cached<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
export function cache(key:string,value:unknown){localStorage.setItem(key,JSON.stringify(value))}
let inFlight:Promise<void>|null=null;let revision=0;
export function writeRevision(){return revision}
export async function api(path:string,options:RequestInit={}){
 try{return await fetch(url+path,{...options,signal:AbortSignal.timeout(12000),headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json',Prefer:'return=minimal',...options.headers}})}
 catch(error){syncStatus.set('Offline · usando dados salvos');throw error}
}
async function drain(){try{while(hasPending()){
 const op=cached<Operation[]>(storageKey,[])[0];
 const res=await api(op.path,{method:op.method,body:JSON.stringify(op.body),headers:{Prefer:op.prefer}});
 if(!res.ok)throw new Error(await res.text());
 // Read again after the request so writes from another tab are retained.
 cache(storageKey,cached<Operation[]>(storageKey,[]).filter(p=>p.id!==op.id));
 }syncStatus.set('Sincronizado')
 }catch{syncStatus.set(navigator.onLine?'Alterações aguardando sincronização':'Offline · alterações salvas')}}
export function flush():Promise<void>{if(inFlight)return inFlight;inFlight=(async()=>{try{if(navigator.locks)await navigator.locks.request('study-sync',drain);else await drain()}finally{inFlight=null}})();return inFlight}
export function write(path:string,body:unknown,method='POST',prefer='resolution=merge-duplicates,return=minimal'){
 const pending=cached<Operation[]>(storageKey,[]);pending.push({id:crypto.randomUUID(),path,body,method,prefer});cache(storageKey,pending);revision++;syncStatus.set('Salvo · sincronizando…');void flush();
}
export function hasPending(){return cached<Operation[]>(storageKey,[]).length>0}
window.addEventListener('online',()=>void flush());
window.setInterval(()=>{if(hasPending())void flush()},30000);
