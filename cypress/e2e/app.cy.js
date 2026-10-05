describe('Telas e fluxos principais do produto',()=>{
  beforeEach(()=>cy.loginApp());

  it('cobre Home e seletor de revisão',()=>{
    cy.contains('SUA REVISÃO DIÁRIA').should('be.visible');
    cy.contains('Baralhos do dia').should('be.visible');
    cy.contains('Angular').should('be.visible');
    cy.contains('button',/Começar revisão|Explorar flashcards/).click();
    cy.contains('Revisar flashcards').should('be.visible');
    cy.get('button[aria-label="Voltar"]').click();
    cy.contains('Baralhos do dia').should('be.visible');
  });

  it('cobre Estudar, baralhos, tópicos e criação de tópico',()=>{
    cy.contains('nav button','Estudar').click();
    cy.contains('h1','Estudar').should('be.visible');
    cy.contains('ROTINA DE ESTUDOS').filter(':visible').should('have.length.at.least',1);
    cy.contains('button','Angular').click();
    cy.contains('button','Tópicos').click();
    cy.contains('Signals').filter(':visible').should('have.length.at.least',1);
    cy.contains('button','Adicionar').click();
    cy.contains('Adicionar tópico').should('be.visible');
    cy.get('input[placeholder="Ex.: Template Literals"]').type('Standalone Components');
    cy.contains('button','Alta').click();
    cy.contains('button','Adicionar').last().click();
    cy.contains('Standalone Components').should('exist');
  });

  it('cobre criação e edição visual de flashcard',()=>{
    cy.contains('nav button','Estudar').click();
    cy.contains('button','Angular').click();
    cy.contains('button','Criar card').click();
    cy.contains('Criar flashcard').should('be.visible');
    cy.get('.card-editor input[placeholder="Ex.: Fundamentos"]').type('Angular moderno');
    cy.get('.card-editor textarea').eq(0).type('O que é um Signal?');
    cy.get('.card-editor textarea').eq(1).type('Um primitivo reativo do Angular.');
    cy.get('.card-editor textarea').eq(2).type('Signals notificam consumidores quando o valor muda.');
    cy.get('.card-editor textarea').eq(3).type('const count = signal(0)');
    cy.contains('button','Salvar flashcard').click();
    cy.contains('O que é um Signal?').should('exist');
    cy.contains('button','Editar').first().click();
    cy.contains('Editar flashcard').should('be.visible');
    cy.get('.card-editor textarea').eq(1).clear().type('Um valor reativo que notifica consumidores.');
    cy.contains('button','Salvar flashcard').click();
    cy.contains('Um valor reativo que notifica consumidores.').should('exist');
  });

  it('cobre Histórico e calendário',()=>{
    cy.contains('nav button','Histórico').click();
    cy.contains('h1','Histórico').should('be.visible');
    cy.contains('Calendário').should('be.visible');
    cy.get('.calendar-grid button').filter(':not([disabled])').first().click();
    cy.contains(/Estudado|Revisado|Nenhum registro/).should('exist');
  });

  it('cobre Perfil, lembretes, privacidade, suporte e exclusão',()=>{
    cy.contains('nav button','Perfil').click();
    cy.contains('h1','Perfil').should('be.visible');
    cy.contains('Lembretes').should('be.visible');
    cy.contains('Privacidade').should('be.visible');
    cy.contains('Suporte').should('be.visible');
    cy.contains('Excluir conta').should('be.visible');
  });

  it('cobre revisão de flashcards e avaliação',()=>{
    cy.contains('button',/Começar revisão|Explorar flashcards/).click();
    cy.contains('button','Angular').click();
    cy.contains(/PERGUNTA|RESPOSTA/).should('be.visible');
    cy.contains('button','Virar card').click();
    cy.contains('button','Sei').should('be.visible').click();
  });

  it('mantém layout principal utilizável em viewport mobile',()=>{
    cy.viewport(390,844);
    cy.contains('SUA REVISÃO DIÁRIA').should('be.visible');
    cy.get('nav').should('be.visible');
    cy.contains('nav button','Estudar').should('be.visible');
  });
});
