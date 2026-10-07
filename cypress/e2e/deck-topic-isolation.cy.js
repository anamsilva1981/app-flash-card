const subjects=['Angular','JavaScript','React'].map(name=>({id:name.toLowerCase(),name,deck_key:name,days:[0,1,2,3,4,5,6],archived:false,routine_initialized:true}));
const topic=(id,title,subject)=>({id,title,subject,notes:'',link:null,priority:'media',status:'todo',completed_at:null});
const queue=[topic('js-numbers','3.2 Números','JavaScript'),topic('angular-signals','Signals','Angular')];

function openDeck(name){
  cy.contains('.subject-main',name).click();
  cy.contains('.detail-head h2',name).should('be.visible');
}

describe('Isolamento dos tópicos por baralho',()=>{
  it('mantém a lista geral somente na visão de baralhos e não mostra JavaScript dentro de React',()=>{
    cy.loginApp({subjects,queue});
    cy.contains('nav button','Estudar').click();
    cy.contains('.inbox-list summary','Todos os tópicos pendentes · 2').click();
    cy.contains('.inbox-list','3.2 Números').should('be.visible');
    openDeck('React');
    cy.get('.inbox-list').should('not.exist');
    cy.contains('Nenhum flashcard cadastrado neste baralho.').should('be.visible');
    cy.contains('button','Tópicos').click();
    cy.contains('Nenhum tópico pendente neste baralho.').should('be.visible');
    cy.contains('3.2 Números').should('not.exist');
    cy.contains('Signals').should('not.exist');
    cy.get('button[aria-label="Voltar aos baralhos"]').click();
    cy.get('.inbox-list').should('exist');
    openDeck('JavaScript');
    cy.get('.inbox-list').should('not.exist');
    cy.contains('button','Tópicos').click();
    cy.contains('.topic-list','3.2 Números').should('be.visible');
    cy.contains('Signals').should('not.exist');
  });

  it('mostra somente os tópicos do baralho selecionado ao alternar entre eles',()=>{
    cy.loginApp({subjects,queue:[...queue,topic('react-hooks','Hooks do React','React')]});
    cy.contains('nav button','Estudar').click();
    openDeck('React');
    cy.get('.inbox-list').should('not.exist');
    cy.contains('button','Tópicos').click();
    cy.contains('.topic-list','Hooks do React').should('be.visible');
    cy.contains('3.2 Números').should('not.exist');
    cy.contains('Signals').should('not.exist');
    cy.get('button[aria-label="Voltar aos baralhos"]').click();
    openDeck('Angular');
    cy.get('.inbox-list').should('not.exist');
    cy.contains('button','Tópicos').click();
    cy.contains('.topic-list','Signals').should('be.visible');
    cy.contains('Hooks do React').should('not.exist');
    cy.contains('3.2 Números').should('not.exist');
  });
});
