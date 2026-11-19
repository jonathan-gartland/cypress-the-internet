// <dialog> opened with showModal() makes the rest of the page inert and moves focus inside;
// show() leaves the page usable. Escape only closes a modal on a real key press, which Cypress's
// synthetic {esc} isn't, so that test uses cypress-real-events (Chromium only).
describe('native dialog', () => {
  beforeEach(() => {
    cy.visit('/dialog')
  })

  it('opens a modal that takes focus and makes the page inert', () => {
    cy.get('#open-modal').click()

    cy.get('#modal-dialog').should('have.attr', 'open')
    cy.get('#modal-dialog').should('match', ':modal')
    cy.get('#modal-name').should('be.focused')
    cy.get('#result').should('have.text', 'Modal dialog is open')

    // The rest of the page is under the modal's backdrop, so it can't be hit
    cy.get('#page-input').then(([input]) => {
      const box = input.getBoundingClientRect()
      const hit = input.ownerDocument.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
      expect(hit, 'element at the page field\'s position').not.to.eq(input)
    })
  })

  it('returns the button value and the field when confirmed', () => {
    cy.get('#open-modal').click()
    cy.get('#modal-name').type('Ada')
    cy.get('#modal-confirm').click()

    cy.get('#modal-dialog').should('not.have.attr', 'open')
    cy.get('#result').should('have.text', 'Modal dialog closed with: confirm (name: Ada)')
  })

  it('returns "cancel" from the cancel button', () => {
    cy.get('#open-modal').click()
    cy.get('#modal-cancel').click()

    cy.get('#result').should('have.text', 'Modal dialog closed with: cancel')
  })

  it('closes the modal with Escape', { browser: '!firefox' }, () => {
    cy.get('#open-modal').click()
    cy.get('#modal-name').should('be.focused')

    cy.realPress('Escape')

    cy.get('#modal-dialog').should('not.have.attr', 'open')
    cy.get('#result').should('have.text', 'Modal dialog closed with Escape')
  })

  it('leaves the page usable with a non-modal dialog', () => {
    cy.get('#open-non-modal').click()

    cy.get('#non-modal-dialog').should('have.attr', 'open')
    cy.get('#non-modal-dialog').should('not.match', ':modal')
    cy.get('#page-input').type('still usable')
    cy.get('#page-input').should('have.value', 'still usable')

    cy.get('#non-modal-close').click()
    cy.get('#result').should('have.text', 'Non-modal dialog closed')
  })
})
