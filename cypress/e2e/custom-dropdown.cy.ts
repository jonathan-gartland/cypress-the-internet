// A select list built from <div>s with ARIA roles. cy.select() only works on <select>, so the
// tests drive it like a user would, and check the ARIA state that screen readers rely on.
describe('custom dropdown', () => {
  beforeEach(() => {
    cy.visit('/custom_dropdown')
  })

  it('opens on click and selects an option', () => {
    cy.get('#fruit-combo').should('have.attr', 'aria-expanded', 'false').click()
    cy.get('#fruit-listbox').should('be.visible')
    cy.get('#fruit-combo').should('have.attr', 'aria-expanded', 'true')

    cy.get('#fruit-mango').click()

    cy.get('#fruit-combo').should('have.text', 'Mango').and('have.attr', 'data-value', 'mango')
    cy.get('#fruit-mango').should('have.attr', 'aria-selected', 'true')
    cy.get('#fruit-listbox').should('not.be.visible')
    cy.get('#result').should('have.text', 'Selected: mango')
  })

  it('selects with the keyboard and skips the disabled option', () => {
    cy.get('#fruit-combo').focus()
    cy.get('#fruit-combo').type('{downArrow}')
    cy.get('#fruit-combo').should('have.attr', 'aria-activedescendant', 'fruit-apple')

    // Apple -> Banana -> (Cherry is disabled) -> Mango
    cy.get('#fruit-combo').type('{downArrow}{downArrow}')
    cy.get('#fruit-combo').should('have.attr', 'aria-activedescendant', 'fruit-mango')

    cy.get('#fruit-combo').type('{enter}')
    cy.get('#result').should('have.text', 'Selected: mango')
    cy.get('#fruit-combo').should('be.focused')
  })

  it('ignores a click on the disabled option', () => {
    cy.get('#fruit-combo').click()
    cy.get('#fruit-cherry').should('have.attr', 'aria-disabled', 'true').click()

    cy.get('#result').should('have.text', 'Selected: nothing')
    cy.get('#fruit-cherry').should('have.attr', 'aria-selected', 'false')
  })

  it('closes without selecting on Escape or an outside click', () => {
    cy.get('#fruit-combo').focus()
    cy.get('#fruit-combo').type('{downArrow}')
    cy.get('#fruit-combo').type('{esc}')
    cy.get('#fruit-listbox').should('not.be.visible')

    cy.get('#fruit-combo').click()
    cy.get('h3').click()
    cy.get('#fruit-listbox').should('not.be.visible')
    cy.get('#result').should('have.text', 'Selected: nothing')
  })
})
