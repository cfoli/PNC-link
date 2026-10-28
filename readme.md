# PNC-link

A connected business-transition workspace for owners, relationship advisors, and named specialist recipients. The deployed application is in `public/`. Root `index.html` forwards repository-root previews to that same app. The original page is preserved as `legacy-prototype.html`; the older root-level scripts remain historical source and are not published.

## Strategy and product audit

[Strategy audit](docs/strategy-audit.md) maps the official competition rubric and supplied PNC research to baseline gaps, implementation acceptance criteria, the owner/advisor journeys, and a testable business thesis. The product focuses on coordinated early transition planning and family/wealth continuity across existing specialist capabilities.

Owners receive prioritized next steps, contextual AI question preparation, structured successor/family/estate discovery, an editable relationship map, a saved transition direction, and a separate family liquidity illustration. Listed relationships receive no invitations or access. Equal-value shares are an optional illustration rather than a fairness recommendation; liquid assets are a subset of other assets, and hypothetical death benefits are separated from current cash.

Advisors open a multi-client portfolio with search, stage/attention filters, sorting and explainable workflow signals. They can record private follow-up dates and relationship notes, review family assumptions, record a preliminary enterprise-value perspective with its basis, and prepare case-specific AI briefs. Portfolio signals use recorded requests and dates, not predictive inference. Private advisor management is omitted from owner and specialist API responses.

The sample now demonstrates four fictional client relationships in the advisor view and one consistent owner journey. The role switch only operates within this read-only sample. Live roles remain assigned by administrators.

## Connected workflows

Owners create one transition case with business facts, transition timing and trigger, desired future role, liquidity and retained-ownership goals, family and employee priorities, confidentiality requirements, and engagement preferences. They can name an advisor and explicitly share the full case. The named account must have the server-assigned `advisor` role.

Owners report evidence availability. Advisors record verification, findings, qualification, and next steps. Qualification requires an advisor review and at least two verified evidence categories. The readiness percentage measures checklist completeness only; it does not rate business saleability. No document-upload or automatic evidence-verification service is implied.

Advisors propose specialist referrals with a named account, purpose, and scope. Owners approve each handoff. Only the named recipient with an `advisor` or `specialist` role can accept, decline, or complete it. Business-only sharing omits personal discovery fields. Specialist access uses a snapshot approved by the owner. Withdrawal ends access even after completion; historical milestones remain. Changes to discovery, owner evidence availability, or proceeds assumptions clear review and withdraw existing referrals for renewed approval. Referral notifications and meeting requests appear in the application; no email or external calendar integration is implemented.

Both primary workspaces show the same case, meeting status, shared actions, and referral milestones. Owners update their own actions; advisors coordinate team actions and record observed effort and closing outcomes. Seven transition alternatives cover strategic sale, PE with rollover, family transfer, management transfer, ESOP, recapitalization, and preparation/delayed exit. Discussion prompts follow transparent rules, not inferred suitability scores.

The proceeds model uses entered financials and hypothetical assumptions. It applies debt and fees before owner share, rollover, simplified tax, and family distributions. It explicitly reports negative proceeds and debt shortfalls. It is not a certified valuation, market-data product, or tax model. Wealth, estate, investment-policy and distribution conversations are connected through shared actions and approved Private Bank referrals.

## Guest portal

Choose **Get started** or **Skip signup — enter portal** to open an editable owner portal without an account or connected services. Guest discovery, planning, evidence and relationship changes are saved in this browser’s localStorage and resume after refresh. Clearing browser data removes the guest case. Guest data is not uploaded or automatically imported into an account. Advisor sharing, meeting requests and live AI require a connected account. The logo assets are unchanged.

## Identity and access

Netlify Identity handles signup, confirmation, login, recovery, invitations, and server-managed sessions. New signups are owners; clients cannot assign themselves advisor or specialist roles. A site administrator must invite staff and assign `advisor` or `specialist` in the Netlify project's Identity user settings. Then owners use the advisor's exact account email, and advisors use the specialist's exact account email for referrals. Role assignment alone does not provide access to every case.

Previously simulated browser accounts and localStorage data are not imported. New live cases start empty and are saved in Netlify Database. The read-only owner sample uses the fictional Bennett business; the advisor sample adds three fictional clients to demonstrate portfolio management. Samples never write records or run AI.

## AI support

Owners and assigned advisors can ask questions with explicit consent to send case context through Netlify AI Gateway using `gpt-5.4-mini`. The assistant supports explanations, intake summaries, missing-information checks, option comparisons, meeting agendas, and suggested specialist conversations. It cannot mutate records, approve financing, contact buyers, send referrals, or replace professional advice. It does not have live market data or document access. Owner guidance and advisor preparation use different instructions and curated, dated PNC background. Case fields are separate untrusted reference data. Up to four prior private turns are supplied for continuity. Consent covers family assumptions, stakeholder roles/notes, preferred paths and value perspectives; advisor AI also receives that advisor’s internal relationship notes. Explicit identity fields are omitted and emails are redacted, but free text can still identify people.

Direct owner name and advisor email fields are omitted from the prompt, but free text may contain identifying information; the consent text explains this. Each user's transcript is private to that user, including when others can view the case. Requests are limited to 20 per account per hour and bounded in length and output. Provider failures surface as errors rather than fabricated answers.

## Data and deployment

Structured records, immutable audit events, and private AI transcripts use `@netlify/database` and Drizzle. `db/schema.ts` is the schema source; generated migrations are in `netlify/database/migrations/` and are applied by the platform during deployment. Never run schema push or migrations manually. Case mutations use transactions, row locks, and revision checks to reject stale writes. API writes require a matching origin and all record permissions are checked on the server.

Netlify publishes `public/` and deploys the TypeScript functions from `netlify/functions/`. No frontend build command is required. The database provisions on connection; Identity has been enabled. AI Gateway credentials are supplied by the platform at runtime.

For local development:

```sh
npm install
netlify dev --port 8889
```

## Verification

```sh
npm test
npm run typecheck
node --check public/workspace.js
```

For signed-out visual previews and browser tests without connected services:

```sh
npm run preview:ui
```

This serves `public/` at port 8889. It returns signed-out auth and rejects other API operations. It does not simulate a connected database or AI. Use Netlify dev for connected local development.

With either local server running and the matching Playwright Chromium installed:

```sh
node tests/browser-smoke.mjs
node tests/browser-workflow.mjs
node tests/browser-planning.mjs
```

The domain/workflow/assistant tests cover structured discovery, family arithmetic, relationship access, private advisor notes, saved decisions, transparent portfolio signals, AI context boundaries, and access checks, consented scope projection, referral transitions and revocation, evidence qualification, financial shortfalls, role restrictions, and metrics with unknown outcomes. Browser smoke checks cover the real local server's public/sample screens and mobile overflow. The workflow and planning browser tests use an isolated API transport and real workflow rules to verify frontend submission, multi-client isolation and rendering contracts; they do not exercise database persistence or provider inference. Live multi-account database and AI checks require a deployed migration and appropriately invited accounts.

Practice insights distinguish observed counts, acceptance time, advisor minutes, assets captured, and retention from unvalidated improvement hypotheses. Missing outcomes stay unknown, and recorded effort is not presented as time saved.

New planning fields are stored in the existing versioned JSON case data. Old cases render with safe defaults; there is no schema change or new migration in this update. Updating owner discovery, scenario, family or relationship context invalidates stale reviews and active referrals; unchanged path/family saves preserve review. Advisor internal follow-up changes do not revoke owner consent.

## Opening the updated app

A server started from the repository root now forwards `/` to `/public/`, so the old prototype cannot silently appear as the current app. Public assets use relative paths for either publishing root. On an ordinary static server, unavailable APIs leave the public landing page and read-only samples accessible with an explicit preview notice. Saving records and live AI still require the connected Netlify services.

Direct read-only walkthroughs: `/public/#/sample-owner` and `/public/#/sample-advisor` on a repository-root server, or `/#/sample-owner` and `/#/sample-advisor` when serving `public/` directly. Retired prototype routes open the current landing page.
