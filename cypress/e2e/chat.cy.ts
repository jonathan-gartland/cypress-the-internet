// Two people in one room. Cypress drives one browser, so the page is one user and the other is a
// WebSocket client running in Node (cypress/tasks/chat-users.ts), reached through cy.task. Each
// test uses its own room so parallel runs don't see each other's messages.
describe('chat between two users', () => {
  let room: string

  beforeEach(() => {
    room = `cy-${Date.now()}-${Cypress._.random(1e6)}`
    cy.visit(`/chat?room=${room}`)
    cy.get('#room').should('have.text', room)
    cy.get('#status').should('have.text', 'Connected')

    cy.get('#name').type('Ana')
    cy.get('#join').click()
    cy.contains('#messages .notice', 'Ana joined')
  })

  afterEach(() => {
    cy.task('chatUserLeave', 'Bo')
  })

  it('shows the other user joining and their messages', () => {
    cy.task('chatUserJoin', { room, name: 'Bo' })
    cy.contains('#messages .notice', 'Bo joined')

    cy.task('chatUserSend', { name: 'Bo', text: 'Hi from Node' })

    cy.get('#messages .message').last().within(() => {
      cy.get('.author').should('have.text', 'Bo')
      cy.get('.text').should('have.text', 'Hi from Node')
    })
  })

  it('delivers the page user\'s messages to the other user', () => {
    cy.task('chatUserJoin', { room, name: 'Bo' })

    cy.get('#message').type('Hi from the browser{enter}')
    cy.contains('#messages .message .text', 'Hi from the browser')

    // Tasks don't retry, so the Node user waits for the message itself
    cy.task('chatUserWaitFor', {
      name: 'Bo',
      event: { type: 'message', author: 'Ana', text: 'Hi from the browser' },
    })
      .should('deep.eq', { type: 'message', author: 'Ana', text: 'Hi from the browser' })
  })

  it('shows when the other user leaves', () => {
    cy.task('chatUserJoin', { room, name: 'Bo' })
    cy.contains('#messages .notice', 'Bo joined')

    cy.task('chatUserLeave', 'Bo')

    cy.contains('#messages .notice', 'Bo left')
  })

  it('shows text as text, not HTML', () => {
    cy.task('chatUserJoin', { room, name: 'Bo' })
    cy.task('chatUserSend', { name: 'Bo', text: '<img src=x onerror="window.pwned=1">' })

    cy.get('#messages .message .text').last().should('have.text', '<img src=x onerror="window.pwned=1">')
    cy.get('#messages img').should('not.exist')
    cy.window().its('pwned').should('be.undefined')
  })
})
