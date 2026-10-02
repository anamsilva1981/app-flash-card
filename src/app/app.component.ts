import { Component, computed, signal } from '@angular/core';
type Rating = 'again'|'hard'|'good'|'easy';
interface Card { id:number; topic:string; question:string; answer:string; due:string; interval:number; }
const DAY=86400000;
const today=()=>new Date().toISOString().slice(0,10);
const addDays=(n:number)=>new Date(Date.now()+n*DAY).toISOString().slice(0,10);
@Component({selector:'app-root',standalone:true,templateUrl:'./app.component.html',styleUrl:'./app.component.css'})
export class AppComponent {
 readonly topics=['Todos','Fundamentos de Machine Learning'];
 topic=signal('Todos'); flipped=signal(false); index=signal(0);
 private seed:Card[]=[
 {id:1,topic:'Fundamentos de Machine Learning',question:'Qual é o principal problema de tratar todas as transações não investigadas como “não fraude”?',answer:'Ausência de rótulo não é evidência de classe negativa. Isso pode marcar fraudes ainda não investigadas como não fraude e introduzir ruído nos rótulos.',due:today(),interval:0},
 {id:2,topic:'Fundamentos de Machine Learning',question:'Qual é a diferença entre dados rotulados e não rotulados?',answer:'Dados rotulados incluem a resposta-alvo de cada exemplo. Dados não rotulados não possuem essa resposta e podem ser usados para descobrir padrões ou estruturas.',due:today(),interval:0},
 {id:3,topic:'Fundamentos de Machine Learning',question:'Por que séries temporais são dados estruturados, mas exigem cuidado especial?',answer:'Elas possuem estrutura definida, porém a ordem temporal carrega informação e deve ser preservada durante a análise e validação.',due:today(),interval:0},
 {id:4,topic:'Fundamentos de Machine Learning',question:'Imagens, áudio e texto livre são normalmente classificados como que tipo de dado?',answer:'Dados não estruturados, pois não seguem naturalmente um esquema tabular fixo de linhas e colunas.',due:today(),interval:0}
 ];
 cards=signal<Card[]>(this.load());
 dueCards=computed(()=>this.cards().filter(c=>c.due<=today()&&(this.topic()==='Todos'||c.topic===this.topic())));
 card=computed(()=>this.dueCards()[this.index()%Math.max(this.dueCards().length,1)]);
 progress=computed(()=>this.dueCards().length?String(this.index()+1)+' / '+String(this.dueCards().length):'0 / 0');
 private load():Card[]{try{return JSON.parse(localStorage.getItem('flashcards')||'null')||this.seed}catch{return this.seed}}
 choose(v:string){this.topic.set(v);this.index.set(0);this.flipped.set(false)}
 reveal(){this.flipped.set(!this.flipped())}
 rate(r:Rating){const c=this.card();if(!c)return;const days={again:1,hard:2,good:4,easy:7}[r];this.cards.set(this.cards().map(x=>x.id===c.id?{...x,due:addDays(days),interval:days}:x));localStorage.setItem('flashcards',JSON.stringify(this.cards()));this.flipped.set(false);this.index.set(0)}
 reset(){localStorage.removeItem('flashcards');this.cards.set(this.seed);this.index.set(0);this.flipped.set(false)}
}