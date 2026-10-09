const topic = {
  id: "linked-topic",
  title: "Fundamentos de JavaScript para React",
  subject: "Angular",
  notes: "Leia o material antes de estudar os exemplos.",
  link: "https://example.org/material",
  priority: "media",
  status: "todo",
  completed_at: null,
};

describe("Parte D — tópicos", () => {
  it("cria um tópico dentro do baralho selecionado", () => {
    cy.loginApp();
    cy.contains("nav button", "Estudar").click();
    cy.contains("button", "Angular").click();
    cy.contains("button", "Tópicos").click();
    cy.contains("button", "Adicionar").click();
    cy.get(".study-form").within(() => {
      cy.get('input[placeholder="Ex.: Template Literals"]').type(
        "Standalone Components",
      );
      cy.contains("button", "Alta").click();
      cy.get("button.primary-action").click();
    });
    cy.contains("Standalone Components").should("exist");
  });

  it("mantém os tópicos isolados por baralho", () => {
    const subjects = ["Angular", "JavaScript", "React"].map((name) => ({
      id: name.toLowerCase(),
      name,
      deck_key: name,
      days: [0, 1, 2, 3, 4, 5, 6],
      archived: false,
      routine_initialized: true,
    }));
    const queue = [
      { ...topic, id: "js", title: "3.2 Números", subject: "JavaScript" },
      { ...topic, id: "ng", title: "Signals", subject: "Angular" },
      {
        ...topic,
        id: "react",
        title: "Hooks do React",
        subject: "React",
      },
    ];
    cy.loginApp({ subjects, queue });
    cy.contains("nav button", "Estudar").click();
    cy.contains(".subject-main", "React").click();
    cy.contains("button", "Tópicos").click();
    cy.contains(".topic-list", "Hooks do React").should("be.visible");
    cy.contains("3.2 Números").should("not.exist");
    cy.contains("Signals").should("not.exist");
  });

  it("abre detalhes, edita e conclui um tópico", () => {
    cy.loginApp({ queue: [topic] });
    cy.contains("nav button", "Estudar").click();
    cy.contains("button", "Angular").click();
    cy.contains("button", "Tópicos").click();
    cy.get('[aria-label="Abrir tópico: ' + topic.title + '"]').click();
    cy.contains("#topic-detail-title", topic.title).should("be.visible");
    cy.get(".topic-detail a").should("have.attr", "href", topic.link);
    cy.contains(".topic-detail button", "Editar tópico").click();
    cy.get('input[placeholder="Ex.: Template Literals"]')
      .clear()
      .type("Tópico atualizado");
    cy.get(".study-form button.primary-action").click();
    cy.get('[aria-label="Marcar como estudado: Tópico atualizado"]').click();
    cy.contains("button", "Estudados").click();
    cy.get('[aria-label="Abrir tópico: Tópico atualizado"]').click();
    cy.contains(".topic-detail", "Estudado em").should("exist");
  });

  it("mantém o formulário de tópico utilizável no mobile", () => {
    cy.viewport(360, 740);
    cy.loginApp({ queue: [topic] });
    cy.contains("nav button", "Estudar").click();
    cy.contains("button", "Angular").click();
    cy.contains("button", "Tópicos").click();
    cy.get('[aria-label="Abrir tópico: ' + topic.title + '"]').click();
    cy.contains(".topic-detail button", "Editar tópico").click();
    cy.get(".study-form input, .study-form textarea, .study-form select").each(
      ($el) => {
        expect(parseFloat($el.css("font-size"))).to.be.at.least(16);
      },
    );
  });
});
