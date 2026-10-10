describe("Parte C — criação e edição de matérias", () => {
  beforeEach(() => cy.loginApp());

  it("cria, edita, arquiva e restaura um baralho", () => {
    cy.contains("nav button", "Estudar").click();
    cy.contains("h2", "Baralhos").should("be.visible");

    cy.contains("button", "Nova").click();
    cy.get(".subject-form").should("be.visible");
    cy.get(".subject-form input").clear().type("Arquitetura Frontend");
    cy.contains(".subject-form button", "Salvar baralho").click();
    cy.contains(".subject-row", "Arquitetura Frontend").should("be.visible");

    cy.get('[aria-label="Editar baralho: Arquitetura Frontend"]').click();
    cy.get(".subject-form input").clear().type("Arquitetura Web");
    cy.contains(".subject-form button", "Salvar baralho").click();
    cy.contains(".subject-row", "Arquitetura Web").should("be.visible");
    cy.contains("Arquitetura Frontend").should("not.exist");

    cy.get('[aria-label="Arquivar baralho: Arquitetura Web"]').click();
    cy.contains("button", "Arquivadas").click();
    cy.contains(".subject-row", "Arquitetura Web").should("be.visible");
    cy.contains(".subject-row", "Arquitetura Web").within(() => {
      cy.contains("button", "Restaurar").click();
    });

    cy.contains("button", "Ativas").click();
    cy.contains(".subject-row", "Arquitetura Web").should("be.visible");
  });
});
