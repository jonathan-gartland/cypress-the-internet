// Native pickers look different in every browser, but their values always use the same ISO
// formats, and Cypress types those directly. The calendar widget opens on "today", so the test
// fixes today with cy.clock to get the same month every run.
describe('date and time pickers', () => {
  it('fills the native inputs with ISO values', () => {
    cy.visit('/date_pickers')

    const values = {
      date: '2026-04-15',
      time: '13:45',
      datetime: '2026-04-15T13:45',
      // Firefox has no month/week pickers and shows text fields instead; the values still work
      month: '2026-04',
      week: '2026-W16',
    }
    Object.entries(values).forEach(([id, value]) => {
      cy.get(`#${id}`).type(value)
      cy.get(`#${id}`).should('have.value', value)
    })

    cy.get('#native-result').should('have.text', 'date: 2026-04-15, time: 13:45, datetime: 2026-04-15T13:45, month: 2026-04, week: 2026-W16')
  })

  it('rejects a date outside min/max', () => {
    cy.visit('/date_pickers')
    cy.get('#date').type('1999-12-31')
    cy.get('#date').its('0.validity.rangeUnderflow').should('eq', true)
  })

  context('calendar widget', () => {
    beforeEach(() => {
      // Fix "today" at 10 April 2026; only Date is faked, so the page's timers still run
      cy.clock(new Date(2026, 3, 10), ['Date'])
      cy.visit('/date_pickers')
    })

    it('opens on the current month and picks a day', () => {
      cy.get('#widget-date').should('have.attr', 'readonly')
      cy.get('#open-calendar').click()
      cy.get('#calendar-month').should('have.text', 'April 2026')
      // 1 April 2026 is a Wednesday: two empty cells (Mo, Tu) before it
      cy.get('#calendar-days tr').first().find('td').eq(2).should('have.text', '1')

      cy.get('[data-date="2026-04-15"]').click()

      cy.get('#widget-date').should('have.value', '2026-04-15')
      cy.get('#calendar').should('not.be.visible')
      cy.get('#open-calendar').should('have.attr', 'aria-expanded', 'false')
    })

    it('moves across a year boundary', () => {
      cy.visit('/date_pickers?month=2026-12')
      cy.get('#open-calendar').click()
      cy.get('#calendar-month').should('have.text', 'December 2026')

      cy.get('#next-month').click()
      cy.get('#calendar-month').should('have.text', 'January 2027')
      cy.get('[data-date="2027-01-31"]').click()

      cy.get('#widget-date').should('have.value', '2027-01-31')
    })
  })
})
