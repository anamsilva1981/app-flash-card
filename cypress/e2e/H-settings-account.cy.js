describe("Parte H — configurações e conta", () => {
  beforeEach(() => cy.loginApp());

  it("cobre perfil, rotina, privacidade, suporte e exclusão", () => {
    cy.contains("nav button", "Perfil").click();
    cy.contains("h1", "Configurações").should("be.visible");
    cy.contains("Sua conta").should("be.visible");
    cy.contains("Seu horário de estudo").should("be.visible");
    cy.contains("Privacidade e suporte").should("be.visible");
    cy.contains("Excluir conta").should("be.visible");

    cy.get('textarea[placeholder="Descreva o que precisa"]').type(
      "Teste automatizado de suporte.",
    );
    cy.contains("button", "Registrar solicitação").click();
    cy.contains("Solicitação registrada").should("be.visible");

    cy.contains("button", "Quero excluir minha conta").click();
    cy.contains("Digite EXCLUIR para confirmar").should("be.visible");
    cy.contains("button", "Cancelar").click();
  });

  it("alterna idioma e mantém a preferência após recarregar", () => {
    cy.contains("nav button", "Perfil").click();
    cy.get(".language-switcher").should("contain.text", "English").click();
    cy.get("html").should("have.attr", "lang", "en");
    cy.reload();
    cy.get("html").should("have.attr", "lang", "en");
    cy.contains("nav button", "Profile").click();
    cy.get(".language-switcher").should("contain.text", "Português");
  });

  it("persiste o tema e permite voltar ao modo do sistema", () => {
    cy.contains("nav button", "Perfil").click();
    cy.get('[role="radiogroup"][aria-label="Tema do aplicativo"]')
      .contains('[role="radio"]', "Escuro")
      .click();
    cy.get("html").should("have.attr", "data-theme", "dark");
    cy.reload();
    cy.get("html").should("have.attr", "data-theme", "dark");
    cy.contains("nav button", "Perfil").click();
    cy.contains('[role="radio"]', "Sistema").click();
    cy.contains('[role="radio"]', "Sistema").should(
      "have.attr",
      "aria-checked",
      "true",
    );
  });

  it("alcança conteúdo abaixo da dobra e recupera a rolagem após modal", () => {
    cy.viewport(360, 640);
    cy.contains("nav button", "Perfil").click();
    cy.contains("Excluir conta").scrollIntoView().should("be.visible");
    cy.contains("button", "Quero excluir minha conta").click();
    cy.contains("Digite EXCLUIR para confirmar").should("be.visible");
    cy.contains("button", "Cancelar").click();
    cy.get("body").should("have.css", "overflow-y", "auto");
    cy.contains("nav button", "Início").scrollIntoView().click();
    cy.contains("Baralhos do dia").should("be.visible");
  });

  it("rejeita backup inválido sem apagar os dados atuais", () => {
    cy.contains("nav button", "Perfil").click();
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('{"version":2,"cards":"invalid"}'),
        fileName: "invalid.json",
        mimeType: "application/json",
      },
      { force: true },
    );
    cy.contains("Nenhum dado foi importado.").should("be.visible");
    cy.contains("nav button", "Estudar").click();
    cy.contains("button", "Angular").should("be.visible");
    cy.contains("button", "JavaScript").should("be.visible");
  });
});
