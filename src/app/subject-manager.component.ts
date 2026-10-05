import { Component, computed, signal, Input, Output, EventEmitter } from '@angular/core';
import { api, cache, cached, write, flush, hasPending, syncStatus } from './sync';
import { sortTopics } from './review-schedule';

export interface ManagedSubject { id:string; name:string; days:number[]; archived:boolean; deck_key?:string; routine_initialized?:boolean; }
interface StudyItem { id:string; title:string; subject:string; notes:string; link:string|null; priority:'baixa'|'media'|'alta'; status:'todo'|'done'; completed_at:string|null; created_at?:string; }
interface Flashcard { id:number; subject:string; topic:string; question:string; due:string; }

@Component({selector:'app-subject-manager',standalone:true,templateUrl:'./subject-manager.component.html',styleUrl:'./subject-manager.component.css'})
export class SubjectManagerComponent {
 readonly week=[{value:1,short:'Seg'},{value:2,short:'Ter'},{value:3,short:'Qua'},{value:4,short:'Qui'},{value:5,short:'Sex'},{value:6,short:'Sáb'},{value:0,short:'Dom'}];
 subjects=subjectConfigs; formOpen=signal(false); editingId=signal<string|null>(null); name=signal(''); selectedDays=signal<number[]>([]); showArchived=signal(false);
 selectedSubject=signal<ManagedSubject|null>(null); detailTab=signal<'flashcards'|'topics'>('flashcards'); selectedTopic=signal<StudyItem|null>(null);
 @Input() flashcards:Flashcard[]=[]; @Input() studyItems:StudyItem[]=[];
 @Output() configChanged=new EventEmitter<ManagedSubject[]>(); @Output() practiceRequested=new EventEmitter<string>();
 @Output() addTopicRequested=new EventEmitter<string>(); @Output() editTopicRequested=new EventEmitter<StudyItem>(); @Output() completeTopicRequested=new EventEmitter<StudyItem>(); @Output() subjectsChanged=new EventEmitter<string[]>(); @Output() subjectRenamed=new EventEmitter<{previous:string;name:string}>(); @Output() reviewRequested=new EventEmitter<string>();
 topicView=signal<'todo'|'done'>('todo');
 private persist(){this.configChanged.emit(this.subjects());localStorage.setItem('study-subject-config',JSON.stringify(this.subjects()));}
 visibleSubjects(){return this.subjects().filter(s=>s.archived===this.showArchived())}
 openSubject(item:ManagedSubject){if(item.archived)return;this.selectedSubject.set(item);this.detailTab.set('flashcards');this.selectedTopic.set(null);this.topicView.set('todo')}
 closeSubject(){this.selectedSubject.set(null);this.selectedTopic.set(null)}
 subjectAliases(name:string){const item=this.subjects().find(s=>s.name===name);return Array.from(new Set([name,item?.deck_key||name,name==='AWS IA'?'AWS':name]))}
 subjectCards(){const s=this.selectedSubject();return s?this.flashcards.filter(c=>this.subjectAliases(s.name).includes(c.subject)):[]}
 dueCards(){const d=new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});return this.subjectCards().filter(c=>c.due<=d)}
 subjectTopics(){const s=this.selectedSubject();return s?sortTopics(this.studyItems.filter(i=>this.subjectAliases(s.name).includes(i.subject)&&i.status===this.topicView()),this.topicView()==='done'):[]}
 reviewAgain(){const s=this.selectedSubject();if(s)this.practiceRequested.emit(s.deck_key||s.name)}
 reviewDue(){const s=this.selectedSubject();if(s)this.reviewRequested.emit(s.deck_key||s.name)}
 addTopic(){const s=this.selectedSubject();if(s)this.addTopicRequested.emit(s.name)}
 editTopic(item:StudyItem){this.closeTopic();this.editTopicRequested.emit(item)}
 completeTopic(item:StudyItem){this.selectedTopic.set(null);this.completeTopicRequested.emit(item)}
 openTopic(item:StudyItem){this.selectedTopic.set(item)} closeTopic(){this.selectedTopic.set(null)}
 openNew(){this.editingId.set(null);this.name.set('');this.selectedDays.set([]);this.formOpen.set(true)}
 edit(item:ManagedSubject){this.editingId.set(item.id);this.name.set(item.name);this.selectedDays.set([...item.days]);this.formOpen.set(true)}
 close(){this.formOpen.set(false);this.editingId.set(null)}
 toggleDay(day:number){this.selectedDays.update(v=>v.includes(day)?v.filter(x=>x!==day):[...v,day])}
 save(){const name=this.name().trim();if(!name)return;if(this.subjects().some(s=>s.id!==this.editingId()&&s.name.toLowerCase()===name.toLowerCase())){this.error.set('Já existe uma matéria com esse nome.');return}const id=this.editingId();const old=this.subjects().find(s=>s.id===id);const next:ManagedSubject={id:id||crypto.randomUUID(),name,days:[...this.selectedDays()],archived:old?.archived||false,deck_key:old?.deck_key||old?.name||name};if(old&&old.name!==name)this.subjectRenamed.emit({previous:old.name,name});this.subjects.update(v=>id?v.map(s=>s.id===id?next:s):[...v,next]);this.saveRemote(next,!!old);if(this.selectedSubject()?.id===id)this.selectedSubject.set(next);this.persist();this.subjectsChanged.emit(this.subjects().filter(s=>!s.archived).map(s=>s.name));this.close();this.error.set('')}
 private saveRemote(item:ManagedSubject,existing:boolean){if(existing)write('rpc/rename_study_subject',{subject_id:item.id,new_name:item.name,routine:item.days,is_archived:item.archived});else write('study_subjects?on_conflict=id',{id:item.id,name:item.name,days:item.days,archived:item.archived,deck_key:item.deck_key})}
 archive(item:ManagedSubject){const next={...item,archived:true};this.subjects.update(v=>v.map(s=>s.id===item.id?next:s));this.saveRemote(next,true);this.persist()}
 restore(item:ManagedSubject){const next={...item,archived:false};this.subjects.update(v=>v.map(s=>s.id===item.id?next:s));this.saveRemote(next,true);this.persist()}
 error=signal('');
 ngOnInit(){this.persist();this.subjectsChanged.emit(this.subjects().filter(s=>!s.archived).map(s=>s.name))}
 async syncRemote(){await loadSubjectConfig();this.persist()}
 formatCompleted(value:string|null){return value?new Date(value).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'}):'data não informada'}
 dayLabel(days:number[]){if(days.length===7)return 'Todos os dias';if(!days.length)return 'Sem dias definidos';return this.week.filter(d=>days.includes(d.value)).map(d=>d.short).join(', ')}
}
function defaults():ManagedSubject[]{return [{id:'aws',name:'AWS IA',days:[1,2,3,4,5,6,0],archived:false,deck_key:'AWS'},{id:'javascript',name:'JavaScript',days:[1,2,3,4,5,6,0],archived:false},{id:'patterns',name:'Padrões de Projeto',days:[],archived:false},{id:'angular',name:'Angular',days:[],archived:false},{id:'react',name:'React',days:[],archived:false},{id:'architecture',name:'Arquitetura',days:[],archived:false},{id:'java',name:'Java',days:[],archived:false}]}

export const subjectConfigs=signal<ManagedSubject[]>(cached('study-subject-config',defaults().map(s=>({...s,deck_key:s.deck_key||s.name}))));
export async function loadSubjectConfig(){try{await flush();if(hasPending()){return}const res=await api('study_subjects?select=id,name,days,archived,deck_key,routine_initialized&order=created_at.asc');if(!res.ok)throw new Error();const remote:ManagedSubject[]=await res.json();const migrated=cached('subject-routine-migrated',false);const legacy=cached<ManagedSubject[]>('study-subject-config',[]);if(!migrated){for(const local of legacy){const existing=remote.find(r=>r.name===local.name);if(existing&&!existing.routine_initialized){existing.days=local.days;existing.archived=local.archived;write('rpc/rename_study_subject',{subject_id:existing.id,new_name:existing.name,routine:existing.days,is_archived:existing.archived})}else if(!existing){const added={...local,id:crypto.randomUUID(),deck_key:local.name};remote.push(added);write('study_subjects?on_conflict=id',added)}}cache('subject-routine-migrated',true)}subjectConfigs.set(remote);cache('study-subject-config',remote)}catch{syncStatus.set('Usando matérias salvas neste dispositivo')}}
