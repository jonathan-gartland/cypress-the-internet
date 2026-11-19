// Downloads that don't come from a link to a file: a Blob made in the page, fetch-then-save, a
// data: URL, and Content-Disposition edge cases from the server. Browser-made files are checked
// in the downloads folder; header cases are checked with cy.request, since the browser's own
// naming of odd headers varies between browsers.
function downloaded(name: string) {
  return cy.readFile(`${Cypress.config('downloadsFolder')}/${name}`)
}

describe('modern file download', () => {
  beforeEach(() => {
    cy.visit('/download_modern')
  })

  it('saves a CSV made with a Blob', () => {
    cy.get('#blob-download').click()

    cy.get('#download-status').should('have.text', 'Saved report.csv (28 bytes, text/csv)')
    downloaded('report.csv').should('eq', 'name,count\napple,3\nbanana,5\n')
  })

  it('fetches JSON and saves it under the server\'s file name', () => {
    cy.intercept('GET', '/download_modern/file/report.json').as('report')
    cy.get('#fetch-download').click()

    cy.wait('@report').its('response.headers.content-disposition').should('eq', 'attachment; filename="report.json"')
    cy.get('#download-status').should('contain.text', 'Saved report.json')
    downloaded('report.json').should('deep.eq', { fruit: 'apple', count: 3 })
  })

  it('saves a file from a data: URL', () => {
    cy.get('#data-url-download').should('have.attr', 'download', 'hello.txt').click()

    cy.get('#download-status').should('have.text', 'Saved hello.txt from a data URL')
    downloaded('hello.txt').should('eq', 'Hello from a data URL\n')
  })

  const dispositions = [
    { file: 'inline', header: 'inline; filename="inline.txt"', about: 'opens in the browser' },
    { file: 'utf8', header: 'attachment; filename="resume.txt"; filename*=UTF-8\'\'r%C3%A9sum%C3%A9.txt', about: 'UTF-8 name with an ASCII fallback' },
    { file: 'spaces', header: 'attachment; filename="my report 2026.txt"', about: 'spaces in the name' },
    { file: 'no_name', header: 'attachment', about: 'no file name at all' },
  ]

  dispositions.forEach(({ file, header, about }) => {
    it(`sends the right Content-Disposition: ${about}`, () => {
      cy.request(`/download_modern/file/${file}`).then((response) => {
        expect(response.headers['content-disposition']).to.eq(header)
        expect(response.body).to.be.a('string').and.have.length.greaterThan(0)
      })
    })
  })

  it('decodes the UTF-8 file name the browser should use', () => {
    cy.request('/download_modern/file/utf8').its('headers.content-disposition').then((header) => {
      const encoded = /filename\*=UTF-8''([^;]+)/.exec(String(header))![1]
      expect(decodeURIComponent(encoded)).to.eq('résumé.txt')
    })
  })
})
