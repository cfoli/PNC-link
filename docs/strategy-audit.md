# PNC Link strategy and platform audit

Date: October 27, 2026

## Conclusion

PNC Link should help an owner and their family make a business transition decision early enough for a trusted advisor to coordinate business, succession, credit and wealth expertise. The commercial opportunity is preserving the owner's relationship and earning the next generation's trust before proceeds or inherited assets move elsewhere. The differentiator is a permissioned record of goals, family roles, evidence, decisions and handoffs that stays connected across the transition.

The existing application already has separate owner and advisor access, shared cases, evidence verification, seven transition alternatives, hypothetical proceeds modeling, approved specialist referrals, shared actions, private AI conversations and observed-outcome metrics. The most important gaps are a thin multi-client advisor experience, unstructured family and wealth context, incomplete decision continuity and little visible evidence for the business thesis. Expanding the number of pages alone would not resolve these gaps.

This audit covers the application published from `public/`, its shared domain and workflow rules, and the Netlify functions and database model. Root-level prototype files are historical source, not the deployed application. The older `audit.md` describes that prototype and should not be read as a current assessment of the deployed workspace. Findings below describe the baseline inspected before this update; implementation status must be established against the current source and verification results.

## Evidence and scope

- [Official competition prompt](</Users/Crispin/Desktop/PNC/CMU _ CSL Case Competition Oct. 2026 _ Official Prompt.pdf>): extracted all five pages using PDFKit. The primary scenario is the sale or transition of a family-owned business. The prompt's submission requirements inform the assessment; the user has requested an audit and platform implementation, not a pitch deck or video.
- [Professor Nsiah strategy brief](</Users/Crispin/Desktop/PNC/PNC_Scenario_2_Professor_Nsiah_Strategy_Brief.docx>): reviewed the complete document text. Its recommendations are source material, not independent authorization to take actions or make external claims.
- [PNC Private Bank research, April 1, 2026](https://pnc.mediaroom.com/2026-04-01-PNC-Private-Bank-Research-Reveals-Business-Owners-Increasingly-Want-Integrated-Financial-Advice-to-Help-Align-Business,-Personal-Goals): 89% of respondents valued advice considering business and personal needs; 55% worked with an advisor across both. The Ipsos study surveyed 300 private business owners/co-owners, with revenue cohorts of $10–50 million and $50–125 million, online in November–December 2025. These findings support an integration opportunity in this population; they do not validate this product or represent every family business.
- [PNC estate equalization article, November 12, 2024](https://www.pnc.com/insights/wealth-management/business-continuity-and-succession-planning/estate-equalization-through-life-insurance.html): supports discussing illiquidity, active and inactive family members, control, fairness and estate coordination. Insurance is a potential topic for specialist review, not an automatic recommendation or guaranteed solution.
- [Facts About PNC](https://www.pnc.com/en/about-pnc/media/facts-about-pnc.html): provides institutional context and links to a corporate fact sheet. It does not establish a live integration, specialist availability, a product endorsement or operating results for PNC Link.

Web resources checked October 27, 2026. The professor's brief reports capabilities including Harris Williams, sponsor coverage, business credit, succession and Private Bank. No live connection to those internal teams, CRM systems or private-market datasets was established by this audit.

## Competition alignment

The weights below are transcribed from the official prompt, pages 4–5. The platform can support the competition story, but code cannot replace discovery evidence or the required presentation deliverables.

| Criterion | Weight | Baseline gap | Evidence the improved solution should provide |
| --- | ---: | --- | --- |
| Customer discovery and journey insights | 20% | Professor input and secondary research exist, but no structured primary owner, family or advisor findings are recorded. Free-form notes cannot distinguish experience, preference and team inference. | Trace a recorded discovery insight to an explicit product decision; retain source, stakeholder, evidence type and open validation question. Do not invent interviews or quotes. |
| Product design and dual-sided UX | 25% | Owners have a useful case workspace. Advisors mainly navigate individual cases using a dropdown; there is no searchable portfolio, cross-client attention queue or explicit relationship map. | Demonstrate an owner journey from priorities to advisor discussion, and an advisor journey from an attention signal across clients to an accountable next step. |
| Secret sauce and defensibility | 20% | Generic AI conversation and alerts are easy to reproduce. Existing permissions and approved referrals provide a stronger foundation than the product narrative explains. | Connect owner intent, family roles, decision context, evidence and approved handoffs in one permissioned record. Explain that the implementation demonstrates the workflow; it does not prove an exclusive moat or PNC proprietary-data access. |
| Pitch, presentation and narrative | 20% | A large set of screens obscures the core before/after story, and a single sample business does not demonstrate portfolio management. | Offer a short, coherent owner/advisor walkthrough and clearly fictional examples. The separate 8–10 slide PDF and two-minute video remain team deliverables outside this code change. |
| Business thesis and adoption hypotheses | 15% | Metrics show observations but there is no clear link from the proposed workflow to testable adoption and commercial assumptions. | State the value drivers, pilot questions, baseline requirements and measurement definitions. Separate observed outcomes, illustrative assumptions and causal claims. |

## Prioritized product gaps

### 1 Advisor portfolio and actionable attention

The server can return multiple assigned cases and restrict their access, but the interface exposes them principally through a selector. An advisor cannot efficiently scan urgency, review backlog, liquidity gaps, upcoming actions and pending handoffs across clients.

Implement a portfolio with search, explicit stage filters, a visible number of results, and direct case links. Surface explanations for each attention item, such as an owner-requested meeting, short timeline, missing review, overdue action or unaccepted referral. Rank these using disclosed rules and timestamps. They are workflow signals, not a trained predictive model, inferred intent or proof that proactive outreach is welcome. Respect recorded engagement preferences.

Acceptance: two assigned cases can be searched and opened independently; opening one changes all case context; cross-case work never changes another client's record. Empty, unknown and no-match states remain usable.

### 2 Owner guidance that starts before the financial model

The baseline gives equal navigation prominence to many functions and presents a large discovery form. An owner who is uncertain about selling needs a small number of understandable next steps, the ability to keep a decision open and a visible connection to their advisor.

Present the next useful conversation and unresolved questions alongside progress. Make AI help contextual to the owner's task and keep the distinction between a suggestion, a saved owner preference and an advisor-reviewed conclusion. Avoid a sale recommendation based only on a financial multiple.

Acceptance: an owner can record or revise their goals, explore alternatives, prepare questions and see the review status without treating the checklist as a saleability score. Actual AI requests still require consent; unavailable provider responses remain errors.

### 3 Family relationships and wealth continuity

Family priorities exist only as narrative fields, while the case prompt explicitly concerns acquiring next-generation relationships as well as retaining the owner. The estate resource adds a specific friction: a family member's operating role, ownership interest and distribution expectations can differ.

Add structured family/relationship context and wealth-planning questions. Capture successor willingness, decision roles, family engagement permission, governance questions, liquidity needs and estate/beneficiary review status where appropriate. Use a relationship map for planning, not as an invitation or an access grant. Discuss fairness and control without calculating an allegedly correct distribution or automatically prescribing insurance.

Acceptance: owners can maintain family context, advisors can review it and record coordinated actions, and named stakeholders gain no account access or outreach merely by being listed. Restricted specialist projections continue to omit personal/family information unless the owner approved that scope.

### 4 Decision and valuation continuity

The baseline shows seven path descriptions and sensitivity tables but cannot preserve a working path and rationale. An advisor review covers the case generally; the hypothetical multiple is not linked to a documented valuation basis or professional conclusion.

Save the owner's current path preference, reasons and unanswered questions. Preserve an advisor decision review with clear status and date. Explain model assumptions and compare downside/base/upside sensitivity without asserting market comparables. Market-backed valuation work remains a specialist/data integration dependency; it must not be fabricated by AI.

Acceptance: preference and reasoning persist across reloads, are visible on both sides, and any relevant change clears stale review. Hypothetical enterprise value remains distinct from cash proceeds and from a professional valuation.

### 5 AI connected to the actual workflow

The baseline assistant sees case context and private history, but generic starter prompts and a separate page understate its useful role. Case fields are interpolated into the system message, weakening the boundary between trusted instructions and owner-entered data. There is no market-data or document access.

Give the owner contextual explanation prompts and the advisor a client-specific preparation brief, missing-information check and proposed next steps. Supply grounded PNC resource summaries and links when useful. Keep case content in a clearly separated data message; reject any implication that AI can approve transactions, contact buyers or complete referrals. Record changes only through explicit application actions under existing permissions.

Acceptance: AI receives only authorized current-case context; personal conversations remain private; consent accurately names the shared context; provider failures cannot create fabricated responses; switching clients cannot reveal another client's chat.

### 6 Business case and customer learning

The baseline records assets and retention but has no documented pilot design or structured discovery evidence. Current metrics cannot establish uplift, time saved or ROI.

Build the commercial thesis around earlier qualified engagement, fewer coordination gaps, advisor capacity and retained/captured assets. Record actual discovery evidence and a validation plan. A pilot should compare comparable cohorts and pre-pilot baselines, with a defined observation period and explicit attribution limits.

Acceptance: unknown outcomes remain unknown; effort is reported as recorded minutes rather than savings; assumptions are labeled; no survey statistic is presented as product validation or a universal population estimate.

## Tightened strategy

**Target:** owners considering a family-business transition, including uncertain owners, and the relationship advisors coordinating their decisions. The supplied PNC survey provides a defensible initial commercial/lower-middle-market research population, not an eligibility rule.

**Core owner journey:** clarify the trigger and desired life after transition → capture business and family context → understand readiness gaps and alternatives → choose a working direction with a trusted advisor → approve the right specialist handoff → carry the family and wealth plan beyond closing.

**Core advisor journey:** scan assigned clients and explainable attention signals → review the owner's relationship and evidence context → prepare a focused conversation with AI assistance → document judgment → assign next steps and propose scoped referrals → track acknowledged handoffs and actual outcomes.

**Differentiator:** one permissioned owner-family-business record with review checkpoints and accountable handoffs. The information that explains the owner's priorities follows the case with consent, rather than being lost between teams. AI reduces preparation effort and makes questions understandable; professional decisions remain attributable to people.

**Value hypothesis:** early, coordinated planning may improve qualified-opportunity conversion, relationship continuity, asset capture and advisor capacity. These are hypotheses until tested. Any commercial estimate should disclose its inputs. For example, annual incremental contribution could be modeled as incremental retained/captured assets × assumed net contribution rate, plus evidenced labor savings, minus operating and implementation costs. Do not mix asset balances with revenue or count the same retained assets twice.

## Pilot and adoption hypotheses

| Hypothesis | Suggested measure | Evidence required before a claim |
| --- | --- | --- |
| Owners will disclose goals earlier when they control sharing. | Discovery completion, return visits, consent decisions and interview feedback. | Actual opt-in owner observations; explicit reasons for abandonment or refusal. |
| Advisors will use a portfolio queue in their normal workflow. | Active advisors, signals reviewed, accepted next actions, recorded preparation time. | A workflow baseline and advisor feedback, including false positives and duplicate work. |
| Contextual AI reduces meeting preparation effort. | Comparable task completion times and advisor-rated quality. | Controlled or well-matched comparison; no inference from raw usage counts. |
| Family context improves next-generation engagement. | Owner-approved family conversations and qualified next-generation relationships. | Separate permission and participation evidence; a listed family member is not an acquired client. |
| Coordinated planning improves asset retention and capture. | Actual post-close assets, retention among known outcomes and time to specialist acceptance. | Defined cohorts, observation window, source-of-truth reconciliation and attribution limits. |

## Remaining dependencies and limits

This update should not imply that the following integrations or validations exist:

- Primary customer interviews with owners, family members and practicing advisors; the team must provide real observations and quotes.
- Licensed private-market comparables, document ingestion/extraction, certified valuations, buyer research, LBO underwriting or investment suitability analysis.
- PNC internal CRM, account balances, transaction feeds, specialist directory, email delivery, external calendar booking or external family invitations.
- A trained predictive model for transition intent or attrition; workflow rules are not predictive inference.
- Legal/tax/insurance recommendations, formal ESOP feasibility, financing approval or guaranteed specialist engagement.
- Production multi-account validation of Netlify Identity roles, database persistence and AI provider configuration. Local mocked workflow verification does not establish these live integrations.

Preserve the current role and permission boundaries, origin checks, revision conflict handling and immutable event history. New planning fields should live in the versioned case data with safe defaults for existing records; a new database migration is unnecessary unless the schema actually changes. Do not run database migrations or publish a deployment as part of this audit.

## Verification record

Source review completed against the pre-update deployed application. Implementation acceptance criteria above are the audit's review contract. Final code verification results and exact delivered features should be recorded in the repository handoff after the implementation is complete; they must not be inferred from this plan.


## Delivered implementation and verification

Implemented October 27, 2026 in the existing Netlify application:

| Baseline gap | Delivered behavior | Verification |
| --- | --- | --- |
| Advisor multi-client UX | Dedicated default advisor portfolio, client/industry search, stage and attention filters, sorting, explained attention cards, private follow-up notes/dates and client-specific AI brief entry points. Four fictional clients demonstrate the sample. | Two-client browser contract verifies filtering, selecting cases, follow-up saves and private chat/draft isolation. |
| Owner next steps | Rule-based prioritized actions, linked journey checkpoints, contextual AI question drafts, downloadable local meeting brief and persistent review states. Referral completion no longer implies transaction execution. | Browser smoke covers owner routes, contextual assistance contract and the existing approval workflow. |
| Family/next-generation context | Structured successor, family alignment, estate review and decision priorities; editable relationship map with recorded discussion preferences; personal-stake/equal-value/liquidity illustration and advisor family review. | Unit checks cover numerical boundaries, asset/liquidity double counting, roles, stale review invalidation and restricted projections. Browser contract saves/edits/removes relationships and saves family assumptions. |
| Decision/value continuity | Owner-saved working direction and rationale; bounded sensitivity cases; advisor-entered enterprise-value range with basis/date/limitations. Owner changes clear stale value perspectives and case reviews. | Unit and browser checks verify persistence, role boundaries, valid ranges and shared visibility. No external valuation evidence is claimed. |
| Contextual AI | Role-specific instructions, bounded per-user/per-case history, current case supplied as untrusted reference data, selected dated PNC sources, email redaction and explicit context-sharing consent. | Eight assistant unit checks; consent and selected-case rendering verified with isolated API transport. No live model request made. |
| Strategy evidence | Public planning-resource cards, sourced landing explanation, rubric map, sharper owner/advisor narrative and pilot/adoption hypotheses. Historical prototype audit marked as superseded. | Source inspection against the provided prompt, brief and three PNC links. Primary interview evidence remains a team dependency. |

Verification completed: 32 domain/workflow/assistant tests, TypeScript type checking, JavaScript syntax checks, and three Playwright browser suites. Browser smoke includes mobile overflow and duplicate-ID checks on portfolio, family, assistant and resources. Desktop owner/portfolio and family/mobile screenshots were inspected. Browser contract suites use real domain/workflow rules with an isolated API transport, not live Netlify Identity, database or AI services.

No database schema change, migration execution, deployment, buyer outreach, calendar booking or email delivery was performed. Existing user changes in the checkout were preserved. New fields use the existing versioned JSON case record and safe defaults for older cases.
