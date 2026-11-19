// Nested open roots, a closed root, slots and a form-associated custom element.
//
// A closed shadow root returns null from element.shadowRoot. Cypress runs inside the page, so it
// can't reach in either (WebDriver can, from outside). The usual workaround is to wrap
// attachShadow before the page's scripts run and keep a reference to each closed root, which the
// last context does.
describe('advanced shadow DOM', () => {
  it('clicks a button two shadow roots deep', () => {
    cy.visit('/shadowdom_advanced')

    cy.get('#outer-card').shadow().find('#inner-card').shadow().find('#inner-button').click()

    cy.get('#nested-result').should('have.text', 'You clicked the button in the inner shadow root')
  })

  it('reaches nested roots with includeShadowDom', () => {
    cy.visit('/shadowdom_advanced')
    cy.get('#inner-button', { includeShadowDom: true }).should('have.text', 'Click me')
  })

  it('fills slots from the light DOM and falls back to defaults', () => {
    cy.visit('/shadowdom_advanced')

    const assigned = (name: string) => cy.get('#slot-card').shadow().find(`slot[name="${name}"]`).then(([slot]) => (slot as HTMLSlotElement).assignedNodes().map(node => node.textContent))
    assigned('title').should('deep.eq', ['Title from the light DOM'])
    assigned('body').should('deep.eq', ['Body from the light DOM'])
    assigned('footer').should('deep.eq', [])
    cy.get('#slot-card').shadow().find('slot[name="footer"]').should('have.text', 'Default footer (nothing is slotted here)')
  })

  context('form-associated custom element', () => {
    beforeEach(() => {
      cy.visit('/shadowdom_advanced')
      cy.get('#name').type('Ada')
    })

    it('blocks the form until a rating is picked', () => {
      cy.get('#rating-form').contains('button', 'Submit').click()
      cy.get('#form-result').should('have.text', 'Error: Pick a rating')
    })

    it('submits the rating as a form value', () => {
      cy.get('#rating').shadow().find('#star-4').should('have.attr', 'aria-label', '4 stars').click()
      cy.get('#rating').shadow().find('button').then(stars => Cypress.$.makeArray(stars).map(s => s.textContent)).should('deep.eq', ['★', '★', '★', '★', '☆'])

      cy.get('#rating-form').contains('button', 'Submit').click()
      cy.get('#form-result').should('have.text', 'Submitted name: Ada, rating: 4')
    })

    it('clears the rating when the form resets', () => {
      cy.get('#rating').shadow().find('#star-2').click()
      cy.get('#rating-form').then(([form]) => (form as HTMLFormElement).reset())
      cy.get('#rating').its('0.value').should('eq', '')
    })
  })

  context('closed shadow root', () => {
    it('is out of reach for page scripts and Cypress', () => {
      cy.visit('/shadowdom_advanced')
      cy.get('#closed-card').its('0.shadowRoot').should('be.null')
      cy.get('#closed-text', { includeShadowDom: true }).should('not.exist')
    })

    it('can be reached by keeping a reference when it is attached', () => {
      cy.visit('/shadowdom_advanced', {
        onBeforeLoad(win) {
          const closedRoots = new WeakMap<Element, ShadowRoot>()
          const attachShadow = win.Element.prototype.attachShadow
          win.Element.prototype.attachShadow = function (init) {
            const root = attachShadow.call(this, init)
            if (init.mode === 'closed')
              closedRoots.set(this, root)
            return root
          }
          Object.assign(win, { closedRoots })
        },
      })

      cy.get('#closed-card').then(([card]) => {
        const win = card.ownerDocument.defaultView as unknown as { closedRoots: WeakMap<Element, ShadowRoot> }
        const root = win.closedRoots.get(card)!
        expect(root.mode).to.eq('closed')
        cy.wrap(root.getElementById('closed-text')).should('have.text', 'This text is in a closed shadow root')
        // force: Cypress's actionability check hit-tests the point, and the browser reports the host
        // there, because hit-testing can't see inside a closed root either
        // eslint-disable-next-line cypress/no-force
        cy.wrap(root.getElementById('closed-input')).type('reached it', { force: true })
        cy.wrap(root.getElementById('closed-input')).should('have.value', 'reached it')
      })
    })
  })
})
