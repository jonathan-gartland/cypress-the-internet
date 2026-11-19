# cypress-the-internet

[![E2E](https://github.com/jonathan-gartland/cypress-the-internet/actions/workflows/e2e.yml/badge.svg)](https://github.com/jonathan-gartland/cypress-the-internet/actions/workflows/e2e.yml)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

An end-to-end test suite written in Cypress and TypeScript for
[the-internet](https://github.com/saucelabs/the-internet), Sauce Labs' collection of pages built
to be hard to automate.

The suite runs against a local Docker build of the-internet pinned to a specific commit, not the
public Heroku site. Runs are repeatable, work offline, and never depend on someone else's server.

## What it covers

39 specs, 164 tests. Each covers a the-internet page (or a few) and shows a technique for something that's
awkward to automate.

[docs/coverage.md](docs/coverage.md) reviews all 76 the-internet pages: what each makes hard to
automate, how common that is in modern apps, and which are covered or planned.

| Spec | Page | What it shows |
| --- | --- | --- |
| `authentication` | Form Authentication | Valid and invalid logins (data-driven), logout, users created and deleted through the Users API; `cy.login` gets the session from the API with `cy.session` |
| `dynamic-loading` | Dynamic Loading | Waiting on the app with a longer assertion timeout, never `cy.wait(ms)` |
| `javascript-alerts` | JavaScript Alerts | `window:alert`/`window:confirm` events to check text and choose OK or Cancel; stubbing `window.prompt` |
| `sortable-tables` | Sortable Data Tables | Reading a table into typed rows and checking sort order on the data |
| `iframes` | iFrame, Nested Frames | Typing and formatting inside TinyMCE's iframe; frames nested in frames, via a `cy.iframeBody` command |
| `shadow-dom` | Shadow DOM | `.shadow()`, `includeShadowDom`, computed styles inside the shadow root, slotted content |
| `multiple-windows` | Multiple Windows | Checking a `target="_blank"` link, then opening its page in the same tab (Cypress drives one tab) |
| `file-upload` | File Upload | `selectFile` through the form and by drag-and-drop onto a Dropzone, waiting on the upload request |
| `file-download` | File Download | Downloading through the UI and comparing the saved file byte for byte with the server's |
| `drag-and-drop` | Drag and Drop | Firing HTML5 drag events with a shared `DataTransfer` to swap columns |
| `hovers` | Hovers | CSS `:hover` with `cypress-real-events` (Chromium only; skipped in Firefox) |
| `status-codes` | Status Codes | `cy.request` for the HTTP status, `cy.visit` with `failOnStatusCode: false` for error pages |
| `autocomplete` | Autocomplete | Waiting on the real request, keyboard selection and ARIA state; `cy.intercept` stubs for fixture, empty and slow responses |
| `geolocation` | Geolocation | Stubbing `navigator.geolocation` before load, so there's no permission prompt |
| `accessibility` | Several pages | axe-core via a `cy.checkA11y` command: clean pages must stay clean, known violations are pinned by rule |
| `spa-routing` | SPA Routing | `pushState` navigation with no reload (proved with a window marker), Back/Forward, deep links |
| `stale-element` | Stale Element | A list rebuilt on a timer: Cypress re-queries, and aliases re-query to the new elements |
| `virtualized-list` | Virtualized List | Scrolling a 10,000-row list until the target row exists in the DOM |
| `slow-failing-api` | Slow & Failing API | Client retries on 429/500/503 from the real server, plus failure sequences scripted with `cy.intercept` |
| `network-console` | Network & Console | Requests via `cy.intercept`, console spies, `uncaught:exception`, and a CSP violation report |
| `cookie-consent` | Cookie Consent | Accept, reject and custom choices saved in a cookie; `cy.setCookie` to skip the banner |
| `native-dialog` | Native Dialog | `<dialog>` focus, `:modal` state, an inert page, return values; Escape via `cypress-real-events` (Chromium) |
| `toasts` | Toasts | Auto-hiding messages timed exactly with `cy.clock`/`cy.tick` |
| `responsive-layout` | Responsive Layout | `cy.viewport` at desktop and mobile sizes: hamburger menu and stacked cards |
| `form-validation` | Form Validation | Browser `validity` state that blocks the request, and 422 errors from the server |
| `custom-dropdown` | Custom Dropdown | A `<div>` listbox driven by mouse and keyboard, skipping a disabled option, with ARIA state |
| `accessibility-issues` | Accessibility Issues | Every issue the page declares is found by axe on the right element; the fixed page is clean |
| `two-factor-login` | Two-Factor Login | Password then one-time code, a wrong code, and the secure area blocked after only a password |
| `live-updates` | Live Updates | Server-Sent Events from the real server, and a stream stubbed with `cy.intercept` |
| `websocket` | WebSocket | Echoes, a clean close (1000) and the server closing an oversized message (1009) |
| `chat` | Chat | Two users in one room: the page and a Node WebSocket client driven through `cy.task`; text stays text |
| `browser-permissions` | Browser Permissions | Stubbing the permissions, notification, clipboard and camera APIs (Cypress can't grant permissions) |
| `locale-time-zone` | Locale & Time Zone | `Accept-Language` via `cy.visit` headers, a stubbed `navigator.language`, a CDP time-zone override (Chromium) |
| `modern-file-download` | Modern File Download | Blob, fetch-then-save and data URL downloads; `Content-Disposition` edge cases via `cy.request` |
| `date-time-pickers` | Date & Time Pickers | ISO values into native inputs; a JS calendar opened on a fixed "today" with `cy.clock` |
| `pointer-events` | Pointer Events | Sort, swipe and long press with synthetic pointer events, plus a real pointer via `cypress-real-events` |
| `svg` | SVG | Reading chart data from SVG elements and clicking bars and shapes |
| `advanced-iframes` | Advanced Iframes | A sandboxed frame the page can't read (testing its `postMessage` side), `srcdoc`, an iframe in a shadow root |
| `advanced-shadow-dom` | Advanced Shadow DOM | Nested roots, slots, a form-associated element, and reaching a closed root by wrapping `attachShadow` |

## Running it

Requires Node 24, pnpm and Docker.

```bash
pnpm install
pnpm test          # builds and starts the-internet in Docker, then runs Cypress headless
```

Or step by step:

```bash
pnpm app:up        # docker compose up: http://localhost:5050
pnpm cy:open       # Cypress app, pick specs interactively
pnpm cy:run --browser firefox
pnpm app:down
```

To run against the hosted site instead:

```bash
CYPRESS_BASE_URL=https://the-internet.herokuapp.com pnpm cy:run
```

## How it's set up

- **App under test:** `docker-compose.yml` builds the-internet from a pinned commit of
  [saucelabs/the-internet](https://github.com/saucelabs/the-internet) and waits for a health
  check before tests start. Change `THE_INTERNET_REF` to test a newer build.
- **CI (GitHub Actions):** lint and type-check, then the suite in Chrome and Firefox (Cypress has deprecated Electron as a test browser).
  The-internet image build is cached between runs. Screenshots and app logs are kept when a test
  fails.
- **Lint and format with ESLint only:** [`@antfu/eslint-config`](https://github.com/antfu/eslint-config)
  formats code with ESLint Stylistic rules, so there's no Prettier and no conflicting rules
  between the two. `eslint-plugin-cypress` adds Cypress rules, including a ban on fixed waits.
  `pnpm lint:fix` formats.
- **Commits:** conventional commits checked by commitlint; staged files are fixed by ESLint on
  commit (husky + lint-staged), and commits straight to `main` are blocked.
- **Maintenance:** Dependabot opens weekly dependency and GitHub Actions updates. If one fails
  CI, a Claude Code agent ([`deps-agent.yml`](.github/workflows/deps-agent.yml)) tries a fix on
  that branch, running the full suite against the-internet first, and can't edit CI workflows.
  Mentioning `@claude` in an issue or PR (owner only) runs the same setup for other changes.

## License

[MIT](./LICENSE) © Jonathan Gartland
