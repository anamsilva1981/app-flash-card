beforeEach(() => {
  cy.clearLocalStorage();
  cy.window().then(win => {
    win.localStorage.setItem('study-guest-entered', 'yes');
  });
});
