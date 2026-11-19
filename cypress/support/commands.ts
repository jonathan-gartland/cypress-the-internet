import type { AxeResults, ImpactValue } from 'axe-core'

export interface User {
  username: string
  password: string
}

export const users = {
  valid: { username: 'tomsmith', password: 'SuperSecretPassword!' },
} as const satisfies Record<string, User>

/**
 * Creates a throwaway user through the-internet's Users API and yields its credentials. Names
 * are unique per call because test runs can share the server. Users expire after an hour, and
 * tests that care about cleanup delete them with `DELETE /api/users/:username`.
 */
function createUser() {
  const user: User = {
    username: `cy-${Date.now()}-${Cypress._.random(1e6)}`,
    password: `pw-${Cypress._.random(1e9)}`,
  }
  return cy.request('POST', '/api/users', user).then((response) => {
    expect(response.status).to.eq(201)
    return user
  })
}

/**
 * Logs in through the API (`POST /api/sessions` sets the same session cookie as the form) and
 * caches the session with `cy.session`. The login form itself is tested in authentication.cy.ts;
 * everything else skips it.
 */
function login(user: User = users.valid) {
  cy.session(
    ['login', user.username],
    () => {
      cy.request('POST', '/api/sessions', user).its('status').should('eq', 200)
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

/**
 * Runs axe-core on the current page (or `context`) and yields the full results. Injects axe-core
 * directly rather than through cypress-axe, which doesn't support Cypress 16.
 */
function runAxe(context = 'body') {
  return cy.readFile('node_modules/axe-core/axe.min.js', { log: false }).then((source: string) => {
    return cy.window({ log: false }).then((win) => {
      if (!('axe' in win))
        win.eval(source)
      const axe = (win as unknown as { axe: typeof import('axe-core') }).axe
      return cy.wrap(axe.run(win.document.querySelector(context)!), { log: false }) as unknown as Cypress.Chainable<AxeResults>
    })
  })
}

const blocking: ImpactValue[] = ['serious', 'critical']

/**
 * Checks the page's serious and critical axe violations, logging each one. By default there must
 * be none; pass `known` (axe rule ids) to pin a page's existing violations, so the test fails if
 * one is fixed or a new one appears.
 */
function checkA11y({ context = 'body', known = [] as string[] } = {}) {
  runAxe(context).then((results) => {
    const violations = results.violations.filter(v => blocking.includes(v.impact!))
    violations.forEach(v => Cypress.log({ name: 'a11y', message: `${v.impact}: ${v.id} (${v.nodes.length}) ${v.help}` }))
    const ids = [
      ...new Set(violations.map(v => v.id)),
    ].sort()
    expect(ids, 'serious/critical accessibility violations').to.deep.eq([...known].sort())
  })
}

Cypress.Commands.add('createUser', createUser)
Cypress.Commands.add('login', login)
Cypress.Commands.add('iframeBody', iframeBody)
Cypress.Commands.add('runAxe', runAxe)
Cypress.Commands.add('checkA11y', checkA11y)

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Create a unique user through the Users API and yield its credentials. */
      createUser: typeof createUser
      /** Log in through the API (cached per user with cy.session). Defaults to the demo user. */
      login: typeof login
      /** Yield the loaded body of a same-origin iframe. */
      iframeBody: typeof iframeBody
      /** Run axe-core on the page and yield all results. */
      runAxe: typeof runAxe
      /** Fail on serious/critical axe-core violations, other than `known` rule ids. */
      checkA11y: typeof checkA11y
    }
  }
}
