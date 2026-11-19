// Clicking a download link saves the file to Cypress's downloadsFolder; the test then checks the
// saved file is byte-for-byte what the server sends. Both sides are read as raw bytes, because
// cy.readFile would otherwise parse .json files into objects.
describe('file download', () => {
  const files = ['sample.csv', 'sample.json', 'some-file.txt']

  beforeEach(() => {
    cy.visit('/download')
  })

  files.forEach((file) => {
    it(`downloads ${file} with the server's content`, () => {
      cy.request({ url: `/download/${file}`, encoding: 'binary' }).its('body').then((served: string) => {
        cy.contains('a', file).click()

        const path = `${Cypress.config('downloadsFolder')}/${file}`
        // cy.readFile retries until the download has finished writing
        cy.readFile(path, null).should((saved) => {
          expect(saved.equals(Cypress.Buffer.from(served, 'binary')), `${file} matches the server`).to.eq(true)
        })
      })
    })
  })
})
