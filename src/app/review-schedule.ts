export type Rating='again'|'hard'|'good'|'easy';
export function intervalFor(previous:number,rating:Rating):number {
 if(rating==='again')return 1;
 if(previous<=0)return {hard:2,good:4,easy:7}[rating];
 return Math.min(365,Math.max(previous+1,Math.round(previous*{hard:1.2,good:2.2,easy:3}[rating])));
}
export function sortTopics<T extends {priority:string;created_at?:string;completed_at?:string|null}>(items:T[],done=false):T[]{
 const rank:Record<string,number>={alta:0,media:1,baixa:2};
 return [...items].sort((a,b)=>done?(b.completed_at||'').localeCompare(a.completed_at||''):(rank[a.priority]-rank[b.priority]||(a.created_at||'').localeCompare(b.created_at||'')));
}
