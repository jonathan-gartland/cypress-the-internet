// The captions are shown by a CSS :hover rule. Cypress's synthetic .trigger('mouseover') doesn't
// activate :hover, so the hover test uses cypress-real-events, which sends a real mouse move through
// the Chrome DevTools Protocol. That only exists in Chromium browsers, so it's skipped in Firefox;
// the other tests run everywhere.
describe('hovers', () => {
  beforeEach(() => {
    cy.visit('/hovers')
  })

  it('hides every caption until hovered', () => {
    cy.get('.figure').should('have.length', 3)
    cy.get('.figcaption').each(caption => cy.wrap(caption).should('not.be.visible'))
  })

  it('links each caption to that user\'s profile', () => {
    cy.get('.figcaption a').each((link, i) => {
      cy.wrap(link).should('have.attr', 'href', `/users/${i + 1}`)
    })
  })

  it('shows the caption for the hovered user only', { browser: '!firefox' }, () => {
    cy.get('.figure').eq(1).realHover()

    cy.get('.figcaption').eq(1).should('be.visible').find('h5').should('have.text', 'name: user2')
    cy.get('.figcaption').eq(0).should('not.be.visible')
    cy.get('.figcaption').eq(2).should('not.be.visible')
  })
})
