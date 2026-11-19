// Suggestions come from GET /autocomplete/suggestions after a 300 ms debounce. The first tests use
// the real server and wait on the request alias; the rest stub it with cy.intercept to test
// responses the server won't easily give.
describe('autocomplete', () => {
  beforeEach(() => {
    cy.intercept('GET', '/autocomplete/suggestions*').as('suggestions')
    cy.visit('/autocomplete?delay=0')
  })

  it('suggests matches from the server and selects one by click', () => {
    cy.get('#autocomplete').type('ap')
    cy.wait('@suggestions').its('request.url').should('include', 'q=ap')

    cy.get('#suggestions [role=option]').should('have.length', 2).first().should('have.text', 'Apple')
    cy.get('#autocomplete').should('have.attr', 'aria-expanded', 'true')

    cy.contains('#suggestions [role=option]', 'Apricot').click()

    cy.get('#autocomplete').should('have.value', 'Apricot').and('have.attr', 'aria-expanded', 'false')
    cy.get('#selected').should('have.text', 'You selected: Apricot')
  })

  it('selects with the keyboard', () => {
    cy.get('#autocomplete').type('ap')
    cy.wait('@suggestions')
    cy.get('#suggestions [role=option]').should('have.length', 2)

    cy.get('#autocomplete').type('{downArrow}{downArrow}')
    cy.get('#suggestion-1').should('have.attr', 'aria-selected', 'true')
    cy.get('#autocomplete').should('have.attr', 'aria-activedescendant', 'suggestion-1')

    cy.get('#autocomplete').type('{enter}')
    cy.get('#selected').should('have.text', 'You selected: Apricot')
  })

  it('shows stubbed suggestions from a fixture', () => {
    cy.intercept('GET', '/autocomplete/suggestions*', { fixture: 'fruit-suggestions.json' }).as('stubbed')

    cy.get('#autocomplete').type('m')
    cy.wait('@stubbed')

    cy.get('#suggestions [role=option]').then(options => Cypress.$.makeArray(options).map(o => o.textContent)).should('deep.eq', ['Mango', 'Melon', 'Mulberry'])
    cy.get('#status').should('have.text', '3 suggestions')
  })

  it('handles an empty result', () => {
    cy.intercept('GET', '/autocomplete/suggestions*', []).as('empty')

    cy.get('#autocomplete').type('zzz')
    cy.wait('@empty')

    cy.get('#suggestions').should('not.be.visible')
    cy.get('#status').should('have.text', 'No suggestions')
  })

  it('shows a loading state while the server is slow', () => {
    cy.intercept('GET', '/autocomplete/suggestions*', {
      body: ['Apple'],
      delay: 1000,
    }).as('slowSuggestions')

    cy.get('#autocomplete').type('ap')
    cy.get('#status').should('have.text', 'Loading...')
    cy.wait('@slowSuggestions')
    cy.get('#status').should('have.text', '1 suggestions')
  })
})
