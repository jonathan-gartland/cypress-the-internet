// Reads the table into plain objects and checks the data, not just that the table rendered.
interface Row {
  lastName: string
  firstName: string
  email: string
  due: number
  website: string
}

function readRows(table: string): Cypress.Chainable<Row[]> {
  return cy.get(`${table} tbody tr`).then(rows =>
    Cypress.$.makeArray(rows).map((row) => {
      const [lastName, firstName, email, due, website] = Cypress.$.makeArray(row.querySelectorAll('td')).map(td => td.textContent!.trim())
      return {
        lastName,
        firstName,
        email,
        due: Number(due.replace('$', '')),
        website,
      }
    }),
  )
}

describe('sortable data tables', () => {
  beforeEach(() => {
    cy.visit('/tables')
  })

  it('shows the expected people', () => {
    readRows('#table1').then((rows) => {
      expect(rows).to.have.length(4)
      expect(rows.map(r => r.email)).to.include.members([
        'jsmith@gmail.com',
        'fbach@yahoo.com',
        'jdoe@hotmail.com',
        'tconway@earthlink.net',
      ])
      rows.forEach(row => expect(row.due, `${row.lastName} due`).to.be.a('number').and.not.be.NaN)
    })
  })

  it('sorts by amount due, ascending then descending', () => {
    cy.contains('#table1 th', 'Due').click()
    readRows('#table1').then((rows) => {
      const due = rows.map(r => r.due)
      expect(due).to.deep.eq([...due].sort((a, b) => a - b))
    })

    cy.contains('#table1 th', 'Due').click()
    readRows('#table1').then((rows) => {
      const due = rows.map(r => r.due)
      expect(due).to.deep.eq([...due].sort((a, b) => b - a))
    })
  })

  it('sorts by last name', () => {
    cy.contains('#table1 th', 'Last Name').click()
    readRows('#table1').then((rows) => {
      const names = rows.map(r => r.lastName)
      expect(names).to.deep.eq([...names].sort((a, b) => a.localeCompare(b)))
    })
  })
})
