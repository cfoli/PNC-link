export const evidenceLabels = [
  "Financial statements",
  "Ownership and debt schedule",
  "Successor / key-person plan",
  "Family priorities",
  "Tax and estate review",
  "Operating procedures",
  "Transition timeline",
];
export const teams = [
  "Harris Williams",
  "Financial Sponsor Coverage",
  "Business Credit",
  "PNC Private Bank",
  "Succession Planning",
];
export const paths = [
  {
    name: "Strategic sale",
    liquidity: "High",
    control: "Low",
    people: "Buyer integration can change roles and culture.",
    timing: "Market and buyer dependent",
    certainty: "Diligence and financing conditions",
    role: "Short transition or exit",
    team: "Harris Williams",
  },
  {
    name: "PE with rollover",
    liquidity: "Medium–high",
    control: "Shared",
    people: "Growth plans and governance need alignment.",
    timing: "Sponsor process",
    certainty: "Leverage and exit assumptions matter",
    role: "Often continuing leadership",
    team: "Financial Sponsor Coverage",
  },
  {
    name: "Family transfer",
    liquidity: "Often gradual",
    control: "Within family",
    people: "Requires willing successors and family agreement.",
    timing: "Staged over years",
    certainty: "Successor capacity and funding",
    role: "Mentor or phased exit",
    team: "Succession Planning",
  },
  {
    name: "Management transfer",
    liquidity: "Often gradual",
    control: "Transferred",
    people: "Supports leadership continuity; financing is a constraint.",
    timing: "Staged buyout",
    certainty: "Management commitment and funding",
    role: "Negotiated handover",
    team: "Business Credit",
  },
  {
    name: "ESOP",
    liquidity: "Structure dependent",
    control: "Trust governance",
    people: "Employee ownership requires feasibility and fiduciary review.",
    timing: "Specialist feasibility first",
    certainty: "Cash flow and regulatory requirements",
    role: "May remain in management",
    team: "Succession Planning",
  },
  {
    name: "Partial recapitalization",
    liquidity: "Partial",
    control: "Negotiated",
    people: "New partner rights affect future business decisions.",
    timing: "Capital and partner dependent",
    certainty: "Partner terms and future exit",
    role: "Retained ownership / leadership",
    team: "Business Credit",
  },
  {
    name: "Prepare / delayed exit",
    liquidity: "Limited today",
    control: "Retained",
    people: "Time to reduce owner dependence and develop successors.",
    timing: "Owner sets preparation runway",
    certainty: "Future market value is uncertain",
    role: "Continue and prepare",
    team: "Succession Planning",
  },
];
export const successorOptions = [
  "Not discussed",
  "No successor identified",
  "Family successor interested",
  "Management successor interested",
  "External sale preferred",
];
export const familyReadinessOptions = [
  "Not discussed",
  "Aligned",
  "Needs discussion",
  "Conflict identified",
];
export const estateStatusOptions = [
  "Not reviewed",
  "Review in progress",
  "Reviewed with professional",
];
export const decisionPriorityOptions = [
  "Liquidity",
  "Family continuity",
  "Employee continuity",
  "Legacy",
  "Speed",
  "Retained control",
];
export const caseStages = [
  "Discovery",
  "Preparation",
  "Specialist engagement",
  "Transition execution",
  "Post-transition",
];
export const stakeholderRoles = [
  "Active in business",
  "Outside business",
  "Advisor",
  "Undecided",
];
export const stakeholderEngagementOptions = [
  "Not discussed",
  "Owner will introduce",
  "Permission to discuss",
];
export const defaultFamilyPlan = {
  businessValue: 0,
  nonBusinessAssets: 0,
  liabilities: 0,
  beneficiaries: 2,
  businessRecipients: 1,
  availableLiquidity: 0,
  insuranceBenefit: 0,
  notes: "",
};
export const defaultManagement = {
  stage: "Discovery",
  nextContact: "",
  note: "",
};
function choice(value, options, fallback, label) {
  if (value === undefined || value === null || value === "") return fallback;
  if (!options.includes(value)) fail(`Choose a supported ${label}.`);
  return value;
}
export function dateInput(value, label = "date") {
  const v = text(value ?? "", 10);
  if (
    v &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(v) ||
      !Number.isFinite(Date.parse(v + "T00:00:00Z")) ||
      new Date(v + "T00:00:00Z").toISOString().slice(0, 10) !== v)
  )
    fail(`Choose a valid ${label}.`);
  return v;
}
export const defaultScenario = {
  multiple: 5,
  fees: 4,
  tax: 25,
  rollover: 0,
  family: 0,
};
export function fail(message, status = 400) {
  const e = new Error(message);
  e.name = "WorkflowError";
  e.status = status;
  throw e;
}
export function text(value, max = 2000) {
  if (typeof value !== "string" || value.length > max)
    fail("Check the text fields and their length.");
  return value.trim();
}
export function number(value, min, max, label) {
  if (value === "" || value === null || typeof value === "boolean")
    fail(`${label} is required.`);
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max)
    fail(`${label} must be between ${min} and ${max}.`);
  return n;
}
export function email(value, optional = false) {
  const e = text(value, 254).toLowerCase();
  if (optional && !e) return "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
    fail("Enter a valid email address.");
  return e;
}
export function profileInput(p) {
  const out = {};
  for (const k of [
    "name",
    "business",
    "industry",
    "trigger",
    "futureRole",
    "priorities",
    "employeePriorities",
    "confidentiality",
    "notes",
  ])
    out[k] = text(p[k] ?? "", k === "notes" ? 3000 : 1000);
  for (const k of ["name", "business", "industry", "trigger", "futureRole"])
    if (!out[k])
      fail(
        "Complete the owner, business, industry, transition trigger, and future role fields.",
      );
  out.timeline = number(p.timeline, 0, 30, "Timeline");
  out.revenue = number(p.revenue, 0, 1e12, "Revenue");
  out.ebitda = number(p.ebitda, 0, 1e12, "EBITDA");
  out.debt = number(p.debt, 0, 1e12, "Debt");
  out.ownership = number(p.ownership, 0.01, 100, "Ownership");
  out.liquidity = number(p.liquidity, 0, 1e12, "Liquidity goal");
  out.retained = number(p.retained, 0, 100, "Retained ownership");
  out.advisorEmail = email(p.advisorEmail ?? "", true);
  out.outreach = [
    "On request",
    "Email with permission",
    "Meeting only",
  ].includes(p.outreach)
    ? p.outreach
    : "On request";
  if (out.advisorEmail && p.shareWithAdvisor !== true)
    fail("Confirm permission to share the full case with your named advisor.");
  out.shareWithAdvisor = !!out.advisorEmail;
  out.successor = choice(
    p.successor,
    successorOptions,
    "Not discussed",
    "successor status",
  );
  out.familyReadiness = choice(
    p.familyReadiness,
    familyReadinessOptions,
    "Not discussed",
    "family alignment",
  );
  out.estateStatus = choice(
    p.estateStatus,
    estateStatusOptions,
    "Not reviewed",
    "estate review status",
  );
  if (
    p.decisionPriorities !== undefined &&
    (!Array.isArray(p.decisionPriorities) ||
      p.decisionPriorities.some((v) => !decisionPriorityOptions.includes(v)))
  )
    fail("Choose supported decision priorities.");
  out.decisionPriorities = [...new Set(p.decisionPriorities ?? [])];
  return out;
}
export function scenarioInput(s) {
  return {
    multiple: number(s.multiple, 1, 15, "Multiple"),
    fees: number(s.fees, 0, 20, "Fees"),
    tax: number(s.tax, 0, 60, "Tax"),
    rollover: number(s.rollover, 0, 100, "Rollover"),
    family: number(s.family, 0, 1e12, "Family distribution"),
  };
}
export function proceeds(p, s) {
  const ev = p.ebitda * s.multiple,
    fees = (ev * s.fees) / 100,
    equity = ev - p.debt - fees,
    share = (Math.max(0, equity) * p.ownership) / 100,
    rollover = (share * s.rollover) / 100,
    tax = ((share - rollover) * s.tax) / 100,
    cash = share - rollover - tax - s.family;
  return {
    ev,
    fees,
    equity,
    share,
    rollover,
    tax,
    cash,
    shortfall: Math.max(0, -cash),
    debtShortfall: Math.max(0, -equity),
  };
}
export function readiness(data) {
  const evidence = data.evidence ?? [];
  const reported = evidence.filter((e) => e.reported).length,
    verified = evidence.filter((e) => e.verified).length;
  return {
    reported,
    verified,
    total: evidenceLabels.length,
    score: Math.round((reported / evidenceLabels.length) * 100),
    verifiedScore: Math.round((verified / evidenceLabels.length) * 100),
    gaps: evidence.filter((e) => !e.verified).map((e) => e.label),
  };
}
export function suggestedPaths(p) {
  return paths
    .filter((path) => pathReasons(p, path.name).length > 0)
    .map((path) => path.name);
}
export function familyPlanInput(p) {
  const out = {};
  for (const k of [
    "businessValue",
    "nonBusinessAssets",
    "liabilities",
    "availableLiquidity",
    "insuranceBenefit",
  ])
    out[k] = number(p[k], 0, 1e12, k.replace(/([A-Z])/g, " $1"));
  out.beneficiaries = number(p.beneficiaries, 1, 100, "Beneficiaries");
  out.businessRecipients = number(
    p.businessRecipients,
    1,
    out.beneficiaries,
    "Business recipients",
  );
  if (
    !Number.isInteger(out.beneficiaries) ||
    !Number.isInteger(out.businessRecipients)
  )
    fail("Beneficiary counts must be whole numbers.");
  if (out.availableLiquidity > out.nonBusinessAssets)
    fail(
      "Available liquidity is the liquid portion of non-business assets and cannot exceed those assets.",
    );
  out.notes = text(p.notes ?? "", 3000);
  return out;
}
export function familyBalance(plan) {
  const p = { ...defaultFamilyPlan, ...plan };
  const netEstate = Math.max(
    0,
    p.businessValue + p.nonBusinessAssets - p.liabilities,
  );
  const equalShare = netEstate / Math.max(1, p.beneficiaries);
  const nonBusinessTarget =
    equalShare * Math.max(0, p.beneficiaries - p.businessRecipients);
  const nonBusinessAvailable = Math.max(0, p.nonBusinessAssets - p.liabilities);
  const equalizationGap = Math.max(0, nonBusinessTarget - nonBusinessAvailable);
  const liquidAvailable = Math.max(
    0,
    Math.min(p.availableLiquidity, p.nonBusinessAssets) - p.liabilities,
  );
  const liquidityGap = Math.max(0, nonBusinessTarget - liquidAvailable);
  return {
    netEstate,
    equalShare,
    nonBusinessTarget,
    nonBusinessAvailable,
    equalizationGap,
    liquidAvailable,
    liquidityGap,
    illustrativeBenefitGap: Math.max(0, liquidityGap - p.insuranceBenefit),
  };
}
export function valuationSensitivity(profile, scenario) {
  const s = scenario ?? defaultScenario;
  return [
    { label: "Lower", multiple: Math.max(1, s.multiple - 1) },
    { label: "Working", multiple: s.multiple },
    { label: "Higher", multiple: Math.min(15, s.multiple + 1) },
  ].map((v) => ({
    ...v,
    ...proceeds(profile, { ...s, multiple: v.multiple }),
  }));
}
export function pathReasons(p, pathName) {
  const priorities = p.decisionPriorities ?? [];
  const reasons = [];
  if (
    pathName === "Strategic sale" &&
    (p.futureRole === "Exit fully" || p.successor === "External sale preferred")
  )
    reasons.push(
      "You want a full exit or have expressed a preference for an external sale.",
    );
  if (
    ["PE with rollover", "Partial recapitalization"].includes(pathName) &&
    (p.futureRole === "Continue leading" ||
      p.retained > 0 ||
      priorities.includes("Retained control"))
  )
    reasons.push(
      "You want continuing involvement or retained ownership; partner governance and future liquidity need review.",
    );
  if (
    pathName === "Family transfer" &&
    (p.trigger === "Family succession" ||
      p.successor === "Family successor interested" ||
      priorities.includes("Family continuity") ||
      /family|legacy/i.test(p.priorities ?? ""))
  )
    reasons.push(
      "Family succession or continuity is among your stated goals; confirm successor willingness and capability.",
    );
  if (
    ["Management transfer", "ESOP"].includes(pathName) &&
    (p.successor === "Management successor interested" ||
      priorities.includes("Employee continuity") ||
      /employee|team/i.test(p.employeePriorities ?? ""))
  )
    reasons.push(
      "Employee or management continuity matters to you; feasibility, financing and governance need specialist review.",
    );
  if (
    pathName === "Prepare / delayed exit" &&
    (p.timeline >= 3 || p.successor === "No successor identified")
  )
    reasons.push(
      "Your preparation runway or successor gap creates a reason to improve readiness before committing to a structure.",
    );
  return reasons;
}
export function routingSuggestions(data) {
  const p = data.profile ?? {},
    selected = data.pathDecision?.path;
  const out = [
    {
      team: "PNC Private Bank",
      reason:
        "Connect business liquidity with personal spending, estate and long-term wealth needs before a transition.",
      scope: "Business + personal",
    },
  ];
  if (
    selected === "Strategic sale" ||
    p.futureRole === "Exit fully" ||
    p.successor === "External sale preferred"
  )
    out.push({
      team: "Harris Williams",
      reason:
        "Discuss valuation perspectives and external sale alternatives; engagement and eligibility require advisor confirmation.",
      scope: "Business only",
    });
  if (
    selected === "PE with rollover" ||
    (p.futureRole === "Continue leading" && p.retained > 0)
  )
    out.push({
      team: "Financial Sponsor Coverage",
      reason:
        "Explore sponsor-related questions for continuing ownership; no buyer preference or financing approval is implied.",
      scope: "Business only",
    });
  if (
    ["Management transfer", "Partial recapitalization"].includes(selected) ||
    p.successor === "Management successor interested"
  )
    out.push({
      team: "Business Credit",
      reason:
        "Review funding needs and capacity for a proposed transfer or recapitalization, subject to credit evaluation.",
      scope: "Business only",
    });
  if (
    ["Family transfer", "ESOP", "Prepare / delayed exit"].includes(selected) ||
    p.trigger === "Family succession" ||
    p.successor !== "External sale preferred"
  )
    out.push({
      team: "Succession Planning",
      reason:
        "Clarify successor readiness, governance and transition responsibilities before choosing a path.",
      scope: "Business + personal",
    });
  return out;
}
export function transitionJourney(data) {
  const p = data.profile ?? {};
  const closed = data.outcomes?.closed === true;
  const definitions = [
    {
      id: "discover",
      label: "Clarify your goals",
      route: "discovery",
      done: !!p.business && !!p.trigger,
    },
    {
      id: "prepare",
      label: "Prepare and review",
      route: "readiness",
      done: !!data.review,
    },
    {
      id: "choose",
      label: "Compare transition paths",
      route: "pathways",
      done: !!data.pathDecision?.path,
    },
    {
      id: "connect",
      label: "Connect your team",
      route: "referrals",
      done: (data.referrals ?? []).some((r) =>
        ["Accepted", "Completed"].includes(r.status),
      ),
    },
    {
      id: "wealth",
      label: "Plan life beyond transition",
      route: "plan",
      done:
        closed &&
        (data.actions ?? []).filter((a) => a.kind === "Wealth planning")
          .length > 0 &&
        (data.actions ?? [])
          .filter((a) => a.kind === "Wealth planning")
          .every((a) => a.status === "Completed"),
    },
  ];
  let currentAssigned = false;
  return definitions.map(({ done, ...step }) => {
    const status = done
      ? "Complete"
      : !currentAssigned
        ? "Current"
        : "Upcoming";
    if (!done) currentAssigned = true;
    return { ...step, status };
  });
}
export function nextSteps(data, mode = "owner") {
  const p = data.profile ?? {},
    out = [];
  const add = (id, title, detail, route, priority = "Normal") =>
    out.push({ id, title, detail, route, priority });
  if (mode === "advisor" && data.meeting?.status === "Requested")
    add(
      "meeting",
      "Respond to the meeting request",
      data.meeting.topic,
      "overview",
      "High",
    );
  if (!p.advisorEmail && mode === "owner")
    add(
      "advisor",
      "Connect your relationship advisor",
      "Choose a named advisor and approve sharing your transition case.",
      "discovery",
      "High",
    );
  if (
    p.familyReadiness === "Conflict identified" ||
    p.familyReadiness === "Needs discussion"
  )
    add(
      "alignment",
      "Prepare a family alignment conversation",
      "Record different priorities before deciding who receives ownership or liquidity.",
      "family",
      "High",
    );
  if (!(data.stakeholders ?? []).length)
    add(
      "relationships",
      "Map the people affected",
      "Identify family participants, successors and trusted advisors, including the next generation.",
      "family",
    );
  if (readiness(data).reported < evidenceLabels.length)
    add(
      "evidence",
      mode === "owner"
        ? "Gather your transition evidence"
        : "Resolve evidence gaps with the owner",
      "The checklist records availability and verification, not saleability.",
      "readiness",
    );
  if (mode === "advisor" && !data.review)
    add(
      "review",
      "Record findings and next steps",
      "Review available evidence before qualifying the case or proposing a handoff.",
      "readiness",
      "High",
    );
  if (!data.pathDecision?.path)
    add(
      "path",
      "Discuss a preferred transition path",
      "Save an option and the reasons it fits your goals; an advisor still needs to review it.",
      "pathways",
    );
  if (!data.familyPlan || (mode === "advisor" && !data.familyReview))
    add(
      "family",
      mode === "advisor"
        ? "Review family liquidity assumptions"
        : "Explore the family continuity plan",
      "Compare business ownership, other assets and family liquidity needs using explicit assumptions.",
      "family",
    );
  if (
    (data.referrals ?? []).some((r) => r.status === "Draft") &&
    mode === "owner"
  )
    add(
      "referral",
      "Review the proposed specialist handoff",
      "Confirm the named recipient, purpose and information scope before approving.",
      "referrals",
      "High",
    );
  if (
    !data.actions?.some(
      (a) => a.kind === "Wealth planning" && a.status === "Completed",
    )
  )
    add(
      "wealth",
      "Connect your personal wealth plan",
      "Discuss spending, investments, estate needs and family distributions before closing.",
      "plan",
    );
  return out.sort(
    (a, b) => (a.priority === "High" ? 0 : 1) - (b.priority === "High" ? 0 : 1),
  );
}
export function portfolioPriority(
  row,
  today = new Date().toISOString().slice(0, 10),
) {
  const d = row.data ?? {},
    m = { ...defaultManagement, ...d.management };
  const open = (d.actions ?? []).filter((a) => a.status !== "Completed");
  const overdue = open.filter((a) => a.due && a.due < today).length;
  const reasons = [];
  if (overdue)
    reasons.push(`${overdue} overdue shared action${overdue === 1 ? "" : "s"}`);
  if (m.nextContact && m.nextContact <= today)
    reasons.push("Advisor follow-up is due");
  if (d.meeting?.status === "Requested")
    reasons.push("Owner meeting request needs a response");
  if (d.profile?.familyReadiness === "Conflict identified")
    reasons.push("Owner reported family disagreement");
  if (!d.review) reasons.push("Discovery awaits advisor review");
  const level =
    overdue ||
    (m.nextContact && m.nextContact <= today) ||
    d.meeting?.status === "Requested" ||
    d.profile?.familyReadiness === "Conflict identified"
      ? "High"
      : "Normal";
  return {
    level,
    label:
      level === "High"
        ? "Needs attention"
        : d.review
          ? "In progress"
          : "Awaiting review",
    reasons,
    overdue,
    openActions: open.length,
    stage: m.stage,
    nextContact: m.nextContact,
  };
}
export function newData(profile) {
  return {
    profile,
    scenario: { ...defaultScenario },
    evidence: evidenceLabels.map((label) => ({
      label,
      reported: false,
      verified: false,
    })),
    review: null,
    qualified: false,
    meeting: null,
    familyPlan: null,
    familyReview: null,
    pathDecision: null,
    valuationReview: null,
    stakeholders: [],
    management: { ...defaultManagement },
    referrals: [],
    actions: [
      {
        id: "wealth",
        title: "Review liquidity, spending, estate and investment needs",
        assignee: "Owner + wealth advisor",
        status: "Open",
        due: "",
        kind: "Wealth planning",
      },
      {
        id: "family",
        title: "Confirm family distribution and employee priorities",
        assignee: "Owner",
        status: "Open",
        due: "",
        kind: "Family continuity",
      },
    ],
    outcomes: { closed: false, assetsCaptured: null, retained: null },
    workMinutes: 0,
  };
}
export function access(row, user) {
  const addr = (user.email ?? "").toLowerCase(),
    roles = user.roles ?? [];
  if (row.ownerId === user.id) return "owner";
  if (roles.includes("advisor") && row.advisorEmail === addr) return "advisor";
  if (
    roles.some((r) => ["advisor", "specialist"].includes(r)) &&
    row.data.referrals.some(
      (r) =>
        r.recipient === addr &&
        ["Queued", "Accepted", "Completed"].includes(r.status),
    )
  )
    return "specialist";
  return null;
}
export function project(row, user) {
  const mode = access(row, user);
  if (!mode) fail("You do not have access to this case.", 403);
  if (mode !== "specialist") {
    const data = structuredClone(row.data);
    if (mode === "owner") delete data.management;
    return { ...row, data, mode };
  }
  const referrals = row.data.referrals.filter(
    (r) =>
      r.recipient === user.email.toLowerCase() &&
      ["Queued", "Accepted", "Completed"].includes(r.status),
  );
  const personal = referrals.some((r) => r.scope === "Business + personal");
  const p =
    referrals.find((r) => r.scope === "Business + personal")?.approvedProfile ??
    referrals[0]?.approvedProfile ??
    {};
  return {
    id: row.id,
    revision: row.revision,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    mode,
    data: {
      profile: personal
        ? p
        : Object.fromEntries(
            [
              "business",
              "industry",
              "trigger",
              "timeline",
              "revenue",
              "ebitda",
              "debt",
              "ownership",
              "futureRole",
              "confidentiality",
            ].map((k) => [k, p[k]]),
          ),
      referrals,
      review: row.data.review ? { at: row.data.review.at } : null,
    },
  };
}
export function metrics(rows) {
  const qualified = rows.filter((r) => r.data.qualified).length,
    refs = rows.flatMap((r) => r.data.referrals),
    sent = refs.filter((r) => r.queuedAt),
    accepted = sent.filter((r) => r.acceptedAt),
    durations = accepted.map(
      (r) => (Date.parse(r.acceptedAt) - Date.parse(r.queuedAt)) / 36e5,
    ),
    closed = rows.filter((r) => r.data.outcomes.closed),
    known = closed.filter((r) => r.data.outcomes.assetsCaptured !== null),
    retained = closed.filter((r) => r.data.outcomes.retained !== null);
  return {
    cases: rows.length,
    qualified,
    sent: sent.length,
    accepted: accepted.length,
    acceptance: sent.length
      ? Math.round((accepted.length / sent.length) * 100)
      : null,
    hours: durations.length
      ? Math.round(
          (durations.reduce((a, b) => a + b, 0) / durations.length) * 10,
        ) / 10
      : null,
    workMinutes: rows.reduce((n, r) => n + r.data.workMinutes, 0),
    assets: known.length
      ? known.reduce((n, r) => n + r.data.outcomes.assetsCaptured, 0)
      : null,
    retention: retained.length
      ? Math.round(
          (retained.filter((r) => r.data.outcomes.retained).length /
            retained.length) *
            100,
        )
      : null,
    outcomeCount: known.length,
    closed: closed.length,
  };
}
