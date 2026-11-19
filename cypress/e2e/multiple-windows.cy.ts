// Cypress drives a single tab. Instead of following a target="_blank" link into a new window, the
// test checks the link is set up to open one, then opens the same URL in the current tab.
describe('multiple windows', () => {
  beforeEach(() => {
    cy.visit('/windows')
  })

  it('links to a page that opens in a new window', () => {
    cy.contains('a', 'Click Here').should('have.attr', 'target', '_blank').and('have.attr', 'href', '/windows/new')
  })

  it('shows the new window\'s page', () => {
    cy.contains('a', 'Click Here').invoke('removeAttr', 'target').click()

    cy.location('pathname').should('eq', '/windows/new')
    cy.title().should('eq', 'New Window')
    cy.get('h3').should('have.text', 'New Window')
  })
})
