describe("Parte A — autenticação e onboarding", () => {
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
  });

  describe("Onboarding", () => {
    it("oculta o aviso de primeiro tópico após a primeira ação", () => {
      cy.loginApp({ queue: [] });
      cy.contains(".onboarding h2", "Adicione o primeiro tópico").should(
        "be.visible",
      );
      cy.contains(".onboarding button", "Adicionar tópico").click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.get('button[aria-label="Fechar formulário"]').click();
      cy.contains("nav button", "Início").click();
      cy.get(".onboarding").should("not.exist");
      cy.reload();
      cy.get(".onboarding").should("not.exist");
    });

    it("salva o primeiro tópico e mantém o onboarding concluído", () => {
      cy.loginApp({ queue: [] });
      cy.contains(".onboarding button", "Adicionar tópico").click();
      cy.get('input[placeholder="Ex.: Template Literals"]').type(
        "Primeiro tópico",
      );
      cy.get('[role="dialog"] button.primary-action').click();
      cy.contains("Primeiro tópico").should("exist");
      cy.contains("nav button", "Início").click();
      cy.get(".onboarding").should("not.exist");
    });

    it("oculta o aviso de primeiro flashcard após a primeira ação", () => {
      cy.loginApp();
      cy.contains(".onboarding h2", "Crie seu primeiro flashcard").should(
        "be.visible",
      );
      cy.contains(".onboarding button", "Criar primeiro flashcard").click();
      cy.get(".card-editor").should("be.visible");
      cy.get('button[aria-label="Fechar editor de flashcard"]').click();
      cy.contains("nav button", "Início").click();
      cy.get(".onboarding").should("not.exist");
      cy.reload();
      cy.get(".onboarding").should("not.exist");
    });
  });
});
