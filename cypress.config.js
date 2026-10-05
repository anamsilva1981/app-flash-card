const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:4200',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    viewportWidth: 390,
    viewportHeight: 844,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000
  }
});
