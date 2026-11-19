// Three frames that a plain "switch to frame" doesn't handle:
// - sandboxed: its own opaque origin, so neither the page nor Cypress can read it (cy.origin needs
//   a real origin). The test checks the page really can't, then sends the message the frame would
//   send, to test the page's side of the postMessage contract.
// - srcdoc: no URL, same origin as the page, so cy.iframeBody works.
// - inside a shadow root: find the host, go through .shadow(), then into the frame.
describe('advanced iframes', () => {
  beforeEach(() => {
    cy.visit('/iframes_advanced')
  })

  context('sandboxed frame', () => {
    it('can\'t be read by the page', () => {
      cy.get('#sandboxed-frame').should('have.attr', 'sandbox', 'allow-scripts')
      cy.get('#parent-access').should('have.text', 'The page can\'t read the sandboxed frame')
      cy.get('#sandboxed-frame').its('0.contentDocument').should('be.null')
    })

    it('shows a postMessage from the frame', () => {
      cy.window().then(win => win.postMessage({ from: 'sandboxed', text: 'hello' }, '*'))
      cy.get('#message-log').should('have.text', 'Message from the sandboxed frame: hello')
    })
  })

  it('reads and types into a srcdoc frame', () => {
    cy.get('#srcdoc-frame').should('not.have.attr', 'src')
    cy.iframeBody('#srcdoc-frame').within(() => {
      cy.get('#srcdoc-text').should('have.text', 'Hello from srcdoc')
      cy.get('#srcdoc-input').type('typed in srcdoc')
      cy.get('#srcdoc-input').should('have.value', 'typed in srcdoc')
    })
  })

  it('uses a frame inside a shadow root to message the page', () => {
    cy.get('#frame-host').shadow().find('#shadow-frame').its('0.contentDocument.body').should('not.be.empty').then((body) => {
      cy.wrap(body).find('#frame-title').should('have.text', 'Frame: shadow')
      cy.wrap(body).find('#send-message').click()
      cy.wrap(body).find('#send-message').should('have.text', 'Message sent')
    })

    cy.get('#message-log').should('have.text', 'Message from the shadow frame: hello')
  })
})
