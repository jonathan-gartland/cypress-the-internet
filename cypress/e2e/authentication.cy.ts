import { users } from '../support/commands'

describe('form authentication', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('logs in with valid credentials and shows the secure area', () => {
    cy.get('#username').type(users.valid.username)
    cy.get('#password').type(users.valid.password, { log: false })
    cy.contains('button', 'Login').click()

    cy.location('pathname').should('eq', '/secure')
    cy.get('#flash').should('have.class', 'success').and('contain', 'You logged into a secure area!')
    cy.get('#username').should('have.text', users.valid.username)
  })

  const invalid = [
    {
      name: 'unknown username',
      username: 'nobody',
      password: users.valid.password,
      message: 'Your username is invalid!',
    },
    {
      name: 'wrong password',
      username: users.valid.username,
      password: 'wrong',
      message: 'Your password is invalid!',
    },
  ]

  invalid.forEach(({ name, username, password, message }) => {
    it(`rejects a ${name}`, () => {
      cy.get('#username').type(username)
      cy.get('#password').type(password, { log: false })
      cy.contains('button', 'Login').click()

      cy.location('pathname').should('eq', '/login')
      cy.get('#flash').should('have.class', 'error').and('contain', message)
    })
  })

  it('logs out and blocks the secure area afterwards', () => {
    cy.login()
    cy.visit('/secure')
    cy.contains('a', 'Logout').click()

    cy.location('pathname').should('eq', '/login')
    cy.get('#flash').should('contain', 'You logged out of the secure area!')

    cy.visit('/secure')
    cy.location('pathname').should('eq', '/login')
    cy.get('#flash').should('contain', 'You must login to view the secure area!')
  })
})
