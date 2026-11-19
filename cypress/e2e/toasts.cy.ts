// Toasts remove themselves with setTimeout. cy.clock replaces the page's timers, so cy.tick checks
// the exact timing without waiting for it.
describe('toasts', () => {
  beforeEach(() => {
    cy.clock()
    cy.visit('/toasts')
  })

  it('hides a toast after its duration', () => {
    cy.get('#success-toast').click()
    cy.get('#toasts .toast-success').should('have.text', '×Saved successfully').and('have.attr', 'role', 'status')

    cy.tick(2999)
    cy.get('#toasts .toast-success').should('exist')
    cy.tick(1)
    cy.get('#toasts .toast-success').should('not.exist')
  })

  it('announces errors as alerts', () => {
    cy.get('#error-toast').click()
    cy.get('#toasts .toast-error').should('have.attr', 'role', 'alert').find('.toast-message').should('have.text', 'Something went wrong')
  })

  it('stacks toasts and removes each on its own schedule', () => {
    cy.get('#info-toast').click()
    cy.tick(1000)
    cy.get('#success-toast').click()
    cy.get('#toasts .toast').should('have.length', 2)
    cy.get('#toast-count').should('have.text', 'Toasts shown: 2')

    cy.tick(2000)
    cy.get('#toasts .toast').should('have.length', 1).and('have.class', 'toast-success')
    cy.tick(1000)
    cy.get('#toasts .toast').should('not.exist')
  })

  it('keeps a toast with duration 0 until it is closed', () => {
    cy.get('#duration').clear()
    cy.get('#duration').type('0')
    cy.get('#info-toast').click()

    cy.tick(60_000)
    cy.get('#toasts .toast-info').should('exist')

    cy.get('#toasts .toast-info .toast-close').click()
    cy.get('#toasts .toast-info').should('not.exist')
  })

  it('takes the duration from the URL', () => {
    cy.visit('/toasts?duration=1000')
    cy.get('#duration').should('have.value', '1000')

    cy.get('#success-toast').click()
    cy.tick(1000)
    cy.get('#toasts .toast').should('not.exist')
  })
})
