describe("Landing pública", () => {
  beforeEach(() => cy.mockBackend());

  it("apresenta o projeto e navega pelas seções", () => {
    cy.visit("/");
    cy.contains("h1", "Estudar é mais do que criar flashcards.").should(
      "be.visible",
    );
    cy.contains("a", "Como funciona").click();
    cy.get("#como-funciona").should("be.visible");
    cy.contains("Pensa assim").should("be.visible");
  });

  it("abre login e cadastro pelos CTAs", () => {
    cy.visit("/");
    cy.contains("button", "Entrar").click();
    cy.contains("Bem-vinda de volta").should("be.visible");
    cy.contains("button", "Voltar ao início").click();
    cy.contains("button", "Começar").click();
    cy.contains("Seu próximo aprendizado começa aqui").should("be.visible");
  });

  it("entra no aplicativo usando o modo local", () => {
    cy.visit("/");
    cy.contains("button", "Experimentar sem conta").click();
    cy.get(".app-shell").should("be.visible");
  });
});
