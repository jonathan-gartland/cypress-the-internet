// Permission prompts belong to the browser, not the page. Playwright can grant permissions up front;
// Cypress can't, so these tests stub the permission-gated APIs before the page loads and check
// the page handles each answer.
function visitWithPermissions(states: Partial<Record<string, PermissionState>>, setup?: (win: Window & typeof globalThis) => void) {
  cy.visit('/permissions', {
    onBeforeLoad(win) {
      cy.stub(win.navigator.permissions, 'query').callsFake(({ name }: { name: string }) =>
        Promise.resolve({ state: states[name] ?? 'prompt', onchange: null }),
      )
      setup?.(win as Window & typeof globalThis)
    },
  })
}

describe('browser permissions', () => {
  it('shows the state the page reads for each permission', () => {
    visitWithPermissions({
      'geolocation': 'granted',
      'notifications': 'denied',
      'camera': 'prompt',
      'microphone': 'denied',
      'clipboard-read': 'granted',
    })

    cy.get('#state-geolocation').should('have.text', 'granted')
    cy.get('#state-notifications').should('have.text', 'denied')
    cy.get('#state-camera').should('have.text', 'prompt')
    cy.get('#state-microphone').should('have.text', 'denied')
    cy.get('#state-clipboard-read').should('have.text', 'granted')
  })

  const answers = ['granted', 'denied'] as const
  answers.forEach((answer) => {
    it(`handles notifications being ${answer}`, () => {
      visitWithPermissions({ notifications: answer }, (win) => {
        cy.stub(win.Notification, 'requestPermission').as('request').resolves(answer)
      })

      cy.get('#ask-notifications').click()

      cy.get('@request').should('have.been.calledOnce')
      cy.get('#notifications-result').should('have.text', `Notifications: ${answer}`)
    })
  })

  it('copies and pastes with the clipboard', () => {
    let clipboard = ''
    visitWithPermissions({ 'clipboard-read': 'granted' }, (win) => {
      cy.stub(win.navigator.clipboard, 'writeText').callsFake((text: string) => {
        clipboard = text
        return Promise.resolve()
      })
      cy.stub(win.navigator.clipboard, 'readText').callsFake(() => Promise.resolve(clipboard))
    })

    cy.get('#copy').click()
    cy.get('#clipboard-result').should('have.text', 'Copied: Copied from the-internet')

    cy.get('#paste').click()
    cy.get('#clipboard-result').should('have.text', 'Pasted: Copied from the-internet')
  })

  it('reports a blocked camera', () => {
    visitWithPermissions({ camera: 'denied' }, (win) => {
      cy.stub(win.navigator.mediaDevices, 'getUserMedia').rejects(new DOMException('Permission denied', 'NotAllowedError'))
    })

    cy.get('#start-camera').click()

    cy.get('#camera-result').should('have.text', 'Camera blocked: NotAllowedError')
  })
})
