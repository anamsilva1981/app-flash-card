import { Component, signal } from '@angular/core';

interface ManagedSubject {
  id: string;
  name: string;
  days: number[];
  archived: boolean;
}

@Component({
  selector: 'app-subject-manager',
  standalone: true,
  templateUrl: './subject-manager.component.html',
  styleUrl: './subject-manager.component.css'
})
export class SubjectManagerComponent {
  readonly week = [
    { value: 1, short: 'Seg' }, { value: 2, short: 'Ter' }, { value: 3, short: 'Qua' },
    { value: 4, short: 'Qui' }, { value: 5, short: 'Sex' }, { value: 6, short: 'Sáb' }, { value: 0, short: 'Dom' }
  ];
  subjects = signal<ManagedSubject[]>(this.load());
  formOpen = signal(false);
  editingId = signal<string|null>(null);
  name = signal('');
  selectedDays = signal<number[]>([]);
  showArchived = signal(false);

  private defaults(): ManagedSubject[] {
    return [
      {id:'aws',name:'AWS IA',days:[1,2,3,4,5,6,0],archived:false},
      {id:'javascript',name:'JavaScript',days:[1,2,3,4,5,6,0],archived:false},
      {id:'patterns',name:'Padrões de Projeto',days:[],archived:false},
      {id:'angular',name:'Angular',days:[],archived:false},
      {id:'react',name:'React',days:[],archived:false},
      {id:'architecture',name:'Arquitetura',days:[],archived:false},
      {id:'java',name:'Java',days:[],archived:false}
    ];
  }
  private load(): ManagedSubject[] {
    try { const saved=JSON.parse(localStorage.getItem('study-subject-config')||'null'); return Array.isArray(saved)?saved:this.defaults(); }
    catch { return this.defaults(); }
  }
  private persist(){localStorage.setItem('study-subject-config',JSON.stringify(this.subjects()));window.dispatchEvent(new CustomEvent('subject-config-changed'));}
  visibleSubjects(){return this.subjects().filter(s=>s.archived===this.showArchived());}
  openNew(){this.editingId.set(null);this.name.set('');this.selectedDays.set([]);this.formOpen.set(true);}
  edit(item:ManagedSubject){this.editingId.set(item.id);this.name.set(item.name);this.selectedDays.set([...item.days]);this.formOpen.set(true);}
  close(){this.formOpen.set(false);this.editingId.set(null);}
  toggleDay(day:number){this.selectedDays.update(v=>v.includes(day)?v.filter(x=>x!==day):[...v,day]);}
  save(){const name=this.name().trim();if(!name)return;const id=this.editingId();if(id){this.subjects.update(v=>v.map(s=>s.id===id?{...s,name,days:[...this.selectedDays()]}:s));}else{this.subjects.update(v=>[...v,{id:crypto.randomUUID(),name,days:[...this.selectedDays()],archived:false}]);}this.persist();this.close();}
  archive(item:ManagedSubject){this.subjects.update(v=>v.map(s=>s.id===item.id?{...s,archived:true}:s));this.persist();}
  restore(item:ManagedSubject){this.subjects.update(v=>v.map(s=>s.id===item.id?{...s,archived:false}:s));this.persist();}
  dayLabel(days:number[]){if(days.length===7)return 'Todos os dias';if(!days.length)return 'Sem dias definidos';return this.week.filter(d=>days.includes(d.value)).map(d=>d.short).join(', ');}
}