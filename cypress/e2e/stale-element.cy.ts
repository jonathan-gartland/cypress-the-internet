// The list is thrown away and drawn again. A tool that holds element references (Selenium's
// StaleElementReferenceException) breaks here. Cypress queries are re-run on every retry, and
// aliases of queries are re-queried, so the tests keep working on the new elements.
describe('stale element', () => {
  it('keeps working after the list is rebuilt', () => {
    cy.visit('/stale_element')
    cy.get('#items .item').first().as('firstItem')

    let original: HTMLElement
    cy.get('@firstItem').then(([el]) => {
      original = el
    })

    cy.get('#rerender').click()
    cy.get('#render-count').should('have.text', 'Rebuilt 1 time')

    // The old element is gone from the page...
    cy.wrap(null).should(() => expect(original.isConnected, 'original element still attached').to.eq(false))
    // ...but the alias is re-queried and finds the new one
    cy.get('@firstItem').should('have.text', 'Item 1').then(([el]) => {
      expect(el).not.to.eq(original)
      expect(el.isConnected).to.eq(true)
    })
  })

  it('reads the list while a timer keeps rebuilding it', () => {
    cy.visit('/stale_element?interval=500')
    cy.get('#timer-status').should('have.text', 'Timer: every 500 ms')

    // Each assertion retries its whole query chain, so a rebuild mid-check is harmless
    cy.get('#render-count').should($count => expect(Number($count.text().match(/\d+/)![0])).to.be.gte(3))
    cy.get('#items .item').should('have.length', 3)
    cy.contains('#items .item', 'Item 2').should('have.attr', 'data-index', '2')
  })
})
