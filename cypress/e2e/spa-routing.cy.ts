// The views change with history.pushState, so there is no page load to wait for. A property set
// on the window before navigating proves the page wasn't reloaded: a reload would clear it.
describe('single-page app routing', () => {
  beforeEach(() => {
    cy.visit('/spa')
    cy.window().then((win) => {
      (win as Window & { notReloaded?: boolean }).notReloaded = true
    })
  })

  function assertView(path: string, title: string) {
    cy.location('pathname').should('eq', path)
    cy.get('#view-title').should('have.text', title)
    cy.contains('#spa-nav a', title).should('have.attr', 'aria-current', 'page')
  }

  it('changes the URL and view without reloading the page', () => {
    assertView('/spa', 'Home')

    cy.contains('#spa-nav a', 'About').click()
    assertView('/spa/about', 'About')
    cy.get('#view-text').should('have.text', 'This view was drawn by JavaScript.')

    cy.contains('#spa-nav a', 'Contact').click()
    assertView('/spa/contact', 'Contact')

    cy.window().its('notReloaded').should('eq', true)
    cy.get('#page-loads').should('have.text', 'Page loaded once; views shown without a reload: 2')
  })

  it('supports Back and Forward', () => {
    cy.contains('#spa-nav a', 'About').click()
    cy.contains('#spa-nav a', 'Contact').click()

    cy.go('back')
    assertView('/spa/about', 'About')
    cy.go('back')
    assertView('/spa', 'Home')
    cy.go('forward')
    assertView('/spa/about', 'About')

    cy.window().its('notReloaded').should('eq', true)
  })

  it('opens each route directly from its URL', () => {
    const routes = [
      { path: '/spa/about', title: 'About' },
      { path: '/spa/contact', title: 'Contact' },
    ]
    routes.forEach(({ path, title }) => {
      cy.visit(path)
      assertView(path, title)
    })
  })
})
