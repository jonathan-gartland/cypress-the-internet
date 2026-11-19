// SVG elements live in their own namespace. XPath needs *[local-name()='rect'], but CSS selectors
// (which Cypress uses) match SVG elements as they are, and data- attributes carry the chart's data.
describe('inline SVG chart', () => {
  beforeEach(() => {
    cy.visit('/svg')
  })

  it('reads the chart data from the bars', () => {
    cy.get('#chart').should('have.attr', 'role', 'img')
    cy.get('#chart title').should('have.text', 'Fruit sales')

    cy.get('#chart rect.bar').then(bars => Cypress.$.makeArray(bars).map(bar => [
      bar.dataset.label,
      Number(bar.dataset.value),
    ])).should('deep.eq', [
      ['Apples', 120],
      ['Bananas', 180],
      ['Cherries', 60],
    ])
  })

  it('draws taller bars for bigger values', () => {
    cy.get('#chart rect.bar').each((bar) => {
      expect(Number(bar.attr('height'))).to.eq(Number(bar.attr('data-value')))
    })
  })

  it('selects one bar at a time', () => {
    cy.get('#bar-bananas').click()
    cy.get('#bar-bananas').should('have.attr', 'fill', '#f55524')
    cy.get('#result').should('have.text', 'Selected Bananas: 180')

    cy.get('#bar-cherries').click()
    cy.get('#bar-cherries').should('have.attr', 'fill', '#f55524')
    cy.get('#bar-bananas').should('have.attr', 'fill', '#334bc3')
    cy.get('#result').should('have.text', 'Selected Cherries: 60')
  })

  it('toggles the circle', () => {
    cy.get('#toggle-circle').click()
    cy.get('#toggle-circle').should('have.attr', 'fill', '#961001')
    cy.get('#circle-label').should('have.text', 'Clicked')
    cy.get('#result').should('have.text', 'Circle is red')

    cy.get('#toggle-circle').click()
    cy.get('#result').should('have.text', 'Circle is green')
  })
})
