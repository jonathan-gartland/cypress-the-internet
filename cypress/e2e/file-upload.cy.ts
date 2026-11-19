const fixture = 'cypress/fixtures/upload-sample.txt'

describe('file upload', () => {
  beforeEach(() => {
    cy.visit('/upload')
  })

  it('uploads through the file input and form', () => {
    cy.get('#file-upload').selectFile(fixture)
    cy.get('#file-submit').click()

    cy.get('h3').should('have.text', 'File Uploaded!')
    cy.get('#uploaded-files').should('contain.text', 'upload-sample.txt')
  })

  it('uploads by dropping a file on the drop zone', () => {
    cy.intercept('POST', '/upload').as('upload')

    cy.get('#drag-drop-upload').selectFile(fixture, { action: 'drag-drop' })

    cy.wait('@upload').its('response.statusCode').should('eq', 200)
    cy.get('#drag-drop-upload .dz-filename').should('have.text', 'upload-sample.txt')
    cy.get('#drag-drop-upload .dz-preview').should('have.class', 'dz-success')
  })
})
