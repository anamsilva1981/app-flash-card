describe("Parte B — home e navegação", () => {
  beforeEach(() => cy.loginApp());

  it("cobre Home e seletor de revisão", () => {
    cy.contains("SUA REVISÃO DIÁRIA").should("be.visible");
    cy.contains("Baralhos do dia").should("be.visible");
    cy.contains("Angular").should("be.visible");
    cy.contains("button", /Começar revisão|Explorar flashcards/).click();
    cy.contains("Revisar flashcards").should("be.visible");
    cy.get('button[aria-label="Voltar"]').click();
    cy.contains("Baralhos do dia").should("be.visible");
  });

  it("navega entre as áreas principais", () => {
    cy.contains("nav button", "Estudar").click();
    cy.contains("h1", "Estudar").should("be.visible");
    cy.contains("nav button", "Histórico").click();
    cy.contains("h1", "Evolução").should("be.visible");
    cy.contains("nav button", "Perfil").click();
    cy.contains("h1", "Configurações").should("be.visible");
    cy.contains("nav button", "Início").click();
    cy.contains("Baralhos do dia").should("be.visible");
  });

  it("mantém a navegação utilizável em viewport mobile", () => {
    cy.viewport(360, 740);
    cy.contains("Baralhos do dia").should("be.visible");
    cy.get('nav[aria-label="Navegação principal"]').should("be.visible");
    cy.contains("nav button", "Perfil").should("be.visible");
  });
});
