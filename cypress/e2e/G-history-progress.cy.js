describe("Parte G — histórico e progresso", () => {
  beforeEach(() => cy.loginApp());

  it("exibe evolução, atividade e navegação do calendário", () => {
    cy.contains("nav button", "Histórico").click();
    cy.contains("h1", "Evolução").should("be.visible");
    cy.contains("Dias com atividade").should("be.visible");
    cy.contains("Aprendizado").should("exist");
    cy.get('button[aria-label="Mês anterior"]').should("be.visible").click();
    cy.get('button[aria-label="Próximo mês"]').should("be.visible").click();
  });

  it("reflete uma revisão concluída no fluxo de histórico", () => {
    cy.contains("nav button", "Estudar").click();
    cy.contains("button", "Angular").click();
    cy.contains("button", "Criar card").click();
    cy.get('[data-cy="card-topic"]').type("Histórico E2E");
    cy.get('[data-cy="card-question"]').type("Card para histórico?");
    cy.get('[data-cy="card-answer"]').type("Sim.");
    cy.get('[data-cy="card-save"]').click();
    cy.contains("button", /Revisar agora|Revisar novamente/).click();
    cy.contains("button", "Virar card").click();
    cy.contains("button", "Sei").click();
    cy.contains("Revisão concluída").should("be.visible");
    cy.contains("button", "Voltar ao início").click();
    cy.contains("nav button", "Histórico").click();
    cy.contains("h1", "Evolução").should("be.visible");
    cy.contains("Dias com atividade").should("be.visible");
  });
});
