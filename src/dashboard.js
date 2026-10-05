(() => {
  let enhancing = false;
  const storageKey = 'study-subject-config';
  const defaults = [
    {id:'aws',name:'AWS IA',days:[1,2,3,4,5,6,0],archived:false},
    {id:'javascript',name:'JavaScript',days:[1,2,3,4,5,6,0],archived:false},
    {id:'patterns',name:'Padrões de Projeto',days:[],archived:false},
    {id:'angular',name:'Angular',days:[],archived:false},
    {id:'react',name:'React',days:[],archived:false},
    {id:'architecture',name:'Arquitetura',days:[],archived:false},
    {id:'java',name:'Java',days:[],archived:false}
  ];
  const configs = () => { try { const v=JSON.parse(localStorage.getItem(storageKey)||'null'); return Array.isArray(v)?v:defaults; } catch { return defaults; } };
  const findNav = (label) => [...document.querySelectorAll('.bottom-nav button')].find(btn => btn.textContent?.includes(label));
  const subjectClass = name => name==='AWS IA'?'aws':name==='JavaScript'?'js':'college';
  const subjectIcon = name => name==='AWS IA'?'aws':name==='JavaScript'?'JS':'◆';
  const originalName = name => name==='AWS IA'?'AWS':name;

  function enhanceHome() {
    if (enhancing) return;
    const home = document.querySelector('.home-page');
    if (!home || home.dataset.dashboardEnhanced === 'true') return;
    enhancing = true;
    const originalSubjects = [...home.querySelectorAll('.subject-card')];
    const byName = name => originalSubjects.find(btn => btn.textContent?.includes(name));
    const totalDue = originalSubjects.reduce((sum, btn) => { const m=btn.textContent?.match(/(\d+)\s+cards?/i); return sum+(m?Number(m[1]):0); },0);
    const hiddenActions=document.createElement('div'); hiddenActions.className='dashboard-original-actions'; originalSubjects.forEach(btn=>hiddenActions.appendChild(btn));
    const date=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'long'}).format(new Date());
    const today=new Date().getDay();
    const todays=configs().filter(s=>!s.archived&&s.days.includes(today));
    const rows=todays.map(s=>`<button class="daily-subject ${subjectClass(s.name)}" data-subject="${s.name}" type="button"><span class="daily-subject-icon">${subjectIcon(s.name)}</span><span><b>${s.name}</b><small>Programada para hoje</small></span><strong>›</strong></button>`).join('');
    home.innerHTML=`<header class="daily-header"><div><h1>Bom dia!</h1><p>Esta é sua rotina de hoje.</p></div><button class="daily-settings" type="button" aria-label="Configurações">⚙</button></header><div class="daily-date">▣ <span>${date}</span></div><section class="daily-section"><h2>Sua rotina de hoje</h2><button class="review-today-card" type="button"><span class="daily-card-icon">▣</span><span><b>Revisar flashcards</b><small>${totalDue} ${totalDue===1?'card pendente':'cards pendentes'}</small></span><strong>›</strong></button></section><section class="daily-section"><div class="daily-section-title"><h2>Matérias de hoje</h2><span>${todays.length}</span></div><div class="daily-subjects">${rows||'<div class="daily-empty">Nenhuma matéria programada para hoje.</div>'}</div></section><p class="daily-hint">A rotina é definida em Configurações → Matérias.</p>`;
    home.appendChild(hiddenActions); home.dataset.dashboardEnhanced='true';
    home.querySelector('.daily-settings')?.addEventListener('click',()=>findNav('Configurações')?.click());
    home.querySelector('.review-today-card')?.addEventListener('click',()=>{const firstDue=originalSubjects.find(btn=>/[1-9]\d*\s+cards?/i.test(btn.textContent||''))||byName('AWS')||originalSubjects[0];firstDue?.click();});
    home.querySelectorAll('.daily-subject').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.getAttribute('data-subject')||'';const target=byName(originalName(name));if(target)target.click();else findNav('A estudar')?.click();}));
    enhancing=false;
  }
  const observer=new MutationObserver(()=>requestAnimationFrame(enhanceHome)); observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('subject-config-changed',()=>{const home=document.querySelector('.home-page');if(home)home.dataset.dashboardEnhanced='false';requestAnimationFrame(enhanceHome);});
  window.addEventListener('DOMContentLoaded',enhanceHome); requestAnimationFrame(enhanceHome);
})();