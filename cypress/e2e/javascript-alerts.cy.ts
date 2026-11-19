// Cypress accepts alert() and confirm() automatically. Listening to the window events checks the
// dialog text and, for confirm, chooses the answer. prompt() has no event, so it's stubbed.
describe('javascript alerts', () => {
  beforeEach(() => {
    cy.visit('/javascript_alerts')
  })

  it('accepts an alert', () => {
    const alert = cy.stub().as('alert')
    cy.on('window:alert', alert)

    cy.contains('button', 'Click for JS Alert').click()

    cy.get('@alert').should('have.been.calledOnceWith', 'I am a JS Alert')
    cy.get('#result').should('have.text', 'You successfully clicked an alert')
  })

  it('accepts a confirm', () => {
    cy.on('window:confirm', text => expect(text).to.eq('I am a JS Confirm'))

    cy.contains('button', 'Click for JS Confirm').click()

    cy.get('#result').should('have.text', 'You clicked: Ok')
  })

  it('dismisses a confirm', () => {
    cy.on('window:confirm', () => false)

    cy.contains('button', 'Click for JS Confirm').click()

    cy.get('#result').should('have.text', 'You clicked: Cancel')
  })

  it('answers a prompt', () => {
    cy.window().then(win => cy.stub(win, 'prompt').as('prompt').returns('Cypress'))

    cy.contains('button', 'Click for JS Prompt').click()

    cy.get('@prompt').should('have.been.calledOnceWith', 'I am a JS prompt')
    cy.get('#result').should('have.text', 'You entered: Cypress')
  })

  it('cancels a prompt', () => {
    cy.window().then(win => cy.stub(win, 'prompt').returns(null))

    cy.contains('button', 'Click for JS Prompt').click()

    cy.get('#result').should('have.text', 'You entered: null')
  })
})
