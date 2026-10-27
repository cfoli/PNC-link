# PNC NEXUS platform audit

Date: October 27, 2026

## Scope and conclusion

Reviewed all four JavaScript files, the HTML entry point, stylesheets, repository structure, and README. This is a static prototype with browser-local accounts and illustrative data, as the README explicitly states. It is suitable for demonstrating a concept; it does not yet provide the identity, persistence, or operational workflows needed for real client use. The findings below distinguish current prototype defects from production prerequisites.

Validation consisted of source inspection, literal asset-reference checks, and an independent arithmetic check of a scenario boundary. No browser interaction, accessibility tooling, deployed infrastructure review, or penetration test was performed. No application code was changed.

## Prioritized findings

### 1. High — Stored HTML injection through account information

Evidence: `owner.js:77–84` returns stored business/name values; the `pages.owner` header interpolates them into page HTML without escaping. `onboarding.js:88` similarly interpolates `resumeName`. Both pages are inserted using `innerHTML` (`app.js:622`, `onboarding.js:175`). Signup accepts arbitrary nonempty business/name strings (`landing.js:247–259`).

A business name containing an HTML element with an event handler can become executable markup when the dashboard or returning-user welcome screen renders. This is a stored, same-browser injection path in the current local prototype; it is not evidence of a remote cross-user exploit. Its impact would expand if these fields were later shared through a backend.

Improvement: Render user values with `textContent`, or consistently escape values at every HTML interpolation boundary. Add regression checks for names/businesses containing markup, quotes, and ampersands. Consider a restrictive Content Security Policy as additional protection after removing inline event handlers.

### 2. High — Scenario and meeting state leaks across accounts

Evidence: `owner.js:57–58` defines global `pnc-nexus.scenario` and `pnc-nexus.meeting-request` keys. They are read by every account and persist after logout; `landing.js:23` only removes session and role.

Reproduction: Account A changes a scenario or requests a meeting, signs out, then account B signs in in the same browser. B inherits A's assumptions and sees the meeting button already disabled. Onboarding is account-scoped, but these dashboard records are not.

Improvement: Scope both keys by account and business identifier, define migration/reset behavior for existing global records, and test switching accounts in one browser. For a deployed platform, enforce record ownership on the server.

### 3. High before real client use — Authentication and authorization are simulations

Evidence: `landing.js:16–27` treats a stored email and caller-selected role as session identity; `landing.js:41–43` hashes passwords with plain SHA-256 in the browser. Sign-in permits selecting Advisor (`landing.js:147–149`, `landing.js:266`), and the dashboard switch directly writes the role (`app.js:648–653`). The route gate checks session/onboarding, without an advisor permission check (`landing.js:172–186`).

Anyone using the browser can alter session state, select an advisor role, or edit account records. Password hashes and business answers are stored locally without a server security boundary. Currently the advisor data is static demo content, so this finding does not establish exposure of real server records.

Improvement: Keep demo access explicitly labeled. Before handling real accounts, introduce managed identity, server-validated sessions, assigned roles, and server-side resource authorization. Remove seeded/demo authentication from that environment. Do not carry the local password-hashing design into production.

### 4. High — Onboarding presents results that are unrelated to answers

Evidence: `onboarding.js:127–150` claims to estimate valuation, score readiness, and match specialists, but `runBuilding()` only schedules visual changes and navigation (`onboarding.js:183–186`). Completion always reports 67% readiness and three advisors. The dashboard uses a fixed readiness of 54 and four teams (`owner.js:9`, `owner.js:44–48`). `ownerProfile()` changes only the displayed business and owner identity.

A newly registered business receives Bennett's financial figures and recommendations beneath its own name. Demo labels exist, but the apparent personalization and inconsistent scores undermine the product story.

Improvement: Use one explicit demo fixture throughout, label it persistently, and avoid implying that answers drive calculations until they do. For actual assessments, collect the required financial/readiness inputs and derive completion results and dashboard values from one versioned assessment record.

### 5. Medium — Actions imply successful work without completing it

Evidence: The meeting button saves only a local flag and reports “Meeting requested” (`owner.js:469–474`). Referral submission is disabled with `onsubmit="return false"` (`app.js:477–485`). Profile Save and security controls have no persistence handlers (`app.js:555–599`), while the two-factor switch initially appears enabled. Newsletter submission reports “You are on the list” without a request (`landing.js:229–234`). Documents is a placeholder (`app.js:549–552`). Search, pagination, and several case/detail buttons also have no implementation.

Improvement: For the prototype, clearly mark unavailable actions and replace false success messages with accurate demo feedback. Then implement an end-to-end vertical slice: assessment → advisor review → acknowledged meeting request → visible status. Show success only after the responsible service confirms it. Prioritize removing the misleading two-factor state.

### 6. Medium — Financial edge cases produce misleading charts

Evidence: `owner.js:67–74` permits a negative investable balance. Family payout input has no upper bound (`owner.js:449–452`). Waterfall bars impose a positive minimum height (`owner.js:202`), and comparison segments omit nonpositive values (`owner.js:219`). Persisted scenario values are merged without schema/range validation (`owner.js:240`).

Independent check: With default assumptions and a $30M family payout, investable proceeds are −$15.465M. The waterfall's final bar becomes a 1.5px positive-height mark; the comparison chart omits the negative investable segment. The displayed number can therefore disagree with the visual message.

Improvement: Validate finite values and supported ranges when loading and editing state. Represent insufficient proceeds explicitly with a shortfall amount and charts supporting a negative axis, or reject infeasible payouts with an explanation. Derive static comparison scenarios from the same calculation model and document their assumptions. Use boundary checks for zero cash, excessive payouts, malformed saved state, and rollover/tax limits.

### 7. Medium — Silent storage failures can look like saved work

Evidence: Storage writers catch and discard every error (`landing.js:14`, `onboarding.js:13`, `owner.js:62`), while callers continue navigation or show success. Reads recover from JSON syntax errors but do not validate object shape or field types.

If browser storage is unavailable or full, signup, onboarding, and meeting actions can appear to succeed without retaining changes. Valid JSON containing unexpected types can still break rendering or calculations.

Improvement: Centralize storage access, validate a versioned schema, return explicit write results, and display an actionable persistence error. Preserve entered values on failure. Add a clear demo-data reset option and explain browser-only retention in the account experience.

### 8. Medium — Important content and forms lack accessible interaction

Evidence: Signup and profile labels lack matching `for`/`id` associations (`landing.js:137–153`, `app.js:561–562`). Auth errors have no live announcement (`landing.js:154`). Explanations and chart details rely on a `mousemove` handler (`owner.js:408–422`); information icons are nonfocusable spans (`owner.js:93`). Only the scenario comparison offers a table alternative. Overlay navigation does not explicitly move focus into the newly displayed screen.

Improvement: Associate labels, announce validation errors, move focus to the route heading, and provide keyboard/touch access to explanatory text. Add textual or tabular equivalents for valuation, readiness, and proceeds charts. Verify keyboard navigation, screen-reader behavior, zoom, mobile layouts, contrast, and reduced-motion behavior in a browser.

### 9. Medium — Independent routers make route behavior fragile

Evidence: `app.js:615–625` renders any unknown route as the owner dashboard. Landing and onboarding register separate hash-change renderers (`landing.js:270`, `onboarding.js:251`). The base dashboard renders before the authentication gate is loaded (`index.html:60–63`), and public/onboarding screens are separate overlays.

Improvement: Use a single route table that resolves public, onboarding, and dashboard screens after initialization and the relevant access check. Add an explicit not-found route and common focus/title handling. Verify direct links, refresh, back/forward, logout, unfinished onboarding, and role transitions. The current source architecture is not a reliable authorization boundary.

### 10. Medium — Verification and handoff are underdeveloped

Evidence: No package manifest, test suite, or CI configuration is present in the reviewed repository. README documents only static serving and local storage. `landing.js:31` references a `TEST_ACCOUNTS.md` file that is absent.

Improvement: Preserve the simple static runtime if useful, but add a lightweight JavaScript verification workflow, scenario calculation checks, and browser smoke tests covering signup → onboarding → dashboard → logout and account isolation. Document supported browsers, demo limitations, reset steps, deployment configuration, and the status of each workflow. Validate deployed transport/security headers separately; they cannot be assessed from this repository.

## Suggested delivery order

1. **Prototype correctness:** Fix HTML injection and account scoping; make all simulated outcomes explicit; reconcile onboarding/dashboard data; handle financial shortfalls and storage errors.
2. **Complete one user journey:** Implement assessment persistence, advisor review, and meeting-request acknowledgment with visible status; make profile and documents behavior coherent.
3. **Prepare for real client use:** Add identity, server-side authorization and persistence, secure document handling, audit events, recovery/monitoring, and deployment checks appropriate to the intended environment.
4. **Verify usability and maintenance:** Unify routing/state, address accessibility, and establish automated regression coverage for the completed workflows.

The highest-value next step is correcting prototype trust and data consistency before expanding the number of screens.
