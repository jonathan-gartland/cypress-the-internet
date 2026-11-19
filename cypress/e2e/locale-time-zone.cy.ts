// The greeting comes from the server (Accept-Language header or ?lang=). The date, number and price
// are formatted by the browser from navigator.language and its time zone, so those tests change
// the browser side: navigator.language is stubbed before load (all browsers), and the time zone is
// overridden through the Chrome DevTools Protocol (Chromium only; Cypress has no time zone option).
describe('locale and time zone', () => {
  context('from the server', () => {
    const greetings = [
      { lang: 'es', text: '¡Hola!' },
      { lang: 'de', text: 'Hallo!' },
      { lang: 'ja', text: 'こんにちは！' },
    ]

    greetings.forEach(({ lang, text }) => {
      it(`greets in "${lang}" from the Accept-Language header`, () => {
        cy.visit('/locale', {
          headers: { 'Accept-Language': `${lang},en;q=0.5` },
        })
        cy.get('#server-language').should('have.text', lang)
        cy.get('#greeting').should('have.attr', 'lang', lang).and('have.text', text)
      })
    })

    it('lets ?lang= override the header', () => {
      cy.visit('/locale?lang=fr', {
        headers: { 'Accept-Language': 'de' },
      })
      cy.get('#server-language').should('have.text', 'fr')
    })
  })

  context('from the browser', () => {
    it('formats numbers and prices for the browser\'s language', () => {
      cy.visit('/locale', {
        onBeforeLoad(win) {
          Object.defineProperty(win.navigator, 'language', { value: 'de-DE' })
        },
      })

      cy.get('#browser-language').should('have.text', 'de-DE')
      cy.get('#formatted-number').should('have.text', '1.234.567,891')
      // Intl separates the amount and the currency sign with a no-break space
      cy.get('#formatted-price').invoke('text').should('eq', '1.234,50 €')
      cy.get('#formatted-date').should('contain.text', '15. April 2026')
    })

    it('shows the date in an overridden time zone', { browser: '!firefox' }, () => {
      cy.wrap(Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setTimezoneOverride',
        params: { timezoneId: 'Asia/Tokyo' },
      }))
      cy.visit('/locale', {
        onBeforeLoad(win) {
          Object.defineProperty(win.navigator, 'language', { value: 'en-US' })
        },
      })

      cy.get('#browser-timezone').should('have.text', 'Asia/Tokyo')
      // 12:00 UTC is 21:00 in Tokyo (UTC+9). Browsers differ on the space before "PM" (a narrow
      // no-break space in some versions), so whitespace is normalized before comparing.
      cy.get('#formatted-date').invoke('text').then(text => text.replace(/\s/g, ' ')).should('eq', 'Wednesday, April 15, 2026 at 9:00 PM')
    })
  })
})
