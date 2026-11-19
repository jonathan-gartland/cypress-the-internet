// Each <my-paragraph> has an open shadow root holding a styled <p> with a <slot>. The slotted
// content stays in the light DOM; the <p> and its styles only exist inside the shadow root.
describe('shadow DOM', () => {
  beforeEach(() => {
    cy.visit('/shadowdom')
  })

  it('reaches into the shadow root with .shadow()', () => {
    cy.get('my-paragraph').should('have.length', 2)
    cy.get('my-paragraph').first().shadow().find('p').should('have.css', 'background-color', 'rgb(102, 102, 102)').and('have.css', 'color', 'rgb(255, 255, 255)')
  })

  it('does not see shadow content without opting in', () => {
    cy.get('my-paragraph').find('p').should('not.exist')
    cy.get('my-paragraph').find('p', { includeShadowDom: true }).should('have.length', 2)
  })

  it('renders the slotted content instead of the default text', () => {
    cy.get('my-paragraph').first().shadow().find('slot').then(([slot]) => {
      const assigned = (slot as HTMLSlotElement).assignedElements()
      expect(assigned).to.have.length(1)
      expect(assigned[0].textContent).to.eq('Let\'s have some different text!')
    })

    cy.get('my-paragraph').eq(1).find('li').should('have.length', 2).last().should('have.text', 'In a list!')
    cy.contains('My default text').should('not.exist')
  })
})
