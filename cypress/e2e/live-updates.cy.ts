// Server-Sent Events arrive over one long HTTP response. The first test uses the real stream with a
// short interval; the second stubs the stream with cy.intercept, which works because SSE is plain
// HTTP (unlike WebSockets).
describe('live updates (Server-Sent Events)', () => {
  it('shows each update from the server, then "done"', () => {
    cy.visit('/live_updates?count=3&interval=200')
    cy.get('#connection').should('have.text', 'Not connected')

    cy.get('#start').click()
    cy.get('#start').should('be.disabled')

    cy.get('#updates .update').should('have.length', 3).then(items => Cypress.$.makeArray(items).map(li => [li.dataset.id, li.textContent])).should('deep.eq', [
      ['1', 'Update 1 of 3'],
      ['2', 'Update 2 of 3'],
      ['3', 'Update 3 of 3'],
    ])
    cy.get('#connection').should('have.text', 'Done: the server sent all updates')
    cy.get('#start').should('be.enabled')
  })

  it('renders a stubbed event stream', () => {
    const stream = [
      'id: 7\ndata: First stubbed update\n\n',
      'id: 8\ndata: Second stubbed update\n\n',
      'event: done\ndata: bye\n\n',
    ].join('')
    cy.intercept('GET', '/live_updates/events*', {
      headers: { 'content-type': 'text/event-stream' },
      body: stream,
    }).as('events')
    cy.visit('/live_updates')

    cy.get('#start').click()
    cy.wait('@events')

    cy.get('#updates .update').should('have.length', 2).first().should('have.attr', 'data-id', '7').and('have.text', 'First stubbed update')
    cy.get('#connection').should('have.text', 'Done: the server sent all updates')
  })
})
