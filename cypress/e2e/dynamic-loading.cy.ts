// Both examples finish after ~5s, longer than Cypress's default 4s retry window. The fix is a
// longer timeout on the assertion that waits for the app, never a fixed cy.wait().
const LOAD_TIMEOUT = 10_000

describe('dynamic loading', () => {
  it('reveals an element that was hidden in the DOM', () => {
    cy.visit('/dynamic_loading/1')
    cy.get('#finish').should('exist').and('not.be.visible')

    cy.contains('#start button', 'Start').click()

    cy.get('#loading').should('be.visible')
    cy.get('#finish h4', { timeout: LOAD_TIMEOUT }).should('be.visible').and('have.text', 'Hello World!')
    cy.get('#loading').should('not.be.visible')
  })

  it('waits for an element that is added to the DOM later', () => {
    cy.visit('/dynamic_loading/2')
    cy.get('#finish').should('not.exist')

    cy.contains('#start button', 'Start').click()

    cy.get('#finish h4', { timeout: LOAD_TIMEOUT }).should('be.visible').and('have.text', 'Hello World!')
  })
})
