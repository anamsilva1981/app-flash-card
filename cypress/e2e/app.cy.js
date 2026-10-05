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
    cy.contains('ROTINA DE ESTUDOS').should('be.visible');
    cy.contains('button','Angular').click();
    cy.contains('button','Tópicos').click();
    cy.contains('Signals').should('be.visible');
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
  });

  it('cobre Histórico e calendário',()=>{
    cy.contains('nav button','Histórico').click();
    cy.contains('h1','Evolução').should('be.visible');
    cy.contains('Dias com atividade').should('be.visible');
    cy.contains('Aprendizado').should('exist');
    cy.get('button[aria-label="Mês anterior"]').should('be.visible');
    cy.get('button[aria-label="Próximo mês"]').should('be.visible');
  });

  it('cobre Perfil, lembretes, privacidade, suporte e exclusão',()=>{
    cy.contains('nav button','Perfil').click();
    cy.contains('h1','Configurações').should('be.visible');
    cy.contains('Sua conta').should('be.visible');
    cy.contains('Seu horário de estudo').should('be.visible');
    cy.contains('Privacidade e suporte').should('be.visible');
    cy.contains('Excluir conta').should('be.visible');
    cy.get('textarea[placeholder="Descreva o que precisa"]').type('Teste automatizado de suporte.');
    cy.contains('button','Registrar solicitação').click();
    cy.contains('Solicitação registrada').should('be.visible');
    cy.contains('button','Quero excluir minha conta').click();
    cy.contains('Digite EXCLUIR para confirmar').should('be.visible');
    cy.contains('button','Cancelar').click();
  });

  it('cobre revisão de flashcards e avaliação',()=>{
    cy.contains('nav button','Estudar').click();
    cy.contains('button','Angular').click();
    cy.contains('button',/Revisar agora|Revisar novamente/).click();
    cy.contains('Progresso da sessão').should('be.visible');
    cy.contains('button','Virar card').click();
    cy.contains('button','Entender melhor').should('be.visible');
    cy.contains('button','Sei').should('be.visible').click();
  });

  it('mantém layout principal utilizável em viewport mobile',()=>{
    cy.viewport(360,740);
    cy.contains('Baralhos do dia').should('be.visible');
    cy.get('nav[aria-label="Navegação principal"]').should('be.visible');
    cy.contains('nav button','Perfil').should('be.visible');
  });
});
