// The page lists its own deliberate issues in a table (one axe rule per row). The test reads that
// table and checks axe finds each issue on the element the table names, then checks the fixed page.
//
// axe can't always decide color contrast: here it reports the backgrounds as overlapped and files
// color-contrast under "incomplete" (needs manual review), not as a violation. A real finding about
// automated accessibility checks, so the test asserts that explicitly instead of hiding it.
describe('accessibility issues page', () => {
  it('has every issue its table declares', () => {
    cy.visit('/accessibility_issues')

    cy.get('#known-issues tbody tr').then((rows) => {
      const declared = (Cypress.$.makeArray(rows) as HTMLTableRowElement[]).map(row => ({
        rule: row.dataset.rule!,
        target: row.cells[1].textContent!,
      }))
      expect(declared).to.have.length(8)

      cy.runAxe().then((results) => {
        declared.forEach(({ rule, target }) => {
          const found = [
            ...results.violations,
            ...results.incomplete,
          ].find(r => r.id === rule)
          expect(found, `axe result for ${rule}`).not.to.eq(undefined)
          if (rule === 'color-contrast') {
            expect(results.incomplete.map(r => r.id), 'color-contrast needs manual review').to.include(rule)
            return
          }
          const targets = found!.nodes.map(node => node.target.join(' '))
          expect(targets, `${rule} targets`).to.include(target)
        })
      })
    })
  })

  it('has no serious or critical issues once fixed', () => {
    cy.visit('/accessibility_issues?fixed=true')
    cy.get('#mode').should('not.contain.text', 'issues on purpose')
    cy.checkA11y()
  })
})
