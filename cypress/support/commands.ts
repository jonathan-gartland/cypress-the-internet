export const users = {
  valid: { username: 'tomsmith', password: 'SuperSecretPassword!' },
} as const

/**
 * Logs in through the form once per spec run and caches the session cookie with `cy.session`,
 * so tests that only need to be logged in don't repeat the UI login.
 */
function login(username: string = users.valid.username, password: string = users.valid.password) {
  cy.session(
    ['login', username],
    () => {
      cy.visit('/login')
      cy.get('#username').type(username)
      cy.get('#password').type(password, { log: false })
      cy.get('#login').submit()
      cy.location('pathname').should('eq', '/secure')
    },
    {
      validate: () => {
        cy.request({ url: '/secure', followRedirect: false }).its('status').should('eq', 200)
      },
    },
  )
}

Cypress.Commands.add('login', login)

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Log in (cached per user with cy.session). Defaults to the valid demo user. */
      login: typeof login
    }
  }
}
