// The banner covers the page until a choice is saved in the cookie_consent cookie, and the server
// leaves it out once the cookie is set. Cypress clears cookies between tests, so each test starts
// with the banner. Other specs can skip it with cy.setCookie, as the last test does.
describe('cookie consent', () => {
  beforeEach(() => {
    cy.visit('/cookie_consent')
  })

  it('shows the banner until a choice is made', () => {
    cy.get('#cookie-banner').should('be.visible')
    cy.get('#consent-status').should('have.text', 'Analytics cookies: not decided yet')
    cy.getCookie('cookie_consent').should('be.null')
  })

  const choices = [
    { button: '#accept-all', cookie: 'all', status: 'allowed' },
    { button: '#reject-all', cookie: 'necessary', status: 'blocked' },
  ]

  choices.forEach(({ button, cookie, status }) => {
    it(`saves "${cookie}" from ${button} and hides the banner`, () => {
      cy.get(button).click()

      cy.getCookie('cookie_consent').should('have.property', 'value', cookie)
      cy.get('#cookie-banner').should('not.exist')
      cy.get('#consent-status').should('have.text', `Analytics cookies: ${status}`)
    })
  })

  it('saves a custom choice', () => {
    cy.get('#customize').should('have.attr', 'aria-expanded', 'false').click()
    cy.get('#cookie-settings').should('be.visible')
    cy.get('#necessary-cookies').should('be.checked').and('be.disabled')

    cy.get('#analytics-cookies').check()
    cy.get('#save-settings').click()

    cy.getCookie('cookie_consent').should('have.property', 'value', 'all')
    cy.get('#consent-status').should('have.text', 'Analytics cookies: allowed')
  })

  it('brings the banner back after "Forget my choice"', () => {
    cy.get('#reject-all').click()
    cy.get('#cookie-banner').should('not.exist')

    cy.get('#reset-consent').click()

    cy.getCookie('cookie_consent').should('be.null')
    cy.get('#cookie-banner').should('be.visible')
  })

  it('skips the banner when the cookie is set up front', () => {
    cy.setCookie('cookie_consent', 'necessary')
    cy.visit('/cookie_consent')

    cy.get('#cookie-banner').should('not.exist')
    cy.get('#consent-status').should('have.text', 'Analytics cookies: blocked')
  })
})
