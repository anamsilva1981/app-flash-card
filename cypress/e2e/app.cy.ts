describe('App Flash Card - fluxos principais', () => {
  beforeEach(() => {
    cy.intercept('**/auth/v1/token**', { statusCode: 400, body: { error: 'mocked' } }).as('auth');
    cy.visit('/');
  });

  it('permite entrar e navegar como visitante sem cadastro obrigatório', () => {
    cy.contains('Início').should('be.visible');
    cy.contains('Estudar').should('be.visible');
    cy.contains('Histórico').should('be.visible');
    cy.contains('Perfil').should('be.visible');
  });

  it('abre a área de revisão de flashcards', () => {
    cy.contains(/Começar revisão|Explorar flashcards/).click();
    cy.contains('Revisar flashcards').should('be.visible');
  });

  it('abre a tela Estudar e permite iniciar a criação de tópico', () => {
    cy.contains('button', 'Estudar').click();
    cy.contains('Estudar').should('be.visible');
    cy.contains(/Adicionar um tópico|Adicionar tópico/).first().click({ force: true });
    cy.contains('Adicionar tópico').should('be.visible');
  });

  it('valida os campos obrigatórios ao criar flashcard', () => {
    cy.contains('button', 'Estudar').click();
    cy.get('app-subject-manager').should('exist');
    cy.get('app-subject-manager').find('button').filter(':contains("flashcard")').first().click({ force: true });
    cy.contains('Criar flashcard').should('be.visible');
    cy.contains('button', 'Salvar flashcard').click();
    cy.contains('Preencha a matéria, o tópico, a pergunta e a resposta.').should('be.visible');
  });

  it('pede criação de conta somente quando visitante tenta salvar um card válido', () => {
    cy.contains('button', 'Estudar').click();
    cy.get('app-subject-manager').find('button').filter(':contains("flashcard")').first().click({ force: true });
    cy.contains('Criar flashcard').should('be.visible');
    cy.get('.card-editor').within(() => {
      cy.get('input').first().type('Cypress');
      cy.get('textarea').eq(0).type('O que é um teste E2E?');
      cy.get('textarea').eq(1).type('Um teste do fluxo completo.');
      cy.contains('button', 'Salvar flashcard').click();
    });
    cy.contains('Seu próximo aprendizado começa aqui').should('be.visible');
    cy.contains('Criar conta').should('be.visible');
  });

  it('abre Histórico e Perfil', () => {
    cy.contains('button', 'Histórico').click();
    cy.contains('Evolução').should('be.visible');
    cy.contains('button', 'Perfil').click();
    cy.contains('Configurações').should('be.visible');
  });
});
