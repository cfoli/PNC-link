import {
  newData,
  defaultScenario,
  readiness,
  proceeds,
  suggestedPaths,
  paths,
  teams,
  metrics,
} from "./domain.mjs";
const $ = (s) => document.querySelector(s),
  app = $("#app");
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (v) =>
  v === null || v === undefined
    ? "Not recorded"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(v);
const date = (v) =>
  v
    ? new Date(v).toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Not yet";
const state = {
  user: null,
  cases: [],
  selected: null,
  demo: false,
  demoRole: "owner",
  metrics: {},
  history: [],
  chat: [],
  callback: null,
};
let flashTimer,
  renderVersion = 0;
function notice(message) {
  $("#notice").textContent = message;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => ($("#notice").textContent = ""), 6000);
}
async function api(path, body, retry = true) {
  const r = await fetch(path, {
    method: body ? "POST" : "GET",
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try {
    data = await r.json();
  } catch {
    throw Error("The service is unavailable. Please try again.");
  }
  if (path === "/api/auth" && !body && data.refreshed && retry)
    return api(path, undefined, false);
  if (!r.ok) {
    if (r.status === 401 && path.startsWith("/api/nexus/") && retry) {
      const status = await api("/api/auth");
      if (status.user) return api(path, body, false);
    }
    if (r.status === 401) {
      state.user = null;
      state.cases = [];
      state.chat = [];
      state.history = [];
      location.hash = "#/signin";
    }
    throw Error(data.error || "The request could not complete.");
  }
  return data;
}
const route = () => location.hash.replace(/^#\/?/, "") || "home";
const current = () => state.cases.find((c) => c.id === state.selected);
const locked = () => (state.demo ? "disabled" : "");
const badge = (label, cls = "") =>
  `<span class="badge ${cls}">${esc(label)}</span>`;
const button = (label, action, cls = "secondary", extra = "") =>
  `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${label}</button>`;
const intro = (title, description, eyebrow = "Transition workspace") =>
  `<header class="page-intro"><div class="eyebrow">${eyebrow}</div><h1 tabindex="-1">${title}</h1><p>${description}</p></header>`;
const panel = (title, body, sub = "") =>
  `<section class="panel"><div class="panel-head"><div><h2>${title}</h2>${sub ? `<small>${sub}</small>` : ""}</div></div>${body}</section>`;
const stat = (title, value, note = "", accent = false) =>
  `<div class="stat ${accent ? "accent" : ""}"><span>${title}</span><b>${esc(value)}</b><small>${esc(note)}</small></div>`;
const empty = (title, description) =>
  `<div class="empty"><h3>${title}</h3><p>${description}</p></div>`;
const input = (key, label, value = "", type = "text", extra = "", hint = "") =>
  `<div class="field"><label for="field-${key}">${label}</label><input id="field-${key}" name="${key}" type="${type}" value="${esc(value)}" ${extra} ${hint ? `aria-describedby="hint-${key}"` : ""}>${hint ? `<small id="hint-${key}">${hint}</small>` : ""}</div>`;
const textarea = (key, label, value = "", extra = "") =>
  `<div class="field full"><label for="field-${key}">${label}</label><textarea id="field-${key}" name="${key}" ${extra.includes("maxlength") ? "" : 'maxlength="3000"'} ${extra}>${esc(value)}</textarea></div>`;
const select = (key, label, options, value, extra = "") =>
  `<div class="field"><label for="field-${key}">${label}</label><select id="field-${key}" name="${key}" ${extra}>${options.map((o) => `<option ${o === value ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></div>`;
const formEnd = (label) =>
  `<div class="form-footer"><button class="btn" ${locked()}>${label}</button><p class="form-error" role="alert"></p></div>`;
const formData = (f) => Object.fromEntries(new FormData(f));
function sample() {
  const p = {
    name: "James D. Bennett",
    business: "Bennett Precision Manufacturing",
    industry: "Manufacturing",
    trigger: "Family succession",
    timeline: 3,
    futureRole: "Step back gradually",
    revenue: 38400000,
    ebitda: 5625000,
    debt: 4200000,
    ownership: 85,
    liquidity: 12000000,
    retained: 20,
    priorities:
      "Preserve the family legacy and confirm whether the next generation wants ownership.",
    employeePriorities: "Protect the team and retain key managers.",
    confidentiality: "No external disclosure without my approval.",
    notes:
      "Daughter leads operations; ownership interest still needs confirmation.",
    advisorEmail: "advisor@example.test",
    shareWithAdvisor: true,
    outreach: "Meeting only",
  };
  const d = newData(p);
  d.scenario = { ...defaultScenario, family: 1500000 };
  d.evidence = d.evidence.map((e, i) => ({
    ...e,
    reported: i < 4,
    verified: i < 2,
  }));
  d.review = {
    at: "2026-10-27T10:00:00Z",
    by: "advisor@example.test",
    note: "Financials and ownership reviewed for this fictional demonstration. Confirm successor interest, document tax assumptions, and discuss family outcomes before selecting a path.",
  };
  d.qualified = true;
  d.referrals = [
    {
      id: "sample-referral",
      team: "PNC Private Bank",
      recipient: "specialist@example.test",
      purpose:
        "Review liquidity needs, family distributions and estate planning before the owner selects a transaction structure.",
      scope: "Business + personal",
      status: "Draft",
      createdAt: "2026-10-27T10:10:00Z",
    },
  ];
  return {
    id: "sample",
    ownerId: "sample-owner",
    ownerEmail: "owner@example.test",
    advisorEmail: p.advisorEmail,
    revision: 1,
    mode: state.demoRole,
    createdAt: "2026-10-26T09:00:00Z",
    updatedAt: "2026-10-27T10:10:00Z",
    data: d,
  };
}
async function loadCases() {
  if (state.demo) {
    state.cases = [sample()];
    state.selected = "sample";
    state.metrics = metrics(state.cases);
    return;
  }
  const result = await api("/api/nexus/cases");
  state.cases = result.cases;
  state.metrics = result.metrics;
  if (!current()) state.selected = state.cases[0]?.id ?? null;
}
async function loadHistory() {
  const c = current();
  state.chat = [];
  state.history = [];
  if (!c || c.mode === "specialist") return;
  if (state.demo) {
    state.history = [
      {
        label: "Advisor proposed a Private Bank referral for owner approval",
        createdAt: c.updatedAt,
      },
      {
        label: "Advisor reviewed the opportunity",
        createdAt: c.data.review.at,
      },
      { label: "Owner created a discovery profile", createdAt: c.createdAt },
    ];
    return;
  }
  const data = await api(`/api/nexus/history?id=${encodeURIComponent(c.id)}`);
  state.history = data.history;
  state.chat = data.chat;
}
async function update(op, payload) {
  if (state.demo)
    throw Error("This sample is read-only. Sign in to create your own case.");
  const c = current();
  await api(`/api/nexus/update?id=${encodeURIComponent(c.id)}`, {
    revision: c.revision,
    op,
    payload,
  });
  await loadCases();
  await loadHistory();
  render();
  notice("Saved to the shared case record.");
}
function publicHeader() {
  return `<header class="public-head"><a href="#/home"><img class="logo" src="/assets/nexus-logo.png" alt="PNC NEXUS home"></a><div class="row"><a class="btn secondary" href="#/signin">Sign in</a><a class="btn" href="#/signup">Get started</a></div></header>`;
}
function home() {
  return `${publicHeader()}<main id="main"><section class="hero"><div><div class="eyebrow">Your business. Your next chapter.</div><h1>A thoughtful transition starts with a connected plan.</h1><p class="lead">Bring your business goals, family priorities, and advisory team together—from first questions to life beyond a sale.</p><div class="row"><a class="btn" href="#/signup">Start your transition profile <span aria-hidden="true">→</span></a>${button("Explore the sample", "demo")}</div><p class="footer-note">Owner-guided discovery. Advisor-reviewed decisions. AI support along the way.</p></div><div class="hero-visual"><img src="/assets/family.png" alt="Business owners considering their family's next chapter"><div class="hero-caption"><h3>More than a transaction.</h3><p>A common understanding of what matters, who is helping, and what happens next.</p></div></div></section><section class="home-strip"><article><div class="eyebrow">For business owners</div><h2>Know your options. Keep your voice.</h2><p>Clarify your goals, explore transition paths, model proceeds, and approve what specialists can see. Ask the AI assistant for help preparing your next conversation.</p></article><article><div class="eyebrow">For advisors</div><h2>Turn discovery into coordinated action.</h2><p>Review the same case, verify readiness evidence, qualify opportunities, and coordinate acknowledged specialist handoffs and wealth-planning tasks.</p></article></section></main>`;
}
function authPage(kind) {
  const signup = kind === "signup",
    recover = kind === "recover",
    callback = ["reset", "invite"].includes(kind);
  return `${publicHeader()}<main class="auth" id="main">${intro(callback ? "Set your password" : recover ? "Recover your account" : signup ? "Start your next chapter." : "Welcome back.", callback ? "Use at least 12 characters." : recover ? "Request a link to set a new password." : signup ? "Create an owner account. Your advisor and specialists use separately assigned roles." : "Open your owner or advisor workspace.")}<form data-form="auth" data-kind="${kind}">${signup ? input("name", "Your name", "", "text", 'required maxlength="200" autocomplete="name"') : ""}${!callback ? input("email", "Email address", "", "email", 'required autocomplete="email"') : ""}${!recover ? input("password", callback ? "New password" : "Password", "", "password", `required ${signup || callback ? 'minlength="12"' : ""} maxlength="256" autocomplete="${signup || callback ? "new-password" : "current-password"}"`) : ""}<button class="btn">${callback ? "Save password" : recover ? "Send recovery email" : signup ? "Create account" : "Sign in"}</button><p class="form-error" role="alert"></p></form><p class="footer-note">${recover || callback ? '<a href="#/signin">Back to sign in</a>' : signup ? 'Already have an account? <a href="#/signin">Sign in</a>' : '<a href="#/recover">Forgot password?</a> · <a href="#/signup">Create an owner account</a>'}</p>${!signup && !callback && !recover ? `<div class="callout"><p>Advisors and specialists: use your invited account. Access is assigned by a site administrator and by the owner’s case permissions.</p></div>` : ""}</main>`;
}
function navItems(c) {
  if (c?.mode === "specialist")
    return [
      ["overview", "Referral inbox", "01"],
      ["referrals", "My referrals", "02"],
    ];
  return [
    [
      "overview",
      c?.mode === "advisor" ? "Case overview" : "My transition",
      "01",
    ],
    ["discovery", "Discovery profile", "02"],
    ["readiness", "Readiness & review", "03"],
    ["pathways", "Transition options", "04"],
    ["proceeds", "Proceeds & wealth", "05"],
    ["referrals", "Specialist referrals", "06"],
    ["plan", "Shared action plan", "07"],
    ["assistant", "AI assistant", "08"],
    ["history", "Case history", "09"],
    ...((state.user?.roles ?? []).includes("advisor") ||
    (state.demoRole === "advisor" && state.demo)
      ? [["metrics", "Practice insights", "10"]]
      : []),
  ];
}
function shell(body, r) {
  const c = current(),
    mode =
      c?.mode ??
      ((state.user?.roles ?? []).includes("advisor") ? "advisor" : "owner");
  return `<div class="shell"><aside class="sidebar"><a class="brand-box" href="#/overview"><img class="logo" src="/assets/nexus-logo.png" alt="PNC NEXUS home"></a><p class="side-label">${mode === "advisor" ? "Advisor workspace" : mode === "specialist" ? "Specialist workspace" : "Owner workspace"}</p><nav aria-label="Workspace">${navItems(
    c,
  )
    .map(
      ([id, label, n]) =>
        `<a class="nav-link ${r === id ? "active" : ""}" ${r === id ? 'aria-current="page"' : ""} href="#/${id}"><span class="nav-icon" aria-hidden="true">${n}</span>${label}</a>`,
    )
    .join(
      "",
    )}</nav><div class="side-bottom">One case. A connected team.<br>Human judgment at every decision.<br><a href="#/home">About NEXUS</a></div></aside><div class="content"><header class="topbar"><div><strong>${state.demo ? "Illustrative sample" : esc(state.user?.name || state.user?.email)}</strong><small>${mode === "owner" ? "Business owner" : mode === "advisor" ? "Relationship advisor" : "Approved referral recipient"}</small></div><div class="row">${state.cases.length > 1 ? `<label><span class="eyebrow">Case</span><select id="caseSelect" aria-label="Select case">${state.cases.map((x) => `<option value="${esc(x.id)}" ${x.id === state.selected ? "selected" : ""}>${esc(x.data.profile.business)}</option>`).join("")}</select></label>` : ""}${!state.demo ? button("Refresh", "refresh", "secondary small") + button("Sign out", "logout", "quiet small") : ""}</div></header>${state.demo ? `<div class="demo-bar"><span>Read-only sample · fictional business · no requests are sent</span><div class="row">${button(state.demoRole === "owner" ? "View as advisor" : "View as owner", "demoSwitch", "secondary small")}<a class="btn small" href="#/signup">Create your case</a></div></div>` : ""}<main class="main" id="main">${body}<p class="footer-note">Planning support only. Financial ranges use hypothetical assumptions; they are not certified valuations or PNC benchmarks. Qualified professionals review transaction, financing, tax, legal, and investment decisions.</p></main></div></div>`;
}
function noCase() {
  const advisor = (state.user?.roles ?? []).some((r) =>
    ["advisor", "specialist"].includes(r),
  );
  return `${intro(advisor ? "Your workspace is ready." : "Begin with what matters.", "A shared transition profile connects the owner’s priorities with the right people and next steps.")}<div class="two-col">${panel(advisor ? "No shared cases yet" : "Create your transition profile", `<p>${advisor ? "Owners can name your account email as their advisor and explicitly share their case. Specialist cases appear after owner approval of a referral addressed to your email." : "Start with your goals, business facts, family priorities, and preferred advisor. You can update the profile as your thinking develops."}</p><a class="btn" href="#/discovery">${advisor ? "Create my own owner case" : "Start discovery"}</a>`)}${panel("What happens next", '<ol class="info-list"><li>Owner records goals and evidence availability.</li><li>Assigned advisor reviews and verifies the case.</li><li>Owner approves each specialist and scope.</li><li>Named recipient acknowledges the referral.</li></ol>')}</div>`;
}
function stages(c) {
  const d = c.data,
    active = d.outcomes.closed
      ? 4
      : d.referrals.some((r) => r.status === "Completed")
        ? 3
        : d.referrals.some((r) => r.acceptedAt)
          ? 2
          : d.review
            ? 1
            : 0;
  return `<div class="progress" aria-label="Journey progress">${["Discover", "Review", "Coordinate", "Execute", "Beyond closing"].map((x, i) => `<div class="stage ${i <= active ? "active" : ""}"><i>0${i + 1}</i>${x}</div>`).join("")}</div>`;
}
function overview(c) {
  if (!c) return noCase();
  if (c.mode === "specialist")
    return `${intro("Your specialist inbox", "Review the approved purpose and information scope before acknowledging the handoff.")}${referrals(c)}`;
  const d = c.data,
    p = d.profile,
    r = readiness(d),
    s = proceeds(p, d.scenario);
  return `${intro(esc(p.business), "A common record of your goals, evidence, decisions, and the people helping you move forward.", `${c.mode === "advisor" ? "Advisor case" : "Owner journey"} · ${esc(p.industry)}`)}<div class="row">${badge(d.review ? "Advisor reviewed" : "Awaiting advisor review", d.review ? "" : "amber")}${badge(d.qualified ? "Qualified opportunity" : "Discovery in progress", "gray")}${badge(`Revision ${c.revision}`, "gray")}</div>${stages(c)}<div class="stats">${stat("Evidence available", `${r.score}%`, `${r.reported} of ${r.total} categories`, true)}${stat("Advisor verified", `${r.verified}/${r.total}`, "Evidence categories")}${stat("Working enterprise value", money(s.ev), "Hypothetical multiple × EBITDA")}${stat("Estimated cash proceeds", money(s.cash), s.shortfall ? "Distribution exceeds available cash" : "After simplified deductions")}</div><div class="two-col"><div class="stack">${panel("What matters to the owner", `<div class="row">${badge(p.trigger)}${badge(`${p.timeline}-year horizon`, "gray")}${badge(p.futureRole, "gray")}</div><p class="review-note">${esc(p.priorities || "Family and legacy priorities have not been recorded.")}</p><p><strong>Employee priorities</strong><br>${esc(p.employeePriorities || "Not yet recorded")}</p><p><strong>Liquidity goal</strong> ${money(p.liquidity)} · <strong>Desired retained ownership</strong> ${p.retained}%</p><a class="btn secondary small" href="#/discovery">${c.mode === "owner" ? "Update discovery" : "View discovery"}</a>`)}${panel("Advisor review", d.review ? `<p class="review-note">${esc(d.review.note)}</p><small>Recorded ${date(d.review.at)} · ${esc(d.review.by)}</small>` : `<p>${p.advisorEmail ? "Your named advisor can review this profile and record next steps." : "Add your advisor’s email and sharing permission in Discovery to start the handoff."}</p><a class="btn secondary small" href="#/readiness">Open review</a>`)}</div><div class="stack">${panel("Your next conversation", `${d.meeting ? `<p><strong>${esc(d.meeting.topic)}</strong><br>${badge(d.meeting.status)}</p><small>Requested ${date(d.meeting.requestedAt)}</small>` : empty("Align on the next step", "Discuss the transition trigger, missing evidence, and owner outcomes before selecting a path.")}${c.mode === "owner" && !d.meeting ? `<form data-form="meeting" class="inline-form">${input("topic", "Meeting topic", "Discuss my transition priorities", "text", 'required maxlength="500"')}${formEnd("Request advisor meeting")}</form>` : c.mode === "advisor" && d.meeting && d.meeting.status !== "Completed" ? button(d.meeting.status === "Requested" ? "Acknowledge request" : "Mark meeting completed", "meetingStatus", "", `data-status="${d.meeting.status === "Requested" ? "Acknowledged" : "Completed"}" ${locked()}`) : ""}`)}${panel("Still to verify", r.gaps.length ? `<ul class="info-list">${r.gaps.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><p class="footer-note">This is evidence completeness, not a prediction of transaction success.</p>` : "<p>All checklist categories are verified. Your advisor still reviews the conclusions and transaction suitability.</p>")}</div></div>`;
}
function discovery(c) {
  const p = c?.data.profile ?? {
      name: state.user?.name ?? "",
      business: "",
      industry: "",
      trigger: "Not sure yet",
      timeline: 3,
      futureRole: "Not sure yet",
      revenue: "",
      ebitda: "",
      debt: 0,
      ownership: 100,
      liquidity: 0,
      retained: 0,
      outreach: "On request",
    },
    editable = !c || c.mode === "owner",
    disabled = !editable || state.demo ? "disabled" : "";
  return `${intro("The full picture starts here.", "Capture the business facts and personal priorities that shape a transition. Your answers feed the shared assessment and proceeds model.")}<section class="panel"><form data-form="profile"><fieldset ${disabled} class="profile-fields"><div class="form-grid">${input("name", "Owner name", p.name, "text", 'required maxlength="200"')}${input("business", "Business name", p.business, "text", 'required maxlength="200"')}${input("industry", "Industry", p.industry, "text", 'required maxlength="200"')}${select("trigger", "What brings you here?", ["Not sure yet", "Retirement", "Family succession", "Unsolicited offer", "Liquidity need", "Partner change", "Growth capital"], p.trigger)}${input("timeline", "Years until preferred transition", p.timeline, "number", 'required min="0" max="30" step="0.5"')}${select("futureRole", "Your desired future role", ["Not sure yet", "Exit fully", "Step back gradually", "Continue leading"], p.futureRole)}<div class="section-label">Business and liquidity</div>${input("revenue", "Annual revenue ($)", p.revenue, "number", 'required min="0" max="1000000000000" step="1"')}${input("ebitda", "Annual EBITDA ($)", p.ebitda, "number", 'required min="0" max="1000000000000" step="1"', "Use a consistent annual period. The simple multiple model supports nonnegative EBITDA only.")}${input("debt", "Outstanding business debt ($)", p.debt, "number", 'required min="0" max="1000000000000" step="1"')}${input("ownership", "Your current ownership (%)", p.ownership, "number", 'required min="0.01" max="100" step="0.01"')}${input("liquidity", "Desired personal liquidity ($)", p.liquidity, "number", 'required min="0" max="1000000000000" step="1"')}${input("retained", "Desired retained ownership after transition (%)", p.retained, "number", 'required min="0" max="100" step="1"')}<div class="section-label">People, legacy, and trust</div>${textarea("priorities", "Family and legacy priorities", p.priorities, 'maxlength="1000"')}${textarea("employeePriorities", "Employee and management priorities", p.employeePriorities, 'maxlength="1000"')}${textarea("confidentiality", "Confidentiality requirements", p.confidentiality, 'maxlength="1000"')}${select("outreach", "Preferred engagement", ["On request", "Email with permission", "Meeting only"], p.outreach)}${input("advisorEmail", "Assigned advisor email (optional)", p.advisorEmail, "email", 'maxlength="254"', "Use your advisor’s invited account email. Only that account with the advisor role can open the full case.")}${textarea("notes", "Other context and open questions", p.notes)}<label class="check field full"><input name="shareWithAdvisor" type="checkbox" ${p.shareWithAdvisor ? "checked" : ""}><span>I allow the named advisor to access this full case, including family and personal planning context. Changing or removing the advisor revokes their access. Specialist sharing requires separate approval.</span></label></div></fieldset>${editable ? `<div class="callout amber"><p>Changing discovery, evidence availability, or scenario assumptions clears the review and withdraws existing referrals so updated information receives fresh approval. Completed referral milestones remain in the history.</p></div>${formEnd(c ? "Save discovery profile" : "Create shared case")}` : '<p class="footer-note">The owner maintains discovery answers. Record your findings in Readiness & review.</p>'}</form></section>`;
}
function readinessPage(c) {
  const d = c.data,
    r = readiness(d);
  return `${intro("Evidence before conclusions.", "Track what is available, what the advisor has verified, and what still needs a conversation. No files are uploaded here.")}<div class="stats">${stat("Owner-reported availability", `${r.score}%`, `${r.reported}/${r.total} categories`, true)}${stat("Advisor verification", `${r.verifiedScore}%`, `${r.verified}/${r.total} categories`)}${stat("Review", d.review ? "Recorded" : "Pending", "Human findings and next steps")}${stat("Opportunity", d.qualified ? "Qualified" : "Discovery", "Advisor determination")}</div><div class="two-col">${panel("Readiness evidence", `<div class="checklist">${d.evidence.map((e) => `<div class="check-row"><div><b>${esc(e.label)}</b><small>${e.verified ? "Advisor verified" : e.reported ? "Available; verification pending" : "Not yet confirmed"}</small></div><div class="row"><label class="check"><input type="checkbox" data-evidence="${esc(e.label)}" ${e.reported ? "checked" : ""} ${c.mode !== "owner" || state.demo ? "disabled" : ""}> Available</label><label class="check"><input type="checkbox" data-evidence="${esc(e.label)}" ${e.verified ? "checked" : ""} ${c.mode !== "advisor" || !e.reported || state.demo ? "disabled" : ""}> Verified</label></div></div>`).join("")}</div><p class="footer-note">The checklist measures evidence completeness, not financial health or readiness to sell. Advisor verification is a recorded review, not an automated document check.</p>`)}<div class="stack">${panel("Advisor review", c.mode === "advisor" ? `<form data-form="review" class="inline-form">${textarea("note", "Findings and recommended next steps", d.review?.note ?? "", "required")}<label class="check"><input type="checkbox" name="qualified" ${d.qualified ? "checked" : ""}><span>Qualify this opportunity for specialist discovery. I have reviewed the goals and verified at least two evidence categories.</span></label>${formEnd("Record advisor review")}</form>` : d.review ? `<p class="review-note">${esc(d.review.note)}</p><small>${date(d.review.at)} · ${esc(d.review.by)}</small>` : empty("Review pending", "Your assigned advisor records findings and qualification here."))}${panel("Keep professional judgment central", "<p>Formal valuations, buyer selection, financing, tax, legal matters, and final recommendations remain with qualified professionals. AI can help identify questions; it cannot approve this case.</p>")}</div></div>`;
}
function pathways(c) {
  const suggested = suggestedPaths(c.data.profile);
  return `${intro("Choose the outcome before the structure.", "Explore seven transition paths against liquidity, control, people, timing, and your future role. These are discussion prompts, not suitability recommendations.")}<div class="callout"><p>Highlighted paths follow simple rules based on your stated trigger, role, people priorities, and timeline. Every path remains available for advisor discussion; no fit score or buyer interest is inferred.</p></div><div class="path-grid">${paths.map((p) => `<article class="path-card ${suggested.includes(p.name) ? "suggested" : ""}">${badge(suggested.includes(p.name) ? "Discuss based on your goals" : "Alternative to explore", suggested.includes(p.name) ? "" : "gray")}<h2>${p.name}</h2><p>${p.people}</p><dl class="definition"><dt>Liquidity</dt><dd>${p.liquidity}</dd><dt>Control</dt><dd>${p.control}</dd><dt>Future role</dt><dd>${p.role}</dd><dt>Timing</dt><dd>${p.timing}</dd><dt>Certainty</dt><dd>${p.certainty}</dd><dt>Potential team</dt><dd>${p.team}</dd></dl></article>`).join("")}</div><p class="footer-note">Confidentiality and disclosure requirements apply to every path. Buyer selection and outreach require professional review and owner permission. ESOP feasibility requires specialist and fiduciary advice.</p>`;
}
function proceedsPage(c) {
  const d = c.data,
    p = d.profile,
    s = d.scenario,
    r = proceeds(p, s),
    readOnly = c.mode !== "owner" || state.demo;
  return `${intro("From business value to personal choices.", "Explore how debt, fees, ownership, rollover, taxes, and family distributions affect available cash. Bring the assumptions to your tax and wealth advisors.")}<div class="two-col"><section class="panel"><h2>Working proceeds scenario</h2><p>Illustrative enterprise value: EBITDA × your hypothetical multiple. This model does not use comparable transactions or private-market data.</p><form data-form="scenario"><fieldset ${readOnly ? "disabled" : ""}><div class="form-grid">${input("multiple", "Hypothetical EBITDA multiple", s.multiple, "number", 'required min="1" max="15" step="0.1"')}${input("fees", "Transaction fees (% of enterprise value)", s.fees, "number", 'required min="0" max="20" step="0.1"')}${input("tax", "Illustrative tax rate (%)", s.tax, "number", 'required min="0" max="60" step="0.1"')}${input("rollover", "Owner equity rolled over (%)", s.rollover, "number", 'required min="0" max="100" step="1"')}${input("family", "Family cash distribution ($)", s.family, "number", 'required min="0" max="1000000000000" step="1"')}</div></fieldset>${c.mode === "owner" ? formEnd("Save & recalculate") : ""}</form><p class="footer-note">Fees and debt reduce enterprise value before applying your ownership share. Tax applies to the cash portion of positive owner equity as if it were fully taxable gain; rollover is assumed tax-deferred. Actual tax basis, structure, preferences, and timing can materially change results. A family transfer or ESOP requires its own financing and tax analysis.</p></section><div class="stack">${panel(
    "Where the value goes",
    `<div class="money-rows">${[
      ["Enterprise value", r.ev],
      ["Less debt", -p.debt],
      ["Less fees", -r.fees],
      ["Owner equity share", r.share],
      ["Less retained / rollover equity", -r.rollover],
      ["Less illustrative tax", -r.tax],
      ["Less family distribution", -s.family],
    ]
      .map(
        ([l, v]) =>
          `<div class="money-row"><span>${l}</span><strong>${money(v)}</strong></div>`,
      )
      .join(
        "",
      )}<div class="money-row total ${r.cash < 0 ? "negative" : ""}"><span>${r.cash < 0 ? "Cash shortfall" : "Available cash"}</span><strong>${money(r.cash)}</strong></div></div>${r.shortfall || r.debtShortfall ? `<div class="callout amber"><p>${r.debtShortfall ? `Enterprise value does not cover debt and fees: ${money(r.debtShortfall)} shortfall. ` : ""}${r.shortfall ? `Family distributions exceed modeled cash by ${money(r.shortfall)}. Revisit assumptions before planning distributions.` : ""}</p></div>` : ""}<p class="footer-note">Your stated liquidity goal: ${money(p.liquidity)}. ${r.cash >= p.liquidity ? "The hypothetical cash meets this goal." : "The hypothetical cash falls below this goal."} Rollover equity is not available cash; its future value is uncertain.</p>`,
  )}${panel("Connect proceeds to life after closing", '<p>Record spending needs, estate reviews, family distributions, and investment-policy conversations as named actions. A Private Bank referral requires separate approval of personal information sharing.</p><a class="btn secondary small" href="#/plan">Open wealth-planning actions</a>')}</div></div><section class="panel compare-panel"><h2>Compare your own assumptions</h2><p>These are sensitivity cases, not estimates for different buyer types. Ownership, fees, tax, distributions, and debt stay constant.</p><div class="table-wrap"><table><thead><tr><th>Hypothetical multiple</th><th>Enterprise value</th><th>Available cash / shortfall</th></tr></thead><tbody>${[
    -1, 0, 1,
  ]
    .map((delta) => {
      const multiple = Math.max(1, Math.min(15, s.multiple + delta)),
        v = proceeds(p, { ...s, multiple });
      return `<tr><td>${multiple.toFixed(1)}×${delta === 0 ? " · working" : ""}</td><td>${money(v.ev)}</td><td>${money(v.cash)}</td></tr>`;
    })
    .join("")}</tbody></table></div></section>`;
}
function referrals(c) {
  const d = c.data;
  return `${c.mode !== "specialist" ? intro("The right team, with your permission.", "An advisor proposes the purpose and recipient. The owner approves the scope. The named specialist acknowledges the handoff.") : ""}<div class="two-col">${panel(c.mode === "specialist" ? "Referrals addressed to you" : "Specialist handoffs", d.referrals.length ? d.referrals.map((r) => `<article class="referral"><div class="row between"><h3>${esc(r.team)}</h3>${badge(r.status, ["Draft", "Queued"].includes(r.status) ? "amber" : "")}</div><small>Recipient: ${esc(r.recipient)}<br>Information scope: ${esc(r.scope)}</small><p>${esc(r.purpose)}</p><small>Proposed ${date(r.createdAt)}${r.queuedAt ? `<br>Owner approved ${date(r.approvedAt)}` : ""}${r.acceptedAt ? `<br>Recipient accepted ${date(r.acceptedAt)}` : ""}${r.completedAt ? `<br>Completed ${date(r.completedAt)}` : ""}</small><div class="row">${c.mode === "owner" && r.status === "Draft" ? button("Approve & queue referral", "referralStatus", "", `data-id="${r.id}" data-status="Queued" ${locked()}`) : ""}${c.mode === "owner" && ["Draft", "Queued", "Accepted", "Completed"].includes(r.status) ? button("Withdraw access", "referralStatus", "danger small", `data-id="${r.id}" data-status="Withdrawn" ${locked()}`) : ""}${c.mode === "specialist" && r.status === "Queued" ? button("Accept handoff", "referralStatus", "", `data-id="${r.id}" data-status="Accepted" ${locked()}`) + button("Decline", "referralStatus", "secondary", `data-id="${r.id}" data-status="Declined" ${locked()}`) : ""}${c.mode === "specialist" && r.status === "Accepted" ? button("Mark completed", "referralStatus", "", `data-id="${r.id}" data-status="Completed" ${locked()}`) : ""}</div></article>`).join("") : empty("No specialist referrals yet", "A reviewed case can be routed to the appropriate team. Approval creates an in-app handoff; no email is sent."))}<div class="stack">${
    c.mode === "advisor"
      ? panel(
          "Propose a referral",
          `<form data-form="referral" class="inline-form">${select("team", "Specialist team", teams, teams[0])}${input("recipient", "Recipient account email", "", "email", 'required maxlength="254"', "Use the invited specialist’s account email. They must have the specialist or advisor role.")}${select("scope", "Requested information scope", ["Business only", "Business + personal"], "Business only")}${textarea("purpose", "Purpose and engagement rationale", "", 'required maxlength="1500"')}${formEnd("Send for owner approval")}</form>`,
        )
      : c.mode === "specialist"
        ? panel(
            "Approved case context",
            `<dl class="definition">${Object.entries(d.profile)
              .filter(
                ([k]) => !["advisorEmail", "shareWithAdvisor"].includes(k),
              )
              .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`)
              .join("")}</dl>`,
          )
        : panel(
            "What you approve",
            "<p><strong>Business only</strong> shares business name, industry, transition trigger, timeline, revenue, EBITDA, debt, current ownership, desired role, and confidentiality requirements.</p><p><strong>Business + personal</strong> also shares the discovery profile’s owner identity, family and employee priorities, liquidity goals, desired retained ownership, notes, engagement preference, and assigned advisor email.</p><p>Specialists see the purpose and scope of their own approved referrals. They do not see your scenario editor, shared plan, case history, or AI conversation.</p>",
          )
  }${panel("Permission stays with the owner", "<p>Withdraw a referral to stop further access, including after completion. Updating discovery or scenario assumptions withdraws existing referrals automatically. Information previously viewed cannot be recalled. Recipients see a snapshot of the profile approved at handoff; they do not receive later profile edits.</p><p>Handoffs are tracked in the application. They do not guarantee engagement, financing, buyer interest, or a professional recommendation.</p>")}</div></div>`;
}
function plan(c) {
  const d = c.data;
  return `${intro("Every next step has an owner.", "Keep transition work, family continuity, and post-sale wealth planning in one shared action plan.")}<div class="two-col">${panel("Shared action plan", d.actions.map((a) => `<article class="action"><div><div class="eyebrow">${esc(a.kind)}</div><h3>${esc(a.title)}</h3><small>${esc(a.assignee)}${a.due ? ` · Due ${esc(a.due)}` : ""}</small></div><label class="field"><span class="muted">Status</span><select data-task="${a.id}" ${state.demo || (c.mode !== "advisor" && a.assignee !== "Owner") ? "disabled" : ""}>${["Open", "In progress", "Completed"].map((x) => `<option ${x === a.status ? "selected" : ""}>${x}</option>`).join("")}</select></label></article>`).join(""))}<div class="stack">${c.mode === "advisor" ? panel("Assign a next step", `<form data-form="addAction" class="inline-form">${input("title", "Action", "", "text", 'required maxlength="500"')}${input("assignee", "Responsible person / team", "", "text", 'required maxlength="200"')}${input("due", "Due date (optional)", "", "date")}${formEnd("Add shared action")}</form>`) : panel("Life beyond the transaction", "<p>Ask your advisor to assign specific actions for income needs, investment policy, estate documents, taxes, and family distributions. Mark your own family-continuity action as work progresses.</p>")}${c.mode === "advisor" ? panel("Observed outcomes", `<p>Record actual results only. Blank values remain unknown. These records support measurement; they do not establish that NEXUS caused the outcome.</p><form data-form="outcomes" class="inline-form">${input("workMinutes", "Advisor minutes recorded (cumulative)", d.workMinutes, "number", 'required min="0" max="100000" step="1"')}<label class="check"><input type="checkbox" name="closed" ${d.outcomes.closed ? "checked" : ""}><span>Transaction has closed</span></label>${input("assetsCaptured", "Post-sale assets captured ($; optional)", d.outcomes.assetsCaptured ?? "", "number", 'min="0" max="1000000000000" step="1"')}${select("retained", "Client relationship retained?", ["Not recorded", "Yes", "No"], d.outcomes.retained === null ? "Not recorded" : d.outcomes.retained ? "Yes" : "No")}${formEnd("Save observed outcomes")}</form>`) : ""}</div></div>`;
}
function assistant(c) {
  return `${intro(c.mode === "advisor" ? "A second set of eyes for your case." : "Support for your next conversation.", "Ask for explanations, missing-information checks, transition comparisons, or help preparing an agenda. AI suggestions stay separate from the shared plan until a person records an action.")}<div class="chat-layout"><section class="panel"><div class="chat-thread" id="thread">${state.chat.length ? state.chat.map((m) => `<div class="chat-message question"><b>You</b>${esc(m.question)}</div><div class="chat-message"><b>NEXUS AI · suggestion</b>${esc(m.answer)}</div>`).join("") : empty("Start with your most important question.", "For example: What information should I gather before discussing a family transfer?")}</div>${state.demo ? '<div class="callout amber"><p>The sample does not run AI or save conversations. Sign in and create a case to use assistance grounded in your own profile.</p></div>' : `<form data-form="assist" class="inline-form"><label class="field"><span>Your question</span><textarea name="question" id="question" required maxlength="2000" placeholder="Help me prepare for my next advisor meeting…"></textarea></label><label class="check"><input type="checkbox" name="consent" required><span>I agree to share this case’s discovery answers, readiness summary, scenario, advisor findings, actions, and referral purposes with the AI service for this request. Direct name and email fields are omitted; free-text notes may still identify me. My questions and answers are saved privately to my account.</span></label>${formEnd("Ask NEXUS AI")}</form>`}</section><aside class="chat-aside"><div class="eyebrow">Conversation starters</div>${["Summarize the missing information and my next three questions.", "Compare family transfer, ESOP, and management transfer against my priorities.", "Explain my proceeds assumptions and what a tax advisor should review.", "Draft an agenda for a wealth-planning conversation."].map((x) => `<button class="prompt-button" data-prompt="${esc(x)}">${esc(x)} <span aria-hidden="true">↗</span></button>`).join("")}<p class="footer-note">AI can be wrong. It has no live market research or document access and cannot send referrals, approve financing, certify value, or provide tax, legal, or investment advice. Review suggestions with your advisor. Limit: 20 requests per account per hour.</p></aside></div>`;
}
function historyPage() {
  return `${intro("A visible record of progress.", "Case changes and handoff milestones are recorded automatically. AI conversations remain private to the person who asked.")}<section class="panel"><ul class="timeline">${state.history.map((e) => `<li>${esc(e.label)}<small>${date(e.createdAt)}</small></li>`).join("") || "<li>No changes recorded yet.</li>"}</ul></section>`;
}
function metricsPage() {
  const m = state.metrics;
  return `${intro("Measure the journey, then test the impact.", "These observations cover cases assigned to you. Faster engagement, higher capacity, asset capture, and retention remain hypotheses until validated against a baseline.")}<div class="stats">${stat("Shared cases", m.cases ?? 0, "Assigned to your account", true)}${stat("Qualified opportunities", m.qualified ?? 0, "Reviewed + ≥2 categories verified")}${stat("Referral acceptance", m.acceptance === null ? "Not yet" : `${m.acceptance}%`, `${m.accepted ?? 0} accepted / ${m.sent ?? 0} ever queued`)}${stat("Time to acceptance", m.hours === null ? "Not yet" : `${m.hours} hrs`, "Mean: owner approval → acceptance")}${stat("Recorded advisor effort", `${m.workMinutes ?? 0} min`, "Cumulative observed time; not savings")}${stat("Post-sale assets captured", money(m.assets), `${m.outcomeCount ?? 0} recorded outcomes`)}${stat("Client retention", m.retention === null ? "Not recorded" : `${m.retention}%`, "Among closed cases with known status")}${stat("Closed transactions", m.closed ?? 0, "Advisor-reported outcomes")}</div><div class="callout"><p>Unknown outcomes are excluded from assets and retention calculations. Queued referrals later withdrawn remain in the referral denominator. These are workflow observations, not audited PNC performance or evidence of causal uplift.</p></div>${panel("Validation conversations", '<ul class="info-list"><li>What uncertainty has delayed the owner’s next decision?</li><li>Whom do they trust first, and where does coordination break down?</li><li>Which outcomes matter beyond price?</li><li>What would they share with AI, and when would outreach feel intrusive?</li><li>When do they choose who manages post-sale proceeds?</li></ul><p class="footer-note">Capture interview findings as advisor review notes and distinguish direct experience from stated preference and inference.</p>')}`;
}
function render() {
  renderVersion++;
  const r = route(),
    c = current();
  let html;
  if (r === "home") html = home();
  else if (["signin", "signup", "recover", "reset", "invite"].includes(r))
    html = authPage(r);
  else if (!state.user && !state.demo) {
    location.hash = "#/signin";
    return;
  } else {
    let body;
    if (!c && r !== "discovery" && r !== "metrics") body = noCase();
    else if (c?.mode === "specialist" && !["overview", "referrals"].includes(r))
      body = overview(c);
    else {
      const pages = {
        overview: () => overview(c),
        discovery: () => discovery(c),
        readiness: () => readinessPage(c),
        pathways: () => pathways(c),
        proceeds: () => proceedsPage(c),
        referrals: () => referrals(c),
        plan: () => plan(c),
        assistant: () => assistant(c),
        history: historyPage,
        metrics: () => metricsPage(),
      };
      body = pages[r]
        ? pages[r]()
        : `${intro("This page is unavailable.", "Return to your workspace to continue.")}<a class="btn" href="#/overview">Open workspace</a>`;
    }
    html = shell(body, r);
  }
  app.innerHTML = html;
  document.title = `${r === "home" ? "Business transitions" : r.charAt(0).toUpperCase() + r.slice(1)} · PNC NEXUS`;
  document.querySelector("h1")?.focus({ preventScroll: true });
  if (r === "assistant") $("#thread")?.scrollTo(0, $("#thread").scrollHeight);
}
app.addEventListener("submit", async (e) => {
  const f = e.target.closest("form[data-form]");
  if (!f) return;
  e.preventDefault();
  const data = formData(f),
    kind = f.dataset.form,
    btn = f.querySelector('button[type="submit"],button:not([type])'),
    err = f.querySelector(".form-error"),
    original = btn?.textContent;
  if (err) err.textContent = "";
  if (btn) {
    btn.disabled = true;
    btn.textContent = kind === "assist" ? "Thinking…" : "Saving…";
  }
  try {
    if (kind === "auth") {
      const authKind = f.dataset.kind;
      const result = await api("/api/auth", {
        ...data,
        action: {
          signin: "login",
          signup: "signup",
          recover: "recover",
          reset: "reset",
          invite: "invite",
        }[authKind],
        token: state.callback?.token,
      });
      if (result.user) {
        state.user = result.user;
        state.demo = false;
        state.cases = [];
        state.selected = null;
        state.callback = null;
        await loadCases();
        await loadHistory();
        location.hash = "#/overview";
      } else if (result.message) {
        notice(result.message);
        if (err) err.textContent = result.message;
      }
    } else if (kind === "profile") {
      data.shareWithAdvisor = f.elements.shareWithAdvisor.checked;
      if (current()) await update("profile", data);
      else {
        if (state.demo) throw Error("The sample is read-only.");
        const result = await api("/api/nexus/cases", data);
        state.selected = result.case.id;
        await loadCases();
        await loadHistory();
        location.hash = "#/overview";
        notice("Your shared transition case is ready.");
      }
    } else if (kind === "review")
      await update("review", {
        ...data,
        qualified: f.elements.qualified.checked,
      });
    else if (kind === "outcomes")
      await update("outcomes", {
        ...data,
        closed: f.elements.closed.checked,
        retained:
          data.retained === "Not recorded" ? null : data.retained === "Yes",
      });
    else if (kind === "assist") {
      const c = current(),
        id = c.id,
        result = await api(`/api/nexus/assist?id=${encodeURIComponent(id)}`, {
          question: data.question,
          consent: f.elements.consent.checked,
        });
      if (current()?.id === id && route() === "assistant") {
        state.chat.push({ question: data.question, answer: result.answer });
        render();
      }
    } else await update(kind, data);
  } catch (error) {
    if (err && err.isConnected) err.textContent = error.message;
    else notice(error.message);
  } finally {
    if (btn?.isConnected) {
      btn.disabled = state.demo;
      btn.textContent = original;
    }
  }
});
app.addEventListener("click", async (e) => {
  const prompt = e.target.closest("[data-prompt]");
  if (prompt) {
    if ($("#question")) {
      $("#question").value = prompt.dataset.prompt;
      $("#question").focus();
    } else notice("Sign in and create a case to use AI assistance.");
    return;
  }
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const action = b.dataset.action;
  try {
    if (action === "demo") {
      state.demo = true;
      state.demoRole = "owner";
      state.selected = "sample";
      await loadCases();
      await loadHistory();
      location.hash = "#/overview";
      render();
    } else if (action === "demoSwitch") {
      state.demoRole = state.demoRole === "owner" ? "advisor" : "owner";
      await loadCases();
      await loadHistory();
      render();
    } else if (action === "logout") {
      await api("/api/auth", { action: "logout" });
      state.user = null;
      state.demo = false;
      state.cases = [];
      state.chat = [];
      state.history = [];
      state.selected = null;
      location.hash = "#/home";
    } else if (action === "refresh") {
      b.disabled = true;
      await loadCases();
      await loadHistory();
      render();
      notice("Workspace refreshed.");
    } else if (action === "referralStatus") {
      b.disabled = true;
      await update("referralStatus", {
        id: b.dataset.id,
        status: b.dataset.status,
      });
    } else if (action === "meetingStatus") {
      b.disabled = true;
      await update("meetingStatus", { status: b.dataset.status });
    }
  } catch (error) {
    notice(error.message);
    b.disabled = false;
  }
});
app.addEventListener("change", async (e) => {
  const el = e.target;
  try {
    if (el.id === "caseSelect") {
      state.selected = el.value;
      await loadHistory();
      render();
    } else if (el.dataset.evidence) {
      el.disabled = true;
      await update("evidence", {
        label: el.dataset.evidence,
        checked: el.checked,
      });
    } else if (el.dataset.task) {
      el.disabled = true;
      await update("action", { id: el.dataset.task, status: el.value });
    }
  } catch (error) {
    notice(error.message);
    if (el.type === "checkbox") el.checked = !el.checked;
    el.disabled = false;
  }
});
window.addEventListener("hashchange", () => {
  if (["signin", "signup"].includes(route()) && state.demo) {
    state.demo = false;
    state.cases = [];
    state.selected = null;
    state.chat = [];
    state.history = [];
  }
  render();
});
async function init() {
  try {
    const params = new URLSearchParams(location.hash.slice(1));
    if (params.has("confirmation_token")) {
      const token = params.get("confirmation_token");
      history.replaceState(null, "", location.pathname + "#/signin");
      const result = await api("/api/auth", { action: "confirm", token });
      state.user = result.user;
    } else if (params.has("recovery_token") || params.has("invite_token")) {
      const invite = params.has("invite_token");
      state.callback = {
        token: params.get(invite ? "invite_token" : "recovery_token"),
      };
      history.replaceState(
        null,
        "",
        location.pathname + (invite ? "#/invite" : "#/reset"),
      );
      render();
      return;
    } else state.user = (await api("/api/auth")).user;
    if (state.user) {
      await loadCases();
      await loadHistory();
      if (["home", "signin"].includes(route()))
        history.replaceState(null, "", location.pathname + "#/overview");
    }
    render();
  } catch (error) {
    app.innerHTML = `${publicHeader()}<main class="error-page" id="main">${intro("Your workspace could not open.", "Please retry. Your case is saved on the server; this screen does not imply a lost record.")}<p class="form-error">${esc(error.message)}</p><a class="btn" href="/">Try again</a> ${button("View read-only sample", "demo", "secondary")}</main>`;
  }
}
setInterval(async () => {
  if (state.user && !state.demo) {
    try {
      const result = await api("/api/auth");
      if (!result.user) {
        state.user = null;
        state.cases = [];
        state.chat = [];
        state.history = [];
        location.hash = "#/signin";
      }
    } catch {
      /* Show service failures on the next explicit request. */
    }
  }
}, 600000);
init();
