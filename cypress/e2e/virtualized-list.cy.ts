// Only the rows in view (plus a small buffer) exist in the DOM. A row far down the list can't be
// found until the container is scrolled to it.
const ROW_HEIGHT = 30
const TOTAL = 10_000

function scrollToItem(n: number) {
  cy.get('#viewport').scrollTo(0, (n - 1) * ROW_HEIGHT)
}

describe('virtualized list', () => {
  beforeEach(() => {
    cy.visit('/virtual_list')
  })

  it('keeps only a small window of rows in the DOM', () => {
    cy.get('#viewport .virtual-row').should('have.length.lessThan', 40)
    cy.get('#rendered-range').should('contain.text', `of ${TOTAL}`)
    cy.contains('.virtual-row', 'Item 5000').should('not.exist')
  })

  it('finds a far-away row after scrolling to it', () => {
    scrollToItem(5000)

    cy.contains('.virtual-row', /^Item 5000$/).should('be.visible').and('have.attr', 'data-index', '5000')
    cy.contains('.virtual-row', /^Item 1$/).should('not.exist')
    cy.get('#viewport .virtual-row').should('have.length.lessThan', 40)
  })

  it('reaches the last row', () => {
    cy.get('#viewport').scrollTo('bottom')

    cy.contains('.virtual-row', `Item ${TOTAL}`).should('be.visible')
    cy.get('#rendered-range').should('contain.text', `to ${TOTAL} of ${TOTAL}`)
  })
})
