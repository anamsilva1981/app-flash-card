describe("Shell responsivo", () => {
  beforeEach(() => cy.mockBackend());

  function openGuest() {
    cy.visit("/");
    cy.contains("button", "Experimentar sem conta").click();
  }

  it("usa sidenav no desktop e não renderiza bottom nav", () => {
    cy.viewport(1440, 900);
    openGuest();
    cy.get(".app-nav").should("be.visible");
    cy.get(".app-nav .nav-brand").should("be.visible");
    cy.get(".app-nav").should("have.css", "flex-direction", "column");
  });

  it("usa bottom nav no mobile", () => {
    cy.viewport(390, 844);
    openGuest();
    cy.get(".app-nav").should("be.visible");
    cy.get(".app-nav .nav-brand").should("not.be.visible");
    cy.get(".app-nav").should("have.css", "bottom", "0px");
  });

  it("mantém a tela Estudar utilizável no mobile", () => {
    cy.viewport(390, 844);
    openGuest();
    cy.contains("button", "Estudar").click();
    cy.get(".study-plan-page").should("be.visible");
    cy.get("body").should(($body) => {
      expect($body[0].scrollWidth).to.be.at.most($body[0].clientWidth);
    });
  });
});
