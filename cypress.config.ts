import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // Local Docker build by default; set CYPRESS_BASE_URL=https://the-internet.herokuapp.com to
    // run against the hosted site instead.
    baseUrl: 'http://localhost:5050',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    screenshotOnRunFailure: true,
    retries: { runMode: 1, openMode: 0 },
  },
})
