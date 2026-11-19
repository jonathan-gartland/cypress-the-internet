// The page retries 429/500/503 up to 3 more times, 1 second apart. The first tests use the real
// server's failure options; the rest use cy.intercept to script sequences the server can't give.
function callApi({ fail = '0', status = '500', retry = true, delay = '0' } = {}) {
  cy.get('#delay').clear()
  cy.get('#delay').type(delay)
  cy.get('#fail').clear()
  cy.get('#fail').type(fail)
  cy.get('#status').select(status)
  if (retry)
    cy.get('#retry').check()
  else
    cy.get('#retry').uncheck()
  cy.get('#call-api').click()
}

function attempts() {
  return cy.get('#attempts li').then(items => Cypress.$.makeArray(items).map(li => li.textContent))
}

describe('slow and failing API', () => {
  beforeEach(() => {
    cy.visit('/slow_api')
  })

  it('succeeds after retrying two 503s', () => {
    callApi({ fail: '2', status: '503' })

    cy.get('#status-text', { timeout: 10_000 }).should('have.text', 'Data loaded on attempt 3')
    attempts().should('deep.eq', [
      '503: Attempt 1 failed with 503',
      '503: Attempt 2 failed with 503',
      '200: Data loaded on attempt 3',
    ])
    cy.get('#call-api').should('be.enabled')
  })

  it('gives up after 3 retries', () => {
    callApi({ fail: '5', status: '429' })

    cy.get('#status-text', { timeout: 10_000 }).should('have.text', 'Gave up after 4 attempts (last status 429)')
    attempts().should('have.length', 4)
  })

  it('does not retry when retries are off', () => {
    callApi({ fail: '1', status: '500', retry: false })

    cy.get('#status-text').should('have.text', 'Gave up after 1 attempt (last status 500)')
    attempts().should('deep.eq', ['500: Attempt 1 failed with 500'])
  })

  it('disables the button while a slow request is in flight', () => {
    cy.intercept('GET', '/slow_api/data*', {
      body: { message: 'Stubbed and slow' },
      delay: 1500,
    }).as('data')

    callApi()

    cy.get('#call-api').should('be.disabled')
    cy.get('#status-text').should('have.text', 'Loading (attempt 1)...')
    cy.wait('@data')
    cy.get('#status-text').should('have.text', 'Stubbed and slow')
    cy.get('#call-api').should('be.enabled')
  })

  it('handles a scripted mix of failures', () => {
    // One 429 then one 500 then success, an order the server's options can't produce
    const responses = [
      {
        statusCode: 429,
        body: { error: 'Slow down' },
      },
      {
        statusCode: 500,
        body: { error: 'Server broke' },
      },
      {
        statusCode: 200,
        body: { message: 'Third time lucky' },
      },
    ]
    cy.intercept('GET', '/slow_api/data*', req => req.reply(responses.shift()!)).as('data')

    callApi()

    cy.get('#status-text', { timeout: 10_000 }).should('have.text', 'Third time lucky')
    attempts().should('deep.eq', ['429: Slow down', '500: Server broke', '200: Third time lucky'])
    cy.get('@data.all').should('have.length', 3)
  })
})
