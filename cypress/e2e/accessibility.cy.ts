// Runs axe-core (cy.checkA11y in support/commands.ts) and checks serious and critical violations.
// the-internet isn't built to be accessible, so some pages have known issues. Those are pinned by
// rule id: the test fails if one is fixed (update the list) or a new one appears.
describe('accessibility', () => {
  const clean = [
    '/login',
    '/form_validation',
    '/custom_dropdown',
    '/autocomplete',
    '/tables',
  ]

  clean.forEach((path) => {
    it(`${path} has no serious or critical violations`, () => {
      cy.visit(path)
      cy.checkA11y()
    })
  })

  const knownIssues = [
    {
      path: '/checkboxes',
      known: ['label'],
      why: 'checkboxes have no labels',
    },
    {
      path: '/dropdown',
      known: ['select-name'],
      why: 'the <select> has no accessible name',
    },
    {
      path: '/inputs',
      known: ['label'],
      why: 'the number input has no label',
    },
  ]

  knownIssues.forEach(({ path, known, why }) => {
    it(`${path} has only its known violations (${why})`, () => {
      cy.visit(path)
      cy.checkA11y({ known })
    })
  })
})
