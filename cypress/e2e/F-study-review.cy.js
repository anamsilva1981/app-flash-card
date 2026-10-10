describe("Parte F — estudo e revisão", () => {
  it("revisa um flashcard, vira o card e registra avaliação", () => {
    cy.loginApp();
    cy.contains("nav button", "Estudar").click();
    cy.contains("button", "Angular").click();
    cy.contains("button", "Criar card").click();
    cy.get('[data-cy="card-topic"]').type("Revisão E2E");
    cy.get('[data-cy="card-question"]').type("Pergunta para revisão?");
    cy.get('[data-cy="card-answer"]').type("Resposta para revisão.");
    cy.get('[data-cy="card-think"]').type(
      "Associe a resposta a uma situação conhecida.",
    );
    cy.get('[data-cy="card-save"]').click();

    cy.contains("button", /Revisar agora|Revisar novamente/).click();
    cy.contains("Progresso da sessão").should("be.visible");
    cy.contains("Pergunta para revisão?").should("be.visible");
    cy.contains("button", "Virar card").click();
    cy.contains("Resposta para revisão.").should("be.visible");
    cy.contains("button", "Entender melhor").click();
    cy.contains("PENSA ASSIM").should("be.visible");
    cy.contains("Associe a resposta a uma situação conhecida.").should(
      "be.visible",
    );
    cy.contains("button", "Sei").click();
  });

  it("revisa conteúdo persistido da conta", () => {
    const card = {
      id: 901,
      subject: "Angular",
      topic: "Persistência",
      question: "Qual dado foi salvo?",
      answer: "O conteúdo da conta.",
      explanation: "",
      example: "",
      think: "Pense no card voltando depois do reload.",
      due: "2000-01-01",
      interval: 0,
    };
    cy.loginApp({ cards: [card] });
    cy.contains("nav button", "Estudar").click();
    cy.contains("button", "Angular").click();
    cy.contains("button", "Revisar agora").click();
    cy.contains("Qual dado foi salvo?").should("be.visible");
    cy.contains("button", "Virar card").click();
    cy.contains("O conteúdo da conta.").should("be.visible");
    cy.contains("button", "Entender melhor").click();
    cy.contains("Pense no card voltando depois do reload.").should(
      "be.visible",
    );
  });
});
