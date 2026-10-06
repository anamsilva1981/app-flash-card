describe("Dados pertencentes ao usuário", () => {
  const sessionUser = { id: "e2e-user", email: "e2e@app.local" };
  const signIn = () => {
    cy.visit("/");
    cy.get('input[name="email"]').type(sessionUser.email);
    cy.get('input[name="password"]').type("Senha@123");
    cy.contains("button", "Entrar").click();
    cy.wait("@login");
    cy.contains("Olá, Teste E2E!").should("be.visible");
  };

  beforeEach(() => cy.mockBackend());

  it("abre uma conta vazia sem instalar matérias e cards embutidos", () => {
    cy.intercept("GET", "**/rest/v1/account_studies*", {
      statusCode: 200,
      body: {
        data: {
          subjects: [],
          queue: [],
          activity: [],
          progress: [],
          cards: [],
          preferences: { display_name: "Teste E2E" },
        },
      },
    });
    signIn();
    cy.contains("Crie seu primeiro baralho").should("be.visible");
    cy.contains("nav button", "Estudar").click();
    cy.contains("button", "AWS IA").should("not.exist");
    cy.contains("button", "JavaScript").should("not.exist");
    cy.contains("button", "Angular").should("not.exist");
  });

  it("carrega o conteúdo salvo de uma matéria arbitrária após recarregar", () => {
    const subject = {
      id: "c5937a70-84b0-4d82-8bf2-86787236d115",
      name: "Botânica",
      deck_key: "botany-key",
      days: [0, 1, 2, 3, 4, 5, 6],
      archived: false,
      routine_initialized: true,
    };
    const card = {
      id: 901,
      subject: "botany-key",
      topic: "Folhas",
      question: "Qual é a função da folha?",
      answer: "Realizar fotossíntese.",
      explanation: "O conteúdo pertence à conta.",
      example: "Uma folha de árvore.",
      due: "2000-01-01",
      interval: 0,
    };
    cy.intercept("GET", "**/rest/v1/account_studies*", {
      statusCode: 200,
      body: {
        data: {
          subjects: [subject],
          queue: [],
          activity: [],
          progress: [],
          cards: [card],
          preferences: { display_name: "Teste E2E" },
        },
      },
    }).as("accountData");
    signIn();
    cy.reload();
    cy.contains("nav button", "Estudar").click();
    cy.contains("button", "Botânica").click();
    cy.contains("Qual é a função da folha?").should("exist");
    cy.contains("button", "Revisar agora").click();
    cy.contains("Qual é a função da folha?").should("be.visible");
    cy.contains("button", "Virar card").click();
    cy.contains("Realizar fotossíntese.").should("be.visible");
    cy.get('button[aria-label="Switch language to English"]').click();
    cy.contains("button", "Got it").should("be.visible");
    cy.contains("Realizar fotossíntese.").should("be.visible");
    cy.contains("Qual é a função da folha?").should("exist");
  });
  it("rejects invalid cards and backups without changing stored content", () => {
    signIn();
    cy.contains("nav button", "Estudar").click();
    cy.contains("button", "Angular").click();
    cy.contains("button", "Criar card").click();
    cy.get('[data-cy="card-save"]').click();
    cy.contains(
      "Preencha o baralho, o tópico, a pergunta e a resposta.",
    ).should("be.visible");
    cy.get('button[aria-label="Fechar editor de flashcard"]').click();
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
