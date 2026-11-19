// Below 640px the menu turns into a toggle button and the cards stack. cy.viewport resizes the
// app's frame, which applies the CSS media queries.
function layoutName() {
  // The page writes the layout name with CSS (#layout-name::after { content: ... })
  return cy.get('#layout-name').then(([el]) => el.ownerDocument.defaultView!.getComputedStyle(el, '::after').content.replaceAll('"', ''))
}

function cardTops() {
  return cy.get('#cards .card').then(cards => Cypress.$.makeArray(cards).map(card => card.getBoundingClientRect().top))
}

describe('responsive layout', () => {
  context('desktop (1280px)', () => {
    beforeEach(() => {
      cy.viewport(1280, 800)
      cy.visit('/responsive')
    })

    it('shows the full menu and no toggle', () => {
      layoutName().should('eq', 'desktop')
      cy.get('#menu-toggle').should('not.be.visible')
      cy.get('#site-nav').should('be.visible')
    })

    it('lays the cards out in one row', () => {
      cardTops().should(tops => expect(new Set(tops).size, 'distinct card rows').to.eq(1))
    })
  })

  context('mobile (375px)', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
      cy.visit('/responsive')
    })

    it('hides the menu behind a toggle', () => {
      layoutName().should('eq', 'mobile')
      cy.get('#site-nav').should('not.be.visible')
      cy.get('#menu-toggle').should('be.visible').and('have.attr', 'aria-expanded', 'false')
    })

    it('opens the menu, follows a link and closes it again', () => {
      cy.get('#menu-toggle').click()
      cy.get('#menu-toggle').should('have.attr', 'aria-expanded', 'true')
      cy.get('#site-nav').should('be.visible')

      cy.contains('#site-nav a', 'Pricing').click()

      cy.get('#nav-result').should('have.text', 'You clicked Pricing')
      cy.get('#site-nav').should('not.be.visible')
      cy.get('#menu-toggle').should('have.attr', 'aria-expanded', 'false')
    })

    it('stacks the cards in one column', () => {
      cardTops().should(tops => expect(new Set(tops).size, 'distinct card rows').to.eq(3))
    })
  })
})
