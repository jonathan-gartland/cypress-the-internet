// Two layers: the browser's constraint validation runs first and blocks the request, then the
// server can still reject the form with a 422 and an error per field.
const valid = {
  username: 'cyuser',
  email: 'cy@example.com',
  age: '30',
  password: 'longenough',
}

function fill(values: Partial<typeof valid> = valid) {
  Object.entries(values).forEach(([field, value]) => {
    cy.get(`#${field}`).clear()
    cy.get(`#${field}`).type(value)
  })
}

describe('form validation', () => {
  beforeEach(() => {
    cy.intercept('POST', '/form_validation').as('submit')
    cy.visit('/form_validation')
  })

  it('blocks submission in the browser when fields are invalid', () => {
    fill({
      username: 'Bad Name!',
      email: 'not-an-email',
      age: '12',
      password: 'longenough',
    })
    cy.contains('button', 'Create account').click()

    cy.get('#signup').then(([form]) => expect((form as HTMLFormElement).checkValidity()).to.eq(false))
    cy.get('#username').its('0.validity.patternMismatch').should('eq', true)
    cy.get('#email').its('0.validity.typeMismatch').should('eq', true)
    cy.get('#age').its('0.validity.rangeUnderflow').should('eq', true)
    cy.get('#terms').its('0.validity.valueMissing').should('eq', true)

    cy.get('@submit.all').should('have.length', 0)
    cy.get('#result').should('be.empty')
  })

  // Browsers only flag minlength (validity.tooShort) after a real user edit. Cypress's typing is
  // simulated, so a short password passes the browser check here, as it would for any value set
  // by script. The server is the layer that catches it.
  it('leaves a too-short password to the server', () => {
    fill({ ...valid, password: 'short' })
    cy.get('#terms').check()
    cy.get('#password').its('0.validity.valid').should('eq', true)
    cy.contains('button', 'Create account').click()

    cy.wait('@submit').its('response.statusCode').should('eq', 422)
    cy.get('#password-error').should('have.text', 'Password must be at least 8 characters')
    cy.get('#password').should('have.attr', 'aria-invalid', 'true')
  })

  it('shows the server\'s errors when the username is taken', () => {
    fill({ ...valid, username: 'tomsmith' })
    cy.get('#terms').check()
    cy.contains('button', 'Create account').click()

    cy.wait('@submit').its('response.statusCode').should('eq', 422)
    cy.get('#result').should('have.text', 'Please fix the errors below')
    cy.get('#username-error').should('have.text', 'Username is already taken')
    cy.get('#username').should('have.attr', 'aria-invalid', 'true')
    cy.get('#email').should('not.have.attr', 'aria-invalid')
  })

  it('creates the account when everything is valid', () => {
    fill()
    cy.get('#terms').check()
    cy.contains('button', 'Create account').click()

    cy.wait('@submit').then(({ request, response }) => {
      expect(request.body).to.include('username=cyuser')
      expect(response!.statusCode).to.eq(200)
    })
    cy.get('#result').should('have.text', 'Account created for cyuser')
    cy.get('.field-error:not(:empty)').should('not.exist')
  })
})
