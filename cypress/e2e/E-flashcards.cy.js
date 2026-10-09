describe("Parte E — criação e edição de flashcards", () => {
  beforeEach(() => cy.loginApp());

  it("cria e edita um flashcard", () => {
    cy.contains("nav button", "Estudar").click();
    cy.contains("button", "Angular").click();
    cy.contains("button", "Criar card").click();

    cy.get('[data-cy="card-topic"]').type("Angular moderno");
    cy.get('[data-cy="card-question"]').type("O que é um Signal?");
    cy.get('[data-cy="card-answer"]').type("Um primitivo reativo do Angular.");
    cy.get('[data-cy="card-think"]').type("Pense em uma variável que avisa seus consumidores quando muda.");
    cy.get('[data-cy="card-save"]').click();
    cy.contains("O que é um Signal?").should("exist");

    cy.get('[aria-label="Editar flashcard: O que é um Signal?"]').click();
    cy.contains("Editar flashcard").should("be.visible");
    cy.get('[data-cy="card-question"]')
      .clear()
      .type("Como funciona um Signal?");
    cy.get('[data-cy="card-answer"]')
      .clear()
      .type("Ele notifica consumidores quando seu valor muda.");
    cy.get('[data-cy="card-save"]').click();

    cy.contains("Como funciona um Signal?").should("exist");
    cy.contains("O que é um Signal?").should("not.exist");
  });

  it("rejeita flashcard inválido sem salvar conteúdo incompleto", () => {
    cy.contains("nav button", "Estudar").click();
    cy.contains("button", "Angular").click();
    cy.contains("button", "Criar card").click();
    cy.get('[data-cy="card-save"]').click();
    cy.contains("Preencha o baralho, o tópico, a pergunta e a resposta.").should("be.visible");
  });
});
