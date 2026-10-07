describe("Real disposable account persistence", () => {
  let account;
  const login = () => {
    cy.visit("/");
    cy.get('input[name="email"]').type(account.email);
    cy.get('input[name="password"]').type(account.password);
    cy.contains("button", "Entrar").click();
    cy.contains("Olá, Browser!").should("be.visible");
  };
  before(() =>
    cy.task("createDisposableAccount").then((value) => {
      account = value;
    }),
  );
  after(() => cy.task("cleanupDisposableAccounts"));
  it("creates, reviews, refreshes and logs in again with saved content", () => {
    login();
    cy.contains("nav button", "Estudar").click();
    cy.contains("button", "Biologia").click();
    cy.contains("button", "Criar card").click();
    cy.get('[data-cy="card-topic"]').type("Células");
    cy.get('[data-cy="card-question"]').type("O que é uma célula?");
    cy.get('[data-cy="card-answer"]').type("Uma unidade viva.");
    cy.get('[data-cy="card-save"]').click();
    cy.contains("O que é uma célula?").should("exist");
    cy.contains("button", /Revisar agora|Revisar novamente/).click();
    cy.contains("button", "Virar card").click();
    cy.contains("button", "Sei").click();
    cy.contains("Revisão concluída").should("be.visible");
    cy.reload();
    cy.contains("nav button", "Perfil").click();
    cy.contains("button", "Sair da conta").click();
    cy.contains("Bem-vinda de volta").should("be.visible");
    login();
    cy.contains("nav button", "Estudar").click();
    cy.contains("button", "Biologia").click();
    cy.contains("O que é uma célula?").should("exist");
    cy.task("disposableSnapshot", account.id).then((data) => {
      expect(data.cards).to.have.length(1);
      expect(data.cards[0].question).to.eq("O que é uma célula?");
      expect(data.progress[0].interval).to.eq(4);
      expect(data.cards[0].subject_id).to.eq(data.subjects[0].id);
    });
  });
});
