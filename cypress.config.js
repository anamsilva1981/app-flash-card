module.exports = {
  e2e: {
    setupNodeEvents(on) {
      if (process.env.CYPRESS_REAL_BACKEND)
        on("task", require("./scripts/browser-integration.cjs")());
    },
    baseUrl: "http://127.0.0.1:4200",
    supportFile: "cypress/support/e2e.js",
    specPattern: "cypress/e2e/**/*.cy.js",
    viewportWidth: 390,
    viewportHeight: 844,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
  },
};
