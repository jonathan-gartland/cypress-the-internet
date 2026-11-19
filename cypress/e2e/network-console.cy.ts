// The page's buttons make the browser do things a test watches from outside the page. Selenium
// uses BiDi network and log events for this; in Cypress it's cy.intercept for requests, spies on
// console methods, the uncaught:exception event and a securitypolicyviolation listener.
describe('network and console', () => {
  it('sees the JSON request and its response', () => {
    cy.intercept('GET', '/network_console/data').as('data')
    cy.visit('/network_console')

    cy.get('#fetch-json').click()

    cy.wait('@data').its('response').should((response) => {
      expect(response!.statusCode).to.eq(200)
      expect(response!.body).to.deep.eq({ fruit: 'apple', count: 3 })
    })
    cy.get('#event-log .fetch-json').should('have.text', 'Fetched JSON: {"fruit":"apple","count":3}')
  })

  it('sees a request that fails with 500', () => {
    cy.intercept('GET', '/status_codes/500').as('failing')
    cy.visit('/network_console')

    cy.get('#fetch-error').click()

    cy.wait('@failing').its('response.statusCode').should('eq', 500)
    cy.get('#event-log .fetch-error').should('have.text', 'Request failed with status 500')
  })

  it('captures console messages by level', () => {
    cy.visit('/network_console', {
      onBeforeLoad(win) {
        cy.spy(win.console, 'log').as('log')
        cy.spy(win.console, 'warn').as('warn')
        cy.spy(win.console, 'error').as('error')
      },
    })

    cy.get('#log-console').click()

    cy.get('@log').should('have.been.calledWith', 'the-internet: a log message')
    cy.get('@warn').should('have.been.calledWith', 'the-internet: a warning')
    cy.get('@error').should('have.been.calledWith', 'the-internet: an error message')
  })

  it('catches an uncaught JavaScript error without failing the test', () => {
    cy.visit('/network_console')
    // Cypress fails a test on an uncaught error by default. Returning false here expects it.
    const uncaught = cy.stub().as('uncaught').returns(false)
    cy.on('uncaught:exception', uncaught)

    cy.get('#throw-error').click()

    cy.get('@uncaught').should('have.been.calledOnce')
    cy.get('@uncaught').its('firstCall.args.0.message').should('include', 'the-internet: thrown on purpose')
    cy.get('#event-log .throw-error').should('contain.text', 'the-internet: thrown on purpose')
  })

  it('reports a CSP violation', () => {
    cy.visit('/network_console')
    cy.document().then((doc) => {
      doc.addEventListener('securitypolicyviolation', cy.stub().as('violation'))
    })

    cy.get('#csp-violation').click()

    cy.get('@violation').should('have.been.calledOnce')
    cy.get('@violation').its('firstCall.args.0.violatedDirective').should('eq', 'img-src')
    cy.get('#event-log .csp-violation').should('contain.text', 'CSP violation: img-src')
  })
})
