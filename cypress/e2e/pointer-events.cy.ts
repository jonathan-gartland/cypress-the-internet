// These widgets use pointer events, not HTML5 drag and drop. The page calls setPointerCapture on
// pointerdown, which throws for a synthetic event because there's no active pointer behind it.
// The cross-browser tests stub setPointerCapture (capture only routes later events to the element,
// and the tests already send them there). The last test uses cypress-real-events for a real
// pointer, with no stub (Chromium only).
function visitWithSyntheticPointers() {
  cy.visit('/pointer_events', {
    onBeforeLoad(win) {
      cy.stub(win.Element.prototype, 'setPointerCapture')
    },
  })
}

function order() {
  return cy.get('#sortable li').then(items => Cypress.$.makeArray(items).map(li => li.textContent))
}

describe('pointer events', () => {
  it('moves a list item by dragging it down', () => {
    visitWithSyntheticPointers()

    cy.get('#sortable li').last().then(([last]) => {
      const below = last.getBoundingClientRect().bottom + 5
      cy.contains('#sortable li', 'First').trigger('pointerdown', { pointerId: 1 })
      cy.get('#sortable').trigger('pointermove', { pointerId: 1, clientY: below })
      cy.get('#sortable').trigger('pointerup', { pointerId: 1 })
    })

    order().should('deep.eq', ['Second', 'Third', 'Fourth', 'First'])
    cy.get('#order').should('have.text', 'Order: Second, Third, Fourth, First')
    cy.get('#sortable .dragging').should('not.exist')
  })

  const swipes = [
    { name: 'right', dx: 120, result: 'Swiped right (mouse)' },
    { name: 'left', dx: -120, result: 'Swiped left (mouse)' },
    { name: 'too short', dx: 20, result: 'Too short to be a swipe' },
  ]

  swipes.forEach(({ name, dx, result }) => {
    it(`recognises a ${name} swipe`, () => {
      visitWithSyntheticPointers()
      cy.get('#swipe-area').then(([area]) => {
        const box = area.getBoundingClientRect()
        const x = box.left + box.width / 2
        const y = box.top + box.height / 2
        cy.get('#swipe-area').trigger('pointerdown', {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: x,
          clientY: y,
        })
        cy.get('#swipe-area').trigger('pointerup', {
          pointerId: 1,
          pointerType: 'mouse',
          clientX: x + dx,
          clientY: y,
        })
      })
      cy.get('#swipe-result').should('have.text', result)
    })
  })

  it('tells a long press from a short one', () => {
    cy.clock()
    visitWithSyntheticPointers()

    cy.get('#long-press').trigger('pointerdown')
    cy.tick(799)
    cy.get('#long-press').trigger('pointerup')
    cy.get('#press-result').should('have.text', 'Short press (hold for 800 ms)')

    cy.get('#long-press').trigger('pointerdown')
    cy.tick(800)
    cy.get('#press-result').should('have.text', 'Long press')
    cy.get('#long-press').trigger('pointerup')
    cy.get('#press-result').should('have.text', 'Long press')
  })

  it('reorders with a real pointer', { browser: '!firefox' }, () => {
    cy.visit('/pointer_events')

    cy.contains('#sortable li', 'Fourth').realMouseDown()
    cy.contains('#sortable li', 'First').realMouseMove(10, 2, { position: 'topLeft' })
    cy.contains('#sortable li', 'First').realMouseUp({ position: 'topLeft' })

    order().should('deep.eq', ['Fourth', 'First', 'Second', 'Third'])
  })
})
