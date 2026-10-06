import { A11yModule } from '@angular/cdk/a11y';
import { AppIconComponent, SubjectBadgeComponent } from './app-icon.component';
import { SwUpdate } from '@angular/service-worker';
import { Component, computed, signal, OnInit, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { api as syncedApi, cache, cached, write, flush, hasPending, syncStatus, writeRevision } from './sync';
import { AccountPanelComponent } from './account-panel.component';
import { accountSession, accountScope } from './account';
import { buildReviewSession, dueReviewCards, intervalFor } from './review-schedule';
import { completeStudyItem as markStudyItemComplete, normalizeStudyLink, renameStudyItemsSubject, nextStudyItem, pendingStudyItems, sortStudyItems, StudyItem, upsertStudyItem } from './study-plan';
import { addStudyActivity, buildCalendarDays, countStudyDaysInMonth, historyFromRemote, StudyDay, studyStreak } from './study-history';
import { onboardingStepFor } from './onboarding';
import { createBackup, mergeBackupCards, mergeBackupHistory, mergeBackupSubjects, parseBackup } from './backup';
import { Card, cardTopics, cardsForSubject, countDueCards, countSubjectCards, createCard, upsertCard } from './flashcard';
import { SEED_CARDS } from './seed-cards';
import { mergeCardProgress, restoreCompletedReviews } from './progress';
import { activeSubjects, subjectsForToday } from './subject-selectors';
import { readRemoteCards, readRemoteHistory, readRemotePreferences, readRemoteProgress, readRemoteStudyQueue } from './remote-state';
import { shouldShowReminder } from './reminder-policy';
import { ManagedSubject, SubjectManagerComponent, subjectConfigs, loadSubjectConfig } from './subject-manager.component';
type Rating = 'again'|'hard'|'good'|'easy';
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});
const addDays=(n:number)=>{const date=new Date(today()+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+n);return date.toISOString().slice(0,10)};
@Component({selector:'app-root',standalone:true,imports:[AccountPanelComponent,A11yModule,AppIconComponent,SubjectBadgeComponent,FormsModule,SubjectManagerComponent,MatButtonModule,MatCardModule,MatChipsModule,MatExpansionModule],templateUrl:'./app.component.html',styleUrl:'./app.component.css'})
export class AppComponent implements OnInit {
 updateReady=signal(false);private updates=inject(SwUpdate);
 constructor(){if(this.updates.isEnabled)this.updates.versionUpdates.subscribe(event=>{if(event.type==='VERSION_READY')this.updateReady.set(true)})}
 reloadApp(){window.location.reload()}

 activeTab=signal<'home'|'studyPlan'|'progress'|'history'|'settings'>('home');
 studyItems=signal<StudyItem[]>(cached('study-queue',[])); studySubjects=signal<string[]>([]); studyFormOpen=signal(false); studyTitle=signal(''); studySubject=signal(''); studyNotes=signal(''); studyLink=signal(''); studyPriority=signal<'baixa'|'media'|'alta'>('media'); editingStudyId=signal<string|null>(null); subjectFormOpen=signal(false); newSubjectName=signal('');
 historyMonth=signal(new Date(today()+'T12:00:00'));
 selectedHistoryDate=signal<string|null>(null);
 subject=signal<string|null>(null); topic=signal('Todos'); flipped=signal(false); explanationOpen=signal(false); index=signal(0);

 private seed:Card[]=SEED_CARDS;
 cards=signal<Card[]>(this.load());
 history=signal<StudyDay[]>(cached<StudyDay[]>('study-history',[]));
 studyError=signal(''); studySaving=signal(false);
 @ViewChild(SubjectManagerComponent) manager?:SubjectManagerComponent;
 syncSubjectNames(names:string[]){this.studySubjects.update(v=>Array.from(new Set([...v,...names])))}
 openTopicForm(name:string){this.syncSubjectNames([name]);this.openStudyForm();this.studySubject.set(name)}
 renameStudySubject(change:{previous:string;name:string}){this.studyItems.update(v=>renameStudyItemsSubject(v,change.previous,change.name));cache('study-queue',this.studyItems())}
 ngOnInit(){window.addEventListener('study-account-ready',this.resumePendingSave);if(localStorage.getItem('study-open-settings')==='yes'){localStorage.removeItem('study-open-settings');this.activeTab.set('settings')}this.subjectConfigs.set(cached('study-subject-config',[]));this.configChanged(this.subjectConfigs());this.displayName.set(cached('display-name',accountSession()?.user.user_metadata?.['display_name']||''));void this.initializeRemoteState();window.addEventListener('online',this.reconnect);window.addEventListener('study-profile-changed',this.profileChanged);this.reminderTimer=window.setInterval(()=>this.checkReminder(),30000)}
 private resumePendingSave=()=>{let action:any=null;try{action=JSON.parse(sessionStorage.getItem('study-pending-action')||'null');sessionStorage.removeItem('study-pending-action')}catch{}if(action?.type==='card'&&action.card){this.cardDraft={...action.card};this.cardEditor.set(true);window.setTimeout(()=>this.saveCard(),0)}};
 private requireAccount(detail:any){if(accountSession())return false;window.dispatchEvent(new CustomEvent('study-account-required',{detail}));return true}
 private reconnect=()=>void this.initializeRemoteState();private profileChanged=()=>this.displayName.set(cached('display-name',''));private reminderTimer=0;
 ngOnDestroy(){window.removeEventListener('study-account-ready',this.resumePendingSave);window.removeEventListener('online',this.reconnect);window.removeEventListener('study-profile-changed',this.profileChanged);window.clearInterval(this.reminderTimer)}
 private async initializeRemoteState(){if(!accountSession())return;const scope=accountScope();await flush();if(scope!==accountScope())return;if(hasPending())return;await loadSubjectConfig();await flush();if(hasPending())return;await this.loadRemoteCards();await this.loadRemotePreferences();await Promise.all([this.loadRemoteHistory(),this.loadRemoteProgress(),this.loadStudyQueue()]);this.configChanged(subjectConfigs());}
 private api(path:string,options:RequestInit={}){return syncedApi(path,options)}
 private async loadStudyQueue(){const revision=writeRevision();try{const rows=await readRemoteStudyQueue(this.api.bind(this));if(rows&&!hasPending()&&revision===writeRevision()){this.studyItems.set(rows);cache('study-queue',this.studyItems())}}catch{}}
 openStudyForm(){this.editingStudyId.set(null);this.studyFormOpen.set(true);this.studyTitle.set('');this.studyNotes.set('');this.studyLink.set('');this.studyPriority.set('media');this.studySubject.set('')}
 editStudyItem(item:StudyItem){this.editingStudyId.set(item.id);this.studyTitle.set(item.title);this.studySubject.set(item.subject);this.studyNotes.set(item.notes||'');this.studyLink.set(item.link||'');this.studyPriority.set(item.priority);this.studyFormOpen.set(true)}
 closeStudyForm(){this.studyFormOpen.set(false);this.editingStudyId.set(null)}
 async saveStudyItem(){const title=this.studyTitle().trim();if(!title||this.studySaving())return;this.studyError.set('');try{const link=this.normalizeLink(this.studyLink());const id=this.editingStudyId();const old=this.studyItems().find(i=>i.id===id);const item:StudyItem={id:id||crypto.randomUUID(),title,subject:this.studySubject(),notes:this.studyNotes().trim(),link,priority:this.studyPriority(),status:old?.status||'todo',completed_at:old?.completed_at||null,created_at:old?.created_at||new Date().toISOString()};write('study_queue?on_conflict=id',item);this.studyItems.update(v=>upsertStudyItem(v,item,id));cache('study-queue',this.studyItems());this.closeStudyForm()}catch{this.studyError.set('Informe um link válido com http ou https.')}}

 normalizeLink(value:string){return normalizeStudyLink(value)}
 async addStudySubject(){const name=this.newSubjectName().trim();if(!name)return;if(this.subjectConfigs().some(s=>s.name.toLowerCase()===name.toLowerCase())){this.studyError.set('Já existe uma matéria com esse nome.');return}const item:ManagedSubject={id:crypto.randomUUID(),name,days:[],archived:false,deck_key:name};write('study_subjects?on_conflict=id',item);this.subjectConfigs.update(v=>[...v,item]);cache('study-subject-config',this.subjectConfigs());this.configChanged(this.subjectConfigs());this.studySubject.set(name);this.newSubjectName.set('');this.subjectFormOpen.set(false)}
 async completeStudyItem(item:StudyItem){if(item.status==='done')return;const completedAt=new Date().toISOString();write('rpc/complete_study_topic',{topic_id:item.id,finished_at:completedAt,study_date:today()});this.studyItems.update(v=>markStudyItemComplete(v,item.id,completedAt));cache('study-queue',this.studyItems());this.recordActivity((item.subject?item.subject+' — ':'')+item.title,'learning');}
 todoStudyItems=computed(()=>sortStudyItems(this.studyItems().filter(x=>x.status==='todo')));
 completedStudyItems=computed(()=>sortStudyItems(this.studyItems().filter(x=>x.status==='done'),true));
 private async loadRemoteHistory(){const revision=writeRevision();try{const rows=await readRemoteHistory(this.api.bind(this));if(!rows||hasPending()||revision!==writeRevision())return;this.history.set(rows);cache('study-history',this.history());}catch{}}
 private async loadRemoteProgress(){const revision=writeRevision();try{const rows=await readRemoteProgress(this.api.bind(this));if(!rows||hasPending()||revision!==writeRevision())return;if(rows.length){this.cards.set(mergeCardProgress(this.cards(),rows));cache('flashcards',this.cards());}}catch{}}
 private restoreCompletedReviewsFromHistory(){const reviewedToday=this.history().find(d=>d.date===today())?.reviews||[];if(!reviewedToday.length)return;const next=restoreCompletedReviews(this.cards(),reviewedToday,today(),addDays(1));this.cards.set(next);cache('flashcards',next);for(const card of next.filter(x=>x.due===addDays(1)&&x.interval===1))void this.saveRemoteProgress(card,'restored');}
 private saveRemoteProgress(card:Card,rating:string){write('seed_card_progress?on_conflict=card_id',{card_id:card.id,due:card.due,interval:card.interval,rating,last_reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()});}
 private recordActivity(label:string,kind:'learning'|'review'){const date=today();this.history.set(addStudyActivity(this.history(),date,label,kind));cache('study-history',this.history());if(kind==='review')write('study_activity?on_conflict=activity_date,kind,label',{activity_date:date,kind,label},'POST','resolution=ignore-duplicates,return=minimal')}
 private saveReview(label:string){this.recordActivity(label,'review')}
 subjectLabel(){const key=this.subject();return this.subjectConfigs().find(s=>(s.deck_key||s.name)===key)?.name||(key==='AWS'?'AWS IA':key)||''}
 reviewLabel(){const subject=this.subject();const topic=this.topic();const name=this.subjectLabel();return topic==='Todos'?name:`${name} — ${topic}`;}
 formatDate(date:string){const [y,m,d]=date.split('-');return `${d}/${m}/${y}`;}
 subjectCards=computed(()=>cardsForSubject(this.cards(),this.subject()));
 topics=computed(()=>cardTopics(this.subjectCards()));
 dueCards=computed(()=>dueReviewCards(this.cards(),this.subject(),this.topic(),today()));
 totalDue=computed(()=>this.cards().filter(c=>c.due<=today()&&this.activeSubjects().some(s=>(s.deck_key||s.name)===c.subject)).length);
 subjectDue=(subject:string)=>countDueCards(this.cards(),subject,today());
 subjectTotal=(subject:string)=>countSubjectCards(this.cards(),subject);
 subjectIcon(subject:string){return ({AWS:'☁',JavaScript:'JS','Padrões de Projeto':'▱',Angular:'A',React:'⚛',Arquitetura:'⌂',Java:'☕'} as Record<string,string>)[subject]||'•';}
 monthLabel=computed(()=>this.historyMonth().toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).replace(/^./,v=>v.toUpperCase()));
 calendarDays=computed(()=>buildCalendarDays(this.historyMonth(),this.history(),today()));
 selectedHistoryDay=computed(()=>this.history().find(d=>d.date===this.selectedHistoryDate())||null);
 studyDaysInMonth=computed(()=>countStudyDaysInMonth(this.historyMonth(),this.history()));
 changeHistoryMonth(offset:number){const d=this.historyMonth();this.historyMonth.set(new Date(d.getFullYear(),d.getMonth()+offset,1));this.selectedHistoryDate.set(null)}
 selectHistoryDate(date:string|null){if(date)this.selectedHistoryDate.set(date)}
 setTab(tab:'home'|'studyPlan'|'progress'|'history'|'settings'){this.activeTab.set(tab);if(tab==='home')this.deckPicker.set(false);if(tab==='history'&&!this.selectedHistoryDate()){const latest=this.history().find(d=>d.learning.length||d.reviews.length);if(latest){const dt=new Date(latest.date+'T12:00:00');this.historyMonth.set(new Date(dt.getFullYear(),dt.getMonth(),1));}}}
 sessionLimit=signal<number>(cached('review-session-limit',10));sessionIds=signal<number[]>([]);sessionPosition=signal(0);practice=signal(false);deckPicker=signal(false);syncStatus=syncStatus;
 subjectConfigs=subjectConfigs;
 streak=computed(()=>studyStreak(this.history(),today()));
 openDeck(name:string){if(this.subjectDue(name as any))this.openSubject(name as any);else this.openPractice(name)}
 todaysSubjects=computed(()=>subjectsForToday(this.subjectConfigs(),today()));
 activeSubjects=computed(()=>activeSubjects(this.subjectConfigs()));
 configChanged(value:ManagedSubject[]){this.subjectConfigs.set(value);this.studySubjects.set(value.filter(s=>!s.archived).map(s=>s.name))}
 nextTopic(name:string){return nextStudyItem(this.studyItems(),name)}
 pendingTopics(name:string){return pendingStudyItems(this.studyItems(),name).length}
 goToSubject(name:string){this.activeTab.set('studyPlan');setTimeout(()=>{const s=this.manager?.subjects().find(i=>i.name===name);if(s){this.manager?.openSubject(s);this.manager?.detailTab.set('topics')}},0)}
 setSessionLimit(value:number){this.sessionLimit.set(value);cache('review-session-limit',value);if(this.subject())this.startSession()}
 startSession(){const available=this.practice()?this.subjectCards().filter(c=>this.topic()==='Todos'||c.topic===this.topic()):this.dueCards();this.sessionIds.set(buildReviewSession(available,this.sessionLimit()));this.sessionPosition.set(0);this.flipped.set(false);this.explanationOpen.set(false)}
 card=computed(()=>this.cards().find(c=>c.id===this.sessionIds()[this.sessionPosition()]));
 progress=computed(()=>Math.min(this.sessionPosition()+1,this.sessionIds().length)+' / '+this.sessionIds().length);
 nextInterval(r:Rating){return intervalFor(this.card()?.interval||0,r)}
 backupMessage=signal('');
 async importBackup(event:Event){const input=event.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;try{if(file.size>5_000_000)throw new Error();const data=parseBackup(await file.text());for(const item of data.topics)if(item.link)this.normalizeLink(item.link);
 const incoming:Card[]=data.cards||(data.version===1?this.seed.filter(c=>data.progress.some((p:any)=>p.id===c.id)):[]);const cardMerge=mergeBackupCards(this.cards(),incoming);this.cards.set(cardMerge.cards);for(const card of cardMerge.added)write('account_cards',card);cache('flashcards',this.cards());
 const subjectMerge=mergeBackupSubjects(this.subjectConfigs(),data.subjects);for(const item of subjectMerge.added)write('study_subjects?on_conflict=id',item);this.configChanged(subjectMerge.subjects);cache('study-subject-config',subjectMerge.subjects);
 const topics=[...this.studyItems()];for(const raw of data.topics){if(topics.some(t=>t.id===raw.id))continue;const item:StudyItem={id:raw.id,title:raw.title,subject:raw.subject,notes:raw.notes,link:raw.link?this.normalizeLink(raw.link):null,priority:raw.priority,status:raw.status,completed_at:raw.completed_at,created_at:raw.created_at||new Date().toISOString()};topics.push(item);write('study_queue?on_conflict=id',item)}this.studyItems.set(topics);cache('study-queue',topics);
 // Existing reviewed cards are preserved. Restore only cards without recorded progress.
 this.cards.update(cards=>cards.map(c=>{const saved=data.progress.find((x:any)=>x.id===c.id);if(!saved||c.interval>0)return c;const restored={...c,due:saved.due,interval:saved.interval};this.saveRemoteProgress(restored,'restored');return restored}));cache('flashcards',this.cards());
 const mergedHistory=mergeBackupHistory(this.history(),data.history);this.history.set(mergedHistory);for(const day of data.history){for(const kind of ['learning','review'] as const){const labels=kind==='learning'?day.learning:day.reviews;for(const label of labels)write('study_activity?on_conflict=activity_date,kind,label',{activity_date:day.date,kind,label},'POST','resolution=ignore-duplicates,return=minimal')}}cache('study-history',this.history());this.backupMessage.set('Backup importado. Os dados atuais foram preservados.');}catch{this.backupMessage.set('Backup inválido. Nenhum dado foi importado.')}finally{input.value=''}}
 exportBackup(event:MouseEvent){const data=createBackup(this.cards(),this.subjectConfigs(),this.studyItems(),this.history());const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=event.currentTarget as HTMLAnchorElement;a.href=url;a.download='meus-estudos-'+today()+'.json';window.setTimeout(()=>URL.revokeObjectURL(url),60000)}
 private load():Card[]{return cached<Card[]>('flashcards',[])}
 openSubject(v:string){this.subject.set(v);this.topic.set('Todos');this.index.set(0);this.flipped.set(false);this.explanationOpen.set(false);this.practice.set(false);this.startSession()}
 back(){this.subject.set(null);this.topic.set('Todos');this.index.set(0);this.flipped.set(false);this.explanationOpen.set(false);this.activeTab.set('home')}
 choose(v:string){this.topic.set(v);this.startSession()}
 reveal(){this.flipped.set(!this.flipped());this.explanationOpen.set(false)}
 toggleExplanation(){this.explanationOpen.set(!this.explanationOpen())}
 openPractice(name:string){this.openSubject(name as any);this.practice.set(true);this.startSession()}
 rate(r:Rating){const c=this.card();if(!c)return;if(!this.practice()){const days=intervalFor(c.interval,r);const updated={...c,due:addDays(days),interval:days};this.cards.update(v=>v.map(x=>x.id===c.id?updated:x));cache('flashcards',this.cards());this.saveRemoteProgress(updated,r);this.saveReview(this.reviewLabel())}this.sessionPosition.update(v=>v+1);this.flipped.set(false);this.explanationOpen.set(false)}

 displayName=signal('');onboardingDismissed=signal(cached('onboarding-dismissed',false));legacyAvailable=signal(!!localStorage.getItem('flashcards')||!!localStorage.getItem('study-queue'));
 cardEditor=signal(false);cardDraft={id:0,subject:'',topic:'',question:'',answer:'',explanation:'',example:'',due:today(),interval:0};cardError=signal('');
 onboardingStep(){return onboardingStepFor(this.onboardingDismissed(),this.activeSubjects(),this.studyItems(),this.cards())}
 startFirstSubject(){this.setTab('studyPlan');setTimeout(()=>this.manager?.openNew(),0)}
 startFirstTopic(){const first=this.activeSubjects()[0];if(!first)return this.startFirstSubject();this.setTab('studyPlan');setTimeout(()=>{this.manager?.openSubject(first);if(this.manager)this.manager.detailTab.set('topics');this.openTopicForm(first.name)},0)}
 startFirstRoutine(){const first=this.activeSubjects()[0];if(!first)return this.startFirstSubject();this.setTab('studyPlan');setTimeout(()=>this.manager?.edit(first),0)}
 startFirstCard(){const first=this.activeSubjects()[0];if(!first)return this.startFirstSubject();this.setTab('studyPlan');setTimeout(()=>this.openCardEditor(first.deck_key||first.name),0)}
 dismissOnboarding(){cache('onboarding-dismissed',true);this.onboardingDismissed.set(true)}
 openCardEditor(subject:string,card?:any){this.cardDraft=card?{...card}:{id:0,subject,topic:'',question:'',answer:'',explanation:'',example:'',due:today(),interval:0};this.cardError.set('');this.cardEditor.set(true)}
 saveCard(){const draft=this.cardDraft;let card:Card;try{card=createCard(draft)}catch{this.cardError.set('Preencha o baralho, o tópico, a pergunta e a resposta.');return}if(this.requireAccount({type:'card',card:{...draft}}))return;this.cards.update(v=>upsertCard(v,card));cache('flashcards',this.cards());write('account_cards',card);this.cardEditor.set(false)}
 async loadRemotePreferences(){try{const p=await readRemotePreferences(this.api.bind(this));if(p&&!hasPending()){if(typeof p.display_name==='string'){cache('display-name',p.display_name);this.displayName.set(p.display_name)}if(typeof p.reminder_time==='string')cache('reminder-time',p.reminder_time);if(Array.isArray(p.reminder_days))cache('reminder-days',p.reminder_days)}}catch{}}
 async loadRemoteCards(){const revision=writeRevision();try{const cards=await readRemoteCards(this.api.bind(this));if(cards&&!hasPending()&&revision===writeRevision()){this.cards.set(cards);cache('flashcards',this.cards())}}catch{}}
 installExamples(){for(const name of Array.from(new Set(this.seed.map(c=>c.subject)))){if(!this.subjectConfigs().some(s=>(s.deck_key||s.name)===name)){const subject={id:crypto.randomUUID(),name:name==='AWS'?'AWS IA':name,deck_key:name,days:[],archived:false};this.subjectConfigs.update(v=>[...v,subject]);write('study_subjects',subject)}}for(const card of this.seed){if(!this.cards().some(c=>c.id===card.id)){const fresh={...card,due:today(),interval:0};this.cards.update(v=>[...v,fresh]);write('account_cards',fresh)}}cache('flashcards',this.cards());cache('study-subject-config',this.subjectConfigs());this.configChanged(this.subjectConfigs());this.backupMessage.set('Biblioteca de exemplo adicionada. Nenhum histórico pessoal foi importado.');this.dismissOnboarding()}
 async recoverLegacy(){try{const topics=JSON.parse(localStorage.getItem('study-queue')||'[]');const subjects=JSON.parse(localStorage.getItem('study-subject-config')||'[]');const cards=JSON.parse(localStorage.getItem('flashcards')||'[]');const data={version:2,subjects,topics,cards,progress:cards.map((c:any)=>({id:c.id,due:c.due,interval:c.interval})),history:JSON.parse(localStorage.getItem('study-history')||'[]')};const file=new File([JSON.stringify(data)],'estudos-anteriores.json',{type:'application/json'});await this.importBackup({target:{files:[file],value:''}} as unknown as Event)}catch{this.backupMessage.set('Não foi possível recuperar. Use um arquivo de backup.')}}
 private checkReminder(){const enabled=cached('browser-reminders',false);const granted=('Notification' in window)&&Notification.permission==='granted';const date=new Date();const local=date.toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'});const days=cached<number[]>('reminder-days',[0,1,2,3,4,5,6]);const day=new Date(today()+'T12:00:00').getDay();if(!shouldShowReminder({enabled,permissionGranted:granted,localTime:local,currentDay:day,allowedDays:days,configuredTime:cached('reminder-time','20:00'),shownToday:cached('reminder-shown','')===today()}))return;cache('reminder-shown',today());const n=new Notification('Seu momento de aprender',{body:'Faça uma pequena sessão de revisão.',tag:'study-reminder'});n.onclick=()=>{window.focus();this.setTab('home');n.close()}}

}