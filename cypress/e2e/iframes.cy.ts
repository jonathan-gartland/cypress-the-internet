// Cypress has no "switch to frame" command: tests reach into same-origin frames through the
// frame's document (see cy.iframeBody in support/commands.ts).
describe('iframes', () => {
  describe('tinyMCE editor', () => {
    beforeEach(() => {
      cy.visit('/iframe')
      // TinyMCE replaces the textarea with its own iframe once it initializes
      cy.get('.tox-edit-area iframe').should('exist')
    })

    it('shows the initial content inside the editor frame', () => {
      cy.iframeBody('.tox-edit-area iframe').should('have.id', 'tinymce').find('p').should('have.text', 'Your content goes here.')
    })

    it('replaces the content and formats it as bold', () => {
      cy.iframeBody('.tox-edit-area iframe').as('editor')
      cy.get('@editor').clear()
      cy.get('@editor').type('Written by Cypress')
      cy.get('@editor').find('p').should('have.text', 'Written by Cypress')

      cy.get('@editor').type('{selectall}')
      cy.get('button[aria-label="Bold"]').click()
      cy.get('@editor').find('p strong').should('have.text', 'Written by Cypress')
    })
  })

  describe('nested frames', () => {
    beforeEach(() => {
      cy.visit('/nested_frames')
    })

    it('reads each frame, including frames inside a frame', () => {
      cy.iframeBody('frame[name="frame-bottom"]').should('contain.text', 'BOTTOM')

      cy.iframeBody('frame[name="frame-top"]').within(() => {
        const expected = { 'frame-left': 'LEFT', 'frame-middle': 'MIDDLE', 'frame-right': 'RIGHT' }
        Object.entries(expected).forEach(([name, text]) => {
          cy.iframeBody(`frame[name="${name}"]`).should('contain.text', text)
        })
      })
    })
  })
})
