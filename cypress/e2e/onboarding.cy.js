describe('Aviso para criar o primeiro tópico',()=>{
  it('desaparece no primeiro clique, mesmo sem salvar, e permanece oculto ao recarregar',()=>{
    cy.loginApp({queue:[]});
    cy.contains('.onboarding h2','Adicione o primeiro tópico').should('be.visible');
    cy.contains('.onboarding button','Adicionar tópico').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('button[aria-label="Fechar formulário"]').click();
    cy.contains('nav button','Início').click();
    cy.get('.onboarding').should('not.exist');
    cy.reload();
    cy.contains('Olá, Teste E2E!').should('be.visible');
    cy.get('.onboarding').should('not.exist');
  });

  it('permite salvar o tópico e mantém o aviso oculto',()=>{
    cy.loginApp({queue:[]});
    cy.contains('.onboarding button','Adicionar tópico').click();
    cy.get('input[placeholder="Ex.: Template Literals"]').type('Primeiro tópico');
    cy.get('[role="dialog"] button.primary-action').click();
    cy.contains('Primeiro tópico').should('exist');
    cy.contains('nav button','Início').click();
    cy.get('.onboarding').should('not.exist');
    cy.reload();
    cy.contains('Olá, Teste E2E!').should('be.visible');
    cy.get('.onboarding').should('not.exist');
  });

  it('não pede o primeiro tópico quando ele já existe em outro baralho',()=>{
    cy.loginApp({queue:[{id:'existing-topic',title:'Promises',subject:'JavaScript',notes:'',link:null,priority:'media',status:'todo',completed_at:null}]});
    cy.contains('nav button','Estudar').click();
    cy.contains('button','JavaScript').click();
    cy.contains('button','Tópicos').click();
    cy.contains('Promises').should('be.visible');
    cy.contains('nav button','Início').click();
    cy.contains('.onboarding h2','Adicione o primeiro tópico').should('not.exist');
  });
});


describe('Aviso para criar o primeiro flashcard',()=>{
  it('desaparece no primeiro clique e não volta mesmo ao fechar sem salvar',()=>{
    cy.loginApp();
    cy.contains('.onboarding h2','Crie seu primeiro flashcard').should('be.visible');
    cy.contains('.onboarding button','Criar primeiro flashcard').click();
    cy.get('.card-editor').should('be.visible');
    cy.get('button[aria-label="Fechar editor de flashcard"]').click();
    cy.contains('nav button','Início').click();
    cy.get('.onboarding').should('not.exist');
    cy.reload();
    cy.contains('Olá, Teste E2E!').should('be.visible');
    cy.get('.onboarding').should('not.exist');
  });

  it('encerra os primeiros passos ao cadastrar um card por outro baralho',()=>{
    cy.loginApp();
    cy.contains('.onboarding h2','Crie seu primeiro flashcard').should('be.visible');
    cy.contains('nav button','Estudar').click();
    cy.contains('button','JavaScript').click();
    cy.contains('button','Criar card').click();
    cy.get('.card-editor input[placeholder="Ex.: Fundamentos"]').type('Promises');
    cy.get('.card-editor textarea').eq(0).type('O que é uma Promise?');
    cy.get('.card-editor textarea').eq(1).type('Representa um resultado assíncrono.');
    cy.contains('button','Salvar flashcard').click();
    cy.contains('O que é uma Promise?').should('exist');
    cy.contains('nav button','Início').click();
    cy.get('.onboarding').should('not.exist');
    cy.reload();
    cy.contains('Olá, Teste E2E!').should('be.visible');
    cy.get('.onboarding').should('not.exist');
  });

  it('reconhece um card já cadastrado em outro baralho sem depender do aviso salvo',()=>{
    cy.loginApp({queue:[],cards:[{id:501,subject:'JavaScript',topic:'Promises',question:'O que é uma Promise?',answer:'Um resultado assíncrono.',explanation:'',example:'',due:'2099-01-01',interval:0}]});
    cy.contains('nav button','Estudar').click();
    cy.contains('button','JavaScript').click();
    cy.contains('O que é uma Promise?').should('exist');
    cy.contains('nav button','Início').click();
    cy.get('.onboarding').should('not.exist');
    cy.reload();
    cy.contains('Olá, Teste E2E!').should('be.visible');
    cy.get('.onboarding').should('not.exist');
  });
});
