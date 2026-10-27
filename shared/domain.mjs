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
  const names = [];
  if (p.trigger === "Family succession" || /family|legacy/i.test(p.priorities))
    names.push("Family transfer");
  if (p.futureRole === "Continue leading")
    names.push("PE with rollover", "Partial recapitalization");
  if (/employee|team/i.test(p.employeePriorities))
    names.push("Management transfer", "ESOP");
  if (p.futureRole === "Exit fully") names.push("Strategic sale");
  if (p.timeline >= 3) names.push("Prepare / delayed exit");
  return [...new Set(names)];
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
  if (mode !== "specialist") return { ...row, mode };
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
