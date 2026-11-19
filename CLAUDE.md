# cypress-the-internet

Cypress + TypeScript end-to-end suite for [the-internet](https://github.com/saucelabs/the-internet),
run against a local Docker build pinned to one commit (`THE_INTERNET_REF`).

## Commands

Use pnpm only (pinned in `package.json` `packageManager`). Node 24 (`.nvmrc`). Docker is required.

- `pnpm app:up` / `pnpm app:down` — start/stop the-internet on http://localhost:5050
- `pnpm cy:run` — run all specs headless in Chrome (`--browser firefox`, `--spec <path>` to narrow)
- `pnpm test` — `app:up` then `cy:run`
- `pnpm type-check`, `pnpm lint`, `pnpm lint:fix`

Host port is 5050, not 5000: on macOS, 5000 is often taken (AirPlay Receiver, Datadog agent).

Commits follow conventional commits (`commitlint.config.js`). The pre-commit hook blocks commits
on `main`; work on a branch.

## Lint and format

ESLint does both, through `@antfu/eslint-config` (ESLint Stylistic) plus `eslint-plugin-cypress`.
There is no Prettier; don't add it. Run `pnpm lint:fix` to format.

TypeScript is pinned to 6.x because typescript-eslint doesn't support TypeScript 7 yet. Don't bump
it to 7 until typescript-eslint does.

## Writing specs

- One spec per the-internet page, named after the page (`cypress/e2e/<page>.cy.ts`).
- Wait on the app, never the clock: no `cy.wait(ms)` (lint error). Use assertion retries, with a
  longer `timeout` when the page is slow by design.
- No `{ force: true }` unless the page makes it unavoidable; say why in a comment.
- Assert on data and behaviour, not just that elements exist.
- Prefer `cy.contains`/ids over brittle CSS paths. Shared steps go in `cypress/support/commands.ts`
  as typed custom commands.
- Set up through the API, not the UI: `cy.createUser()` makes a unique user (`POST /api/users`) and
  `cy.login(user)` gets the session from `POST /api/sessions`, cached with `cy.session`. Only
  `authentication.cy.ts` uses the login form.
- Tests that need real input events (CSS `:hover`, Escape on a `<dialog>`) use `cypress-real-events`,
  which is Chromium only: mark them `{ browser: '!firefox' }` and say why in a comment.
- Simulated typing doesn't set the browser's "user edited" flag, so `validity.tooShort`/`tooLong`
  never fire. Check those rules on the server side instead.
- `experimentalCspAllowList: true` keeps the app's CSP headers (minus what Cypress needs), so CSP
  behaviour is real.
- Node-side helpers go in `cypress/tasks/` and are registered in `cypress.config.ts` (for example the
  second chat user, a WebSocket client). `cy.task` doesn't retry, so a task that waits for
  something does the waiting itself.
- Specs must pass in Chrome and Firefox (CI runs both).

## Updating the-internet

`THE_INTERNET_REF` (a saucelabs/the-internet commit) appears in `docker-compose.yml` and in each
workflow under `.github/workflows/`; keep them in sync. Their release tags lag behind `VERSION`,
so pin commits, not tags.

## Agents

- `.github/workflows/claude.yml` — mention `@claude` in an issue or PR (repo owner only).
- `.github/workflows/deps-agent.yml` — fixes failing Dependabot PRs using
  `.claude/agents/dependency-updater.md`.

Agents never edit `.github/`.
