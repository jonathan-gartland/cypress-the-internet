// Stubs navigator.geolocation before the page loads, so the test controls the position and never
// waits on a browser permission prompt.
const position = { latitude: 37.7749, longitude: -122.4194 }

describe('geolocation', () => {
  beforeEach(() => {
    cy.visit('/geolocation', {
      onBeforeLoad(win) {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition')
          .as('getCurrentPosition')
          .callsFake((success: PositionCallback) => success({ coords: position } as GeolocationPosition))
      },
    })
  })

  it('shows the stubbed latitude and longitude', () => {
    cy.contains('button', 'Where am I?').click()

    cy.get('@getCurrentPosition').should('have.been.calledOnce')
    cy.get('#lat-value').should('have.text', String(position.latitude))
    cy.get('#long-value').should('have.text', String(position.longitude))
  })

  it('links to the position on Google Maps', () => {
    cy.contains('button', 'Where am I?').click()

    cy.get('#map-link a')
      .should('have.attr', 'href', `http://maps.google.com/?q=${position.latitude},${position.longitude}`)
  })
})
