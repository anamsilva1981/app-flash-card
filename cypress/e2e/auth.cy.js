describe("Autenticação e páginas públicas", () => {
  beforeEach(() => cy.mockBackend());

  it("abre login, cadastro, valida senha e política de privacidade", () => {
    cy.visit("/");
    cy.contains("Bem-vinda de volta").should("be.visible");
    cy.contains("button", "Criar uma conta").click();
    cy.contains("Seu próximo aprendizado começa aqui").should("be.visible");
    cy.get('input[name="password"]').type("Senha@123");
    cy.contains("✓ 8 caracteres").should("have.class", "valid");
    cy.contains("✓ Letra maiúscula").should("have.class", "valid");
    cy.contains("✓ Letra minúscula").should("have.class", "valid");
    cy.contains("✓ Número").should("have.class", "valid");
    cy.contains("✓ Caractere especial").should("have.class", "valid");
    cy.contains("a", "política de privacidade").click();
    cy.contains("Privacidade dos seus estudos").should("be.visible");
    cy.contains("O que armazenamos").should("be.visible");
  });

  it("abre recuperação de senha", () => {
    cy.visit("/");
    cy.contains("button", "Esqueci minha senha").click();
    cy.contains("Recupere seu acesso").should("be.visible");
    cy.get('input[name="email"]').should("be.visible");
    cy.contains("button", "Enviar link").should("be.visible");
  });

  it("abre instruções de exclusão de conta", () => {
    cy.visit("/?page=delete");
    cy.contains("Excluir sua conta").should("be.visible");
    cy.contains("Entrar para excluir minha conta").should("be.visible");
  });

  it("alterna para inglês e mantém o idioma após recarregar", () => {
    cy.visit("/");
    cy.get(".language-switcher").should("contain.text", "EN").click();
    cy.contains("Welcome back").should("be.visible");
    cy.get("html").should("have.attr", "lang", "en");
    cy.window().then((win) =>
      expect(win.localStorage.getItem("study-locale")).to.eq("en"),
    );
    cy.reload();
    cy.contains("Welcome back").should("be.visible");
    cy.get(".language-switcher").should("contain.text", "PT");
    cy.get("html").should("have.attr", "lang", "en");
  });
});
