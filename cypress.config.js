const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://portfolio-ferid.netlify.app/',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    supportFile: 'cypress/support/e2e.js',
  },
  env: {
    // Les variables d'environnement seront définies ailleurs
  }
})