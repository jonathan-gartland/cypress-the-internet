import { users } from '../support/commands'

// Password, then a one-time code. In a real app the code goes to a phone or authenticator; the
// usual test setup is a test-only endpoint or a seeded TOTP secret. This demo shows the code on the
// page, so the test reads it from there.
function enterPassword() {
  cy.visit('/two_factor')
  cy.get('#username').type(users.valid.username)
  cy.get('#password').type(users.valid.password, { log: false })
  cy.contains('button', 'Next').click()
  cy.location('pathname').should('eq', '/two_factor/code')
}

describe('two-factor login', () => {
  it('logs in with the password and the one-time code', () => {
    enterPassword()

    cy.get('#otp-code').invoke('text').should('match', /^\d{6}$/).then((code) => {
      cy.get('#code').should('have.attr', 'autocomplete', 'one-time-code').type(code, { log: false })
    })
    cy.contains('button', 'Verify').click()

    cy.location('pathname').should('eq', '/two_factor/secure')
    cy.get('h4').should('contain.text', 'You logged in with a password and a one-time code.')
  })

  it('rejects a wrong code and stays on the code page', () => {
    enterPassword()

    cy.get('#otp-code').invoke('text').then((code) => {
      const wrong = code === '000000'
        ? '111111'
        : '000000'
      cy.get('#code').type(wrong)
    })
    cy.contains('button', 'Verify').click()

    cy.location('pathname').should('eq', '/two_factor/code')
    cy.get('#flash').should('have.class', 'error').and('contain', 'Your code is invalid!')
  })

  it('does not open the secure area with only a password', () => {
    enterPassword()

    cy.visit('/two_factor/secure')
    cy.location('pathname').should('not.eq', '/two_factor/secure')
  })
})
