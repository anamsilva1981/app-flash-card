import { Component, computed, signal, Input, Output, EventEmitter } from '@angular/core';

interface ManagedSubject { id:string; name:string; days:number[]; archived:boolean; }
interface StudyItem { id:string; title:string; subject:string; notes:string; link:string|null; priority:'baixa'|'media'|'alta'; status:'todo'|'done'; completed_at:string|null; }
interface Flashcard { id:number; subject:string; topic:string; question:string; due:string; }

@Component({selector:'app-subject-manager',standalone:true,templateUrl:'./subject-manager.component.html',styleUrl:'./subject-manager.component.css'})
export class SubjectManagerComponent {
 readonly week=[{value:1,short:'Seg'},{value:2,short:'Ter'},{value:3,short:'Qua'},{value:4,short:'Qui'},{value:5,short:'Sex'},{value:6,short:'Sáb'},{value:0,short:'Dom'}];
 subjects=signal<ManagedSubject[]>(this.load()); formOpen=signal(false); editingId=signal<string|null>(null); name=signal(''); selectedDays=signal<number[]>([]); showArchived=signal(false);
 selectedSubject=signal<ManagedSubject|null>(null); detailTab=signal<'flashcards'|'topics'>('flashcards'); selectedTopic=signal<StudyItem|null>(null);
 @Input() flashcards:Flashcard[]=[]; @Input() studyItems:StudyItem[]=[];
 @Output() addTopicRequested=new EventEmitter<string>(); @Output() editTopicRequested=new EventEmitter<StudyItem>(); @Output() completeTopicRequested=new EventEmitter<StudyItem>(); @Output() subjectsChanged=new EventEmitter<string[]>(); @Output() subjectRenamed=new EventEmitter<{previous:string;name:string}>(); @Output() reviewRequested=new EventEmitter<string>();
 topicView=signal<'todo'|'done'>('todo');
 private defaults():ManagedSubject[]{return [{id:'aws',name:'AWS IA',days:[1,2,3,4,5,6,0],archived:false},{id:'javascript',name:'JavaScript',days:[1,2,3,4,5,6,0],archived:false},{id:'patterns',name:'Padrões de Projeto',days:[],archived:false},{id:'angular',name:'Angular',days:[],archived:false},{id:'react',name:'React',days:[],archived:false},{id:'architecture',name:'Arquitetura',days:[],archived:false},{id:'java',name:'Java',days:[],archived:false}]}
 private load():ManagedSubject[]{try{const v=JSON.parse(localStorage.getItem('study-subject-config')||'null');return Array.isArray(v)?v:this.defaults()}catch{return this.defaults()}}
 private loadJson<T>(key:string,fallback:T):T{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v??fallback}catch{return fallback}}
 private persist(){localStorage.setItem('study-subject-config',JSON.stringify(this.subjects()));window.dispatchEvent(new CustomEvent('subject-config-changed'))}
 visibleSubjects(){return this.subjects().filter(s=>s.archived===this.showArchived())}
 openSubject(item:ManagedSubject){if(item.archived)return;this.selectedSubject.set(item);this.detailTab.set('flashcards');this.selectedTopic.set(null);this.topicView.set('todo')}
 closeSubject(){this.selectedSubject.set(null);this.selectedTopic.set(null)}
 subjectAliases(name:string){return name==='AWS IA'?['AWS IA','AWS']: [name]}
 subjectCards(){const s=this.selectedSubject();return s?this.flashcards.filter(c=>this.subjectAliases(s.name).includes(c.subject)):[]}
 dueCards(){const d=new Date().toISOString().slice(0,10);return this.subjectCards().filter(c=>c.due<=d)}
 subjectTopics(){const s=this.selectedSubject();return s?this.studyItems.filter(i=>this.subjectAliases(s.name).includes(i.subject)&&i.status===this.topicView()):[]}
 reviewAgain(){const s=this.selectedSubject();if(!s)return;window.dispatchEvent(new CustomEvent('review-subject',{detail:{subject:s.name==='AWS IA'?'AWS':s.name,again:true}}))}
 reviewDue(){const s=this.selectedSubject();if(s)this.reviewRequested.emit(s.name==='AWS IA'?'AWS':s.name)}
 addFlashcard(){const s=this.selectedSubject();if(s)window.dispatchEvent(new CustomEvent('add-flashcard',{detail:{subject:s.name}}))}
 addTopic(){const s=this.selectedSubject();if(s)this.addTopicRequested.emit(s.name)}
 editTopic(item:StudyItem){this.closeTopic();this.editTopicRequested.emit(item)}
 completeTopic(item:StudyItem){this.selectedTopic.set(null);this.completeTopicRequested.emit(item)}
 openTopic(item:StudyItem){this.selectedTopic.set(item)} closeTopic(){this.selectedTopic.set(null)}
 openNew(){this.editingId.set(null);this.name.set('');this.selectedDays.set([]);this.formOpen.set(true)}
 edit(item:ManagedSubject){this.editingId.set(item.id);this.name.set(item.name);this.selectedDays.set([...item.days]);this.formOpen.set(true)}
 close(){this.formOpen.set(false);this.editingId.set(null)}
 toggleDay(day:number){this.selectedDays.update(v=>v.includes(day)?v.filter(x=>x!==day):[...v,day])}
 save(){const name=this.name().trim();if(!name)return;const id=this.editingId();const previous=this.subjects().find(s=>s.id===id)?.name;if(previous&&previous!==name)this.subjectRenamed.emit({previous,name});if(id)this.subjects.update(v=>v.map(s=>s.id===id?{...s,name,days:[...this.selectedDays()]}:s));else this.subjects.update(v=>[...v,{id:crypto.randomUUID(),name,days:[...this.selectedDays()],archived:false}]);this.persist();this.subjectsChanged.emit(this.subjects().map(s=>s.name));this.close()}
 archive(item:ManagedSubject){this.subjects.update(v=>v.map(s=>s.id===item.id?{...s,archived:true}:s));this.persist()}
 restore(item:ManagedSubject){this.subjects.update(v=>v.map(s=>s.id===item.id?{...s,archived:false}:s));this.persist()}
 formatCompleted(value:string|null){return value?new Date(value).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'}):'data não informada'}
 dayLabel(days:number[]){if(days.length===7)return 'Todos os dias';if(!days.length)return 'Sem dias definidos';return this.week.filter(d=>days.includes(d.value)).map(d=>d.short).join(', ')}
}