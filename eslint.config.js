// ESLint handles linting and formatting (via @antfu/eslint-config's stylistic rules), so there is
// no Prettier. `pnpm lint:fix` formats the code.
import antfu from '@antfu/eslint-config'
import pluginCypress from 'eslint-plugin-cypress'

export default antfu(
  {
    typescript: true,
    ignores: [
      'cypress/downloads/**',
      'cypress/reports/**',
      'cypress/screenshots/**',
      'cypress/videos/**',
    ],
  },
  {
    files: ['cypress/**/*.ts'],
    ...pluginCypress.configs.recommended,
  },
  {
    files: ['cypress/**/*.ts'],
    rules: {
      // Tests should wait on the app, never on the clock
      'cypress/no-unnecessary-waiting': 'error',
      'cypress/no-force': 'warn',
      'cypress/assertion-before-screenshot': 'warn',
      // Mocha's describe/it are globals in Cypress
      'test/consistent-test-it': [
        'error',
        { fn: 'it' },
      ],
    },
  },
)
