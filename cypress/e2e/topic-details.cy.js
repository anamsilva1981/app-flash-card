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

function openTopics() {
  cy.loginApp({ queue: [topic] });
  cy.contains("nav button", "Estudar").click();
  cy.contains("button", "Angular").click();
  cy.contains("button", "Tópicos").click();
}

function fitsViewport(selector) {
  cy.get(selector).then(($el) => {
    const rect = $el[0].getBoundingClientRect();
    const win = $el[0].ownerDocument.defaultView;
    expect(rect.left).to.be.at.least(0);
    expect(rect.right).to.be.at.most(win.innerWidth);
    expect(rect.top).to.be.at.least(0);
    expect(rect.bottom).to.be.at.most(win.innerHeight);
  });
}

describe("Visualização e edição de tópicos no celular", () => {
  it("abre os detalhes ao tocar no card e permite acessar o material", () => {
    openTopics();
    cy.contains(".topic-row", topic.title).then(($row) => {
      cy.wrap($row).click($row[0].clientWidth - 8, $row[0].clientHeight / 2);
    });
    cy.get('[role="dialog"]').should("be.visible");
    cy.contains("#topic-detail-title", topic.title).should("be.visible");
    cy.contains(".topic-detail", topic.notes).should("be.visible");
    cy.get(".topic-detail input, .topic-detail textarea").should("not.exist");
    cy.get(".topic-detail a")
      .should("have.attr", "href", topic.link)
      .and("have.attr", "target", "_blank");
    cy.get(".topic-detail a").should("have.attr", "rel", "noopener noreferrer");
    fitsViewport(".topic-detail");
    cy.intercept("GET", topic.link, {
      statusCode: 200,
      body: "<html><body>Material de estudo</body></html>",
      headers: { "content-type": "text/html" },
    }).as("material");
    // Open in the test tab to verify the destination; the app link opens a new tab.
    cy.get(".topic-detail a").invoke("removeAttr", "target").click();
    cy.wait("@material");
    cy.origin("https://example.org", () => {
      cy.url().should("eq", "https://example.org/material");
      cy.contains("Material de estudo").should("be.visible");
    });
  });

  it("edita somente pelo botão dos detalhes, sem ampliar os campos no mobile", () => {
    cy.viewport(360, 740);
    openTopics();
    cy.get('[aria-label="Abrir tópico: ' + topic.title + '"]').click();
    cy.get('.topic-row [aria-label^="Editar tópico:"]').should("not.exist");
    cy.contains(".topic-detail button", "Editar tópico").click();
    cy.get(".topic-detail").should("not.exist");
    cy.get(".study-form").should("be.visible");
    fitsViewport(".study-form");
    cy.get(".study-form input, .study-form textarea, .study-form select").each(
      ($el) => {
        expect(parseFloat($el.css("font-size"))).to.be.at.least(16);
      },
    );
    cy.get('input[placeholder="Ex.: Template Literals"]')
      .should("have.value", topic.title)
      .clear()
      .type("Tópico atualizado");
    cy.get(".study-form button.primary-action").click();
    cy.get(".study-form").should("not.exist");
    cy.get('[aria-label="Abrir tópico: Tópico atualizado"]').click();
    cy.contains("#topic-detail-title", "Tópico atualizado").should(
      "be.visible",
    );
    cy.get(".topic-detail a").should("have.attr", "href", topic.link);
    cy.get('button[aria-label="Fechar tópico"]').click();
    cy.get(".topic-detail").should("not.exist");
    cy.get('[aria-label="Abrir tópico: Tópico atualizado"]').should(
      "have.focus",
    );
  });

  it("mantém a conclusão separada da visualização e abre os tópicos estudados", () => {
    openTopics();
    cy.get('[aria-label="Marcar como estudado: ' + topic.title + '"]').click();
    cy.get(".topic-detail").should("not.exist");
    cy.contains("button", "Estudados").click();
    cy.get('[aria-label="Abrir tópico: ' + topic.title + '"]')
      .focus()
      .type("{enter}");
    cy.get(".topic-detail").should("be.visible");
    cy.contains(".topic-detail", "Estudado em").should("exist");
    cy.get('button[aria-label="Fechar tópico"]').type("{esc}");
    cy.get(".topic-detail").should("not.exist");
    cy.get('[aria-label="Abrir tópico: ' + topic.title + '"]').should(
      "have.focus",
    );
  });
});
