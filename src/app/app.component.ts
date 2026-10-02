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
 {id:1,topic:'Fundamentos de Machine Learning',question:'Quais são as etapas básicas para criar um modelo de ML?',answer:'Preparar dados, escolher algoritmo, treinar, avaliar e iterar.',due:today(),interval:0},
 {id:2,topic:'Fundamentos de Machine Learning',question:'Por que a qualidade dos dados de treinamento é tão importante?',answer:'Dados ruins geram modelos e previsões ruins.',due:today(),interval:0},
 {id:3,topic:'Fundamentos de Machine Learning',question:'O que são dados rotulados?',answer:'Dados que possuem uma saída ou classe conhecida associada.',due:today(),interval:0},
 {id:4,topic:'Fundamentos de Machine Learning',question:'O que são dados não rotulados?',answer:'Dados de entrada sem saída, classe ou variável-alvo associada.',due:today(),interval:0},
 {id:5,topic:'Fundamentos de Machine Learning',question:'O que caracteriza dados não estruturados?',answer:'Não possuem formato predefinido, como texto, imagem, áudio e vídeo.',due:today(),interval:0},
 {id:6,topic:'Fundamentos de Machine Learning',question:'Qual tipo de aprendizado utiliza dados rotulados?',answer:'Aprendizado supervisionado.',due:today(),interval:0},
 {id:7,topic:'Fundamentos de Machine Learning',question:'Qual é o objetivo do aprendizado supervisionado?',answer:'Aprender a prever a saída para dados novos e ainda não vistos.',due:today(),interval:0},
 {id:8,topic:'Fundamentos de Machine Learning',question:'Qual tipo de aprendizado utiliza dados não rotulados?',answer:'Aprendizado não supervisionado.',due:today(),interval:0},
 {id:9,topic:'Fundamentos de Machine Learning',question:'Como funciona o aprendizado por reforço?',answer:'O modelo aprende com recompensas e penalidades por suas ações.',due:today(),interval:0},
 {id:10,topic:'Fundamentos de Machine Learning',question:'Qual a diferença entre inferência em lote e em tempo real?',answer:'Lote processa vários dados juntos; tempo real responde quase imediatamente.',due:today(),interval:0}
 ];
 cards=signal<Card[]>(this.load());
 dueCards=computed(()=>this.cards().filter(c=>c.due<=today()&&(this.topic()==='Todos'||c.topic===this.topic())));
 card=computed(()=>this.dueCards()[this.index()%Math.max(this.dueCards().length,1)]);
 progress=computed(()=>this.dueCards().length?String(this.index()+1)+' / '+String(this.dueCards().length):'0 / 0');
 private load():Card[]{try{
  const saved:Card[]=JSON.parse(localStorage.getItem('flashcards')||'null');
  if(!Array.isArray(saved))return this.seed;
  return this.seed.map(seedCard=>{
   const previous=saved.find(card=>card.question===seedCard.question);
   return previous?{...seedCard,due:previous.due,interval:previous.interval}:seedCard;
  });
 }catch{return this.seed}}
 choose(v:string){this.topic.set(v);this.index.set(0);this.flipped.set(false)}
 reveal(){this.flipped.set(!this.flipped())}
 rate(r:Rating){const c=this.card();if(!c)return;const days={again:1,hard:2,good:4,easy:7}[r];this.cards.set(this.cards().map(x=>x.id===c.id?{...x,due:addDays(days),interval:days}:x));localStorage.setItem('flashcards',JSON.stringify(this.cards()));this.flipped.set(false);this.index.set(0)}
 reset(){localStorage.removeItem('flashcards');this.cards.set(this.seed);this.index.set(0);this.flipped.set(false)}
}