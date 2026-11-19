# Coverage of the-internet

A review of all 76 example pages in [the-internet](https://github.com/saucelabs/the-internet) at
the pinned commit (`dd692f4`): what each one makes hard to automate, how much that matters in a
modern web app, and whether this suite covers it.

**Status:** ✅ covered · 🟡 accessibility scan only · 🔜 planned · ➖ covered by another spec

**Modern?** How often the problem shows up in a current app (React/Next.js/Vue, component
libraries, APIs). ●●● common · ●● sometimes · ● mostly a legacy or contrived case

| Status | Count |
| --- | --- |
| ✅ Covered | 14 |
| ➖ Covered by another spec | 2 |
| 🟡 Accessibility scan only | 5 |
| 🔜 Planned | 55 |

## Covered

| Page | Spec | What's hard | Modern? |
| --- | --- | --- | --- |
| Form Authentication `/login` | `authentication` | Session state, flash messages, protected routes | ●●● |
| Dynamic Loading `/dynamic_loading` | `dynamic-loading` | Content that appears after 5s, longer than default waits | ●●● |
| JavaScript Alerts `/javascript_alerts` | `javascript-alerts` | Native `alert`/`confirm`/`prompt` block the page | ● |
| Sortable Data Tables `/tables` | `sortable-tables` | Reading tabular data and checking order, not just presence | ●●● |
| Nested Frames `/nested_frames` | `iframes` | Frames inside frames; no frame switching in Cypress | ● |
| Shadow DOM `/shadowdom` | `shadow-dom` | Open shadow roots, slots, styles only inside the root | ●● |
| Multiple Windows `/windows` | `multiple-windows` | `target="_blank"`; Cypress drives one tab | ●● |
| File Upload `/upload` | `file-upload` | File inputs and drag-and-drop drop zones | ●●● |
| File Download `/download` | `file-download` | Verifying the saved file, not just the click | ●● |
| Drag and Drop `/drag_and_drop` | `drag-and-drop` | HTML5 DnD needs a `DataTransfer` the runner doesn't create | ●● |
| Hovers `/hovers` | `hovers` | CSS `:hover` ignores synthetic mouse events | ●● |
| Status Codes `/status_codes` | `status-codes` | Non-2xx responses fail `cy.visit` by default | ●● |
| Autocomplete `/autocomplete` | `autocomplete` | Debounced requests, keyboard + ARIA state, slow/empty responses | ●●● |
| Geolocation `/geolocation` | `geolocation` | Browser permission prompt outside the page | ●● |
| Frames `/frames` | ➖ `iframes` | Index page for Nested Frames and the iFrame editor | ● |
| WYSIWYG Editor `/tinymce` | ➖ `iframes` | Same TinyMCE editor as `/iframe` | ●● |

## Planned: modern-app concerns (batch 3)

The pages Sauce Labs added for current web apps. Most of these problems are common in apps built
today, and several show where Cypress's design (automatic retries, re-querying, network control)
removes a problem that Selenium-style tools have.

| Page | What's hard | Modern? | Approach |
| --- | --- | --- | --- |
| SPA Routing `/spa` | URL changes with `pushState`, no page load; Back/Forward; deep links | ●●● | `cy.location`, `cy.go('back')`, visit each route directly |
| Stale Element `/stale_element` | List re-rendered on a timer; held references go stale | ●●● | Show Cypress re-queries on retry; contrast with an aliased element |
| Virtualized List `/virtual_list` | 10,000 rows, only visible rows in the DOM | ●●● | Scroll the container until the row exists, then assert |
| Slow & Failing API `/slow_api` | Delays, 429/500/503 and client retries | ●●● | `cy.intercept` to force failure sequences; check retry and error UI |
| Network & Console `/network_console` | Requests, console errors, uncaught errors, CSP violations | ●●● | `cy.intercept`, spy on `console`, `uncaught:exception` handler |
| Cookie Consent `/cookie_consent` | Banner covers the page until a choice is saved in a cookie | ●●● | `cy.setCookie` to skip it; test accept/reject paths |
| Native Dialog `/dialog` | `<dialog>` modal focus trap, Escape, non-modal | ●●● | Check `open`, focus and Escape behaviour |
| Toasts `/toasts` | Messages that hide themselves after a set time | ●●● | `cy.clock`/`cy.tick` instead of waiting for the timeout |
| Live Updates `/live_updates` | Server-Sent Events pushed over time | ●● | Short `?interval=`; assert on the stream of updates |
| WebSocket `/websocket` | Bidirectional messages, server-side close rules | ●● | Drive the UI; check echoes and close states |
| Chat `/chat` | Two users in the same room | ●● | Second user as a WebSocket client from Node (`cy.task`) |
| Browser Permissions `/permissions` | Notification, clipboard and camera prompts outside the page | ●● | Stub the permissions API per state |
| Locale & Time Zone `/locale` | `Accept-Language`, browser locale and time zone formatting | ●● | Set the header with `cy.intercept`; `?lang=`; locale/time-zone stubs |
| Responsive Layout `/responsive` | Hamburger menu below 640px | ●●● | `cy.viewport` at desktop and mobile sizes |
| Modern File Download `/download_modern` | Blob and data-URL downloads, `Content-Disposition` quirks | ●● | Read files from the downloads folder; check names and contents |
| Date & Time Pickers `/date_pickers` | Native pickers differ by browser; a JS calendar widget | ●●● | Type ISO values into native inputs; drive the widget |
| Pointer Events `/pointer_events` | Sort, swipe and long-press with pointer events, not HTML5 DnD | ●●● | `trigger('pointerdown'/'pointermove'/'pointerup')` |
| SVG `/svg` | Elements in the SVG namespace; clickable chart parts | ●● | Select by attribute; check selection state and colour |
| Advanced Iframes `/iframes_advanced` | Sandboxed cross-origin frame, `srcdoc`, iframe in shadow DOM | ●● | `postMessage` result for the sandbox; `cy.iframeBody` for the rest |
| Advanced Shadow DOM `/shadowdom_advanced` | Nested and closed shadow roots; form-associated custom element | ●● | Nested `.shadow()`; document what closed roots hide |
| Accessibility Issues `/accessibility_issues` | Deliberate violations and a fixed version | ●●● | Pin the broken page's violations; the fixed page must be clean |
| Two-Factor Login `/two_factor` | Password plus a one-time code | ●●● | Full flow; log in through `POST /api/sessions` for setup |
| Form Validation `/form_validation` 🟡 | Browser validation plus 422 errors from the server | ●●● | `validity` state and server error messages |
| Custom Dropdown `/custom_dropdown` 🟡 | `<div>` listbox with ARIA roles instead of `<select>` | ●●● | Keyboard and ARIA state like Autocomplete |

Also in batch 3: switch `cy.login` to the Users API (`POST /api/users`, `POST /api/sessions`) with a
unique user per test, which is faster and how setup is done in apps with an API.

## Planned: classic patterns (batch 4)

The original pages. Many target problems that modern frameworks, component libraries or Cypress
itself already handle, but they still turn up in older apps and in interviews.

| Page | What's hard | Modern? |
| --- | --- | --- |
| Checkboxes `/checkboxes` 🟡 | Unlabelled inputs, toggling state | ●● |
| Dropdown `/dropdown` 🟡 | Native `<select>` | ●● |
| Inputs `/inputs` 🟡 | Number input, arrow keys | ●● |
| Multiple Select Dropdown `/multiple_dropdown` | `<select multiple>` | ● |
| Radio Buttons `/radio_buttons` | One choice per group | ●● |
| Read-only Inputs `/readonly` | Fields that can't be typed into | ●● |
| Large Form `/large_form` | Many field types on one page | ●● |
| Forgot Password `/forgot_password` | Form that "sends" an email | ●● |
| Basic Auth `/basic_auth` | Browser auth prompt | ● |
| Digest Authentication `/digest_auth` | Digest auth prompt | ● |
| Secure File Download `/download_secure` | Downloads behind basic auth | ● |
| Add/Remove Elements `/add_remove_elements/` | Elements added and removed by clicks | ●● |
| Dynamic Controls `/dynamic_controls` | Elements removed, added, enabled and disabled asynchronously | ●●● |
| Dynamic Content `/dynamic_content` | Text and images that change on reload | ●● |
| Disappearing Elements `/disappearing_elements` | Menu items present only some of the time | ● |
| Shifting Content `/shifting_content` | Elements that move between loads | ● |
| Typos `/typos` | Text that is sometimes wrong | ● |
| A/B Testing `/abtest` | Random variant per visit; opt-out cookie | ●● |
| Notification Messages `/notification_message` | Flash message that changes randomly | ●● |
| Redirect Link `/redirector` | Redirect chain | ●● |
| Entry Ad `/entry_ad` | Modal on first visit only | ●● |
| Exit Intent `/exit_intent` | Modal when the mouse leaves the window | ● |
| Floating Menu `/floating_menu` | Fixed menu while scrolling | ●● |
| Infinite Scroll `/infinite_scroll` | Content appended on scroll | ●●● |
| Context Menu `/context_menu` | Right-click opens an alert | ● |
| Key Presses `/key_presses` | Special keys reported by the page | ●● |
| Horizontal Slider `/horizontal_slider` | Range input by mouse or keys | ●● |
| JQuery UI Menus `/jqueryui/menu` | Nested hover menu, downloads from it | ● |
| Broken Images `/broken_images` | Images that fail to load | ●● |
| JavaScript onload event error `/javascript_error` | Uncaught error on load | ●● |
| Challenging DOM `/challenging_dom` | No useful ids; ids change each load; canvas | ●● |
| Canvas `/canvas` | Clicking and typing into a canvas | ● |
| Large & Deep DOM `/large` | Deep nesting and a big table | ● |
| Slow Resources `/slow` | A third-party request that takes 30 seconds | ●● |
| Subdirectories `/subdirectories` | Pages in nested folders | ● |

## Needs extra tooling

| Page | What's hard | Modern? | Notes |
| --- | --- | --- | --- |
| Visual Differences `/visual_diff` | Small visual changes toggled by URL parameters | ●●● | Needs image comparison (e.g. `pixelmatch` through `cy.task`, or a service like Percy). Planned once batch 3 and 4 are in. |
