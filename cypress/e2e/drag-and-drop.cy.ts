// The page uses the HTML5 drag-and-drop API, which reads and writes a DataTransfer object.
// Cypress doesn't drag natively, so the test fires the same events the browser would, sharing one
// DataTransfer between them.
function dragOnto(source: string, target: string) {
  const dataTransfer = new DataTransfer()
  cy.get(source).trigger('dragstart', { dataTransfer })
  for (const event of ['dragenter', 'dragover', 'drop'])
    cy.get(target).trigger(event, { dataTransfer })
  cy.get(source).trigger('dragend', { dataTransfer })
}

describe('drag and drop', () => {
  beforeEach(() => {
    cy.visit('/drag_and_drop')
  })

  it('swaps column A and column B', () => {
    cy.get('#column-a header').should('have.text', 'A')
    cy.get('#column-b header').should('have.text', 'B')

    dragOnto('#column-a', '#column-b')

    cy.get('#column-a header').should('have.text', 'B')
    cy.get('#column-b header').should('have.text', 'A')
  })

  it('swaps back on a second drag', () => {
    dragOnto('#column-a', '#column-b')
    dragOnto('#column-b', '#column-a')

    cy.get('#column-a header').should('have.text', 'A')
    cy.get('#column-b header').should('have.text', 'B')
    cy.get('.column.over').should('not.exist')
  })
})
