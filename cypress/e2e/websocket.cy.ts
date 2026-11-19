// cy.intercept can't see WebSocket traffic, so these tests drive the page and check what it shows,
// including the close code the server sends.
describe('echo over a WebSocket', () => {
  beforeEach(() => {
    cy.visit('/websocket')
    cy.get('#connection').should('have.text', 'Disconnected')
    cy.get('#message').should('be.disabled')

    cy.get('#connect').click()
    cy.get('#connection').should('have.text', 'Connected')
    cy.get('#messages .received').first().should('contain.text', 'Connected.')
  })

  it('echoes each message back', () => {
    cy.get('#message').should('be.focused').type('hello{enter}')
    cy.get('#message').type('second{enter}')

    cy.get('#messages .message').then(items => Cypress.$.makeArray(items).slice(1).map(li => `${li.className}|${li.textContent}`)).should('deep.eq', [
      'message sent|hello',
      'message received|Echo: hello',
      'message sent|second',
      'message received|Echo: second',
    ])
    cy.get('#message').should('have.value', '')
  })

  it('closes cleanly when the page disconnects', () => {
    cy.get('#disconnect').click()

    cy.get('#connection').should('have.text', 'Disconnected (code 1000: Closed by the page)')
    cy.get('#connect').should('be.enabled')
    cy.get('#message').should('be.disabled')
  })

  it('is closed by the server for a message over 1000 characters', () => {
    // invoke('val') sets the value directly; typing 1001 characters would be slow
    cy.get('#message').invoke('val', 'x'.repeat(1001))
    cy.get('#send').click()

    cy.get('#connection').should('have.text', 'Disconnected (code 1009: WebSocket frame length too large)')
    cy.get('#send').should('be.disabled')
  })
})
