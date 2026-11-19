import type { ImpactValue, Result } from 'axe-core'

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

/**
 * Yields the body of a same-origin iframe once it has content. Cypress doesn't switch into
 * frames, so the test reaches through `contentDocument` and retries until the frame has loaded.
 */
function iframeBody(selector: string) {
  return cy
    .get(selector)
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(body => cy.wrap(body as HTMLElement))
}

const blocking: ImpactValue[] = ['serious', 'critical']

/**
 * Runs axe-core on the current page and checks its serious and critical violations, logging each
 * one. By default there must be none; pass `known` (axe rule ids) to pin a page's existing
 * violations, so the test fails if one is fixed or a new one appears. Injects axe-core directly
 * rather than through cypress-axe, which doesn't support Cypress 16.
 */
function checkA11y({ context = 'body', known = [] as string[] } = {}) {
  cy.readFile('node_modules/axe-core/axe.min.js', { log: false }).then((source: string) => {
    cy.window({ log: false }).then((win) => {
      if (!('axe' in win))
        win.eval(source)
      const axe = (win as unknown as { axe: typeof import('axe-core') }).axe
      return cy.wrap(axe.run(win.document.querySelector(context)!), { log: false })
    })
  }).then((results) => {
    const violations = (results as unknown as { violations: Result[] }).violations.filter(v => blocking.includes(v.impact!))
    violations.forEach(v => Cypress.log({ name: 'a11y', message: `${v.impact}: ${v.id} (${v.nodes.length}) ${v.help}` }))
    const ids = [
      ...new Set(violations.map(v => v.id)),
    ].sort()
    expect(ids, 'serious/critical accessibility violations').to.deep.eq([...known].sort())
  })
}

Cypress.Commands.add('login', login)
Cypress.Commands.add('iframeBody', iframeBody)
Cypress.Commands.add('checkA11y', checkA11y)

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Log in (cached per user with cy.session). Defaults to the valid demo user. */
      login: typeof login
      /** Yield the loaded body of a same-origin iframe. */
      iframeBody: typeof iframeBody
      /** Fail on serious/critical axe-core violations on the current page. */
      checkA11y: typeof checkA11y
    }
  }
}
