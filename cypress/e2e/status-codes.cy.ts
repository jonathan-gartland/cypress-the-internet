// cy.request checks the HTTP layer directly; cy.visit checks what a user sees. By default both fail
// on a non-2xx response, so error pages need failOnStatusCode: false.
describe('status codes', () => {
  const codes = [200, 301, 404, 500]

  it('lists each status code page', () => {
    cy.visit('/status_codes')
    codes.forEach(code => cy.contains('a', String(code)).should('have.attr', 'href', `status_codes/${code}`))
  })

  codes.forEach((code) => {
    it(`returns ${code} from /status_codes/${code}`, () => {
      cy.request({ url: `/status_codes/${code}`, failOnStatusCode: false, followRedirect: false })
        .its('status')
        .should('eq', code)
    })
  })

  // The 301 page has no Location header: these pages demonstrate status codes, they don't redirect
  codes.forEach((code) => {
    it(`shows the explanation page for ${code}`, () => {
      cy.visit(`/status_codes/${code}`, { failOnStatusCode: false })
      cy.contains(`This page returned a ${code} status code.`)
    })
  })
})
