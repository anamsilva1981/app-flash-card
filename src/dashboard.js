(() => {
  let enhancing = false;

  const findNav = (label) => [...document.querySelectorAll('.bottom-nav button')]
    .find(btn => btn.textContent?.includes(label));

  function enhanceHome() {
    if (enhancing) return;
    const home = document.querySelector('.home-page');
    if (!home || home.dataset.dashboardEnhanced === 'true') return;
    enhancing = true;

    const originalSubjects = [...home.querySelectorAll('.subject-card')];
    const byName = (name) => originalSubjects.find(btn => btn.textContent?.includes(name));
    const due = (name) => {
      const btn = byName(name);
      const match = btn?.textContent?.match(/(\d+)\s+cards?/i);
      return match ? Number(match[1]) : 0;
    };
    const totalDue = originalSubjects.reduce((sum, btn) => {
      const match = btn.textContent?.match(/(\d+)\s+cards?/i);
      return sum + (match ? Number(match[1]) : 0);
    }, 0);

    const hiddenActions = document.createElement('div');
    hiddenActions.className = 'dashboard-original-actions';
    originalSubjects.forEach(btn => hiddenActions.appendChild(btn));

    const date = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long'
    }).format(new Date());

    home.innerHTML = `
      <header class="daily-header">
        <div><h1>Bom dia!</h1><p>Esta é sua rotina de hoje.</p></div>
        <button class="daily-settings" type="button" aria-label="Configurações">⚙</button>
      </header>
      <div class="daily-date">▣ <span>${date}</span></div>

      <section class="daily-section">
        <h2>Sua rotina de hoje</h2>
        <button class="review-today-card" type="button">
          <span class="daily-card-icon">▣</span>
          <span><b>Revisar flashcards</b><small>${totalDue} ${totalDue === 1 ? 'card pendente' : 'cards pendentes'}</small></span>
          <strong>›</strong>
        </button>
      </section>

      <section class="daily-section">
        <div class="daily-section-title"><h2>Matérias de hoje</h2><span>3</span></div>
        <div class="daily-subjects">
          <button class="daily-subject aws" data-subject="AWS" type="button">
            <span class="daily-subject-icon">aws</span><span><b>AWS IA</b><small>Estudo diário</small></span><strong>›</strong>
          </button>
          <button class="daily-subject js" data-subject="JavaScript" type="button">
            <span class="daily-subject-icon">JS</span><span><b>JavaScript</b><small>Estudo diário</small></span><strong>›</strong>
          </button>
          <button class="daily-subject college" data-subject="Faculdade" type="button">
            <span class="daily-subject-icon">◆</span><span><b>Faculdade</b><small>Matéria programada para hoje</small></span><strong>›</strong>
          </button>
        </div>
      </section>
      <p class="daily-hint">Toque em uma matéria para ver os tópicos a estudar por prioridade.</p>
    `;
    home.appendChild(hiddenActions);
    home.dataset.dashboardEnhanced = 'true';

    home.querySelector('.daily-settings')?.addEventListener('click', () => findNav('Configurações')?.click());
    home.querySelector('.review-today-card')?.addEventListener('click', () => {
      const firstDue = originalSubjects.find(btn => /[1-9]\d*\s+cards?/i.test(btn.textContent || '')) || byName('AWS') || originalSubjects[0];
      firstDue?.click();
    });
    home.querySelectorAll('.daily-subject').forEach(btn => btn.addEventListener('click', () => {
      const subject = btn.getAttribute('data-subject');
      if (subject === 'Faculdade') {
        findNav('A estudar')?.click();
        return;
      }
      byName(subject || '')?.click();
    }));
    enhancing = false;
  }

  const observer = new MutationObserver(() => requestAnimationFrame(enhanceHome));
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', enhanceHome);
  requestAnimationFrame(enhanceHome);
})();