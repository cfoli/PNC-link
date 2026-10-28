import test from "node:test";
import assert from "node:assert/strict";
import {
  profileInput,
  newData,
  project,
  defaultFamilyPlan,
  familyPlanInput,
  familyBalance,
  valuationSensitivity,
  defaultScenario,
  portfolioPriority,
  transitionJourney,
  nextSteps,
  routingSuggestions,
  pathReasons,
  suggestedPaths,
  dateInput,
} from "../shared/domain.mjs";
import { mutate } from "../shared/workflow.mjs";

const owner = { id: "owner", email: "owner@example.com", roles: [] };
const advisor = {
  id: "advisor",
  email: "advisor@example.com",
  roles: ["advisor"],
};
const specialist = {
  id: "specialist",
  email: "specialist@example.com",
  roles: ["specialist"],
};
const now = "2026-10-27T10:00:00.000Z";
function fixture() {
  const profile = profileInput({
    name: "Maya Diaz",
    business: "Diaz Tools",
    industry: "Manufacturing",
    trigger: "Family succession",
    timeline: 3,
    futureRole: "Step back gradually",
    revenue: 10000000,
    ebitda: 1000000,
    debt: 500000,
    ownership: 100,
    liquidity: 2500000,
    retained: 20,
    advisorEmail: advisor.email,
    shareWithAdvisor: true,
  });
  return {
    id: "case-1",
    ownerId: owner.id,
    ownerEmail: owner.email,
    advisorEmail: advisor.email,
    revision: 1,
    data: newData(profile),
  };
}
function apply(row, who, op, payload) {
  row.data = mutate(row, who, op, payload, now).data;
  return row;
}
function readyRow() {
  const row = fixture();
  row.data.review = { note: "Reviewed", at: now, by: advisor.email };
  row.data.qualified = true;
  row.data.referrals = [
    {
      id: "ref",
      recipient: specialist.email,
      team: "PNC Private Bank",
      scope: "Business + personal",
      status: "Accepted",
      approvedProfile: structuredClone(row.data.profile),
    },
  ];
  return row;
}
const plan = {
  ...defaultFamilyPlan,
  businessValue: 5000000,
  nonBusinessAssets: 3000000,
  availableLiquidity: 3000000,
};

test("older discovery records gain optional structured defaults without fabricated facts", () => {
  const row = fixture();
  assert.equal(row.data.profile.successor, "Not discussed");
  assert.equal(row.data.profile.familyReadiness, "Not discussed");
  assert.equal(row.data.profile.estateStatus, "Not reviewed");
  assert.deepEqual(row.data.profile.decisionPriorities, []);
  assert.equal(row.data.familyPlan, null);
  assert.throws(
    () =>
      profileInput({ ...row.data.profile, successor: "Guaranteed successor" }),
    /supported/,
  );
  assert.throws(
    () =>
      profileInput({ ...row.data.profile, decisionPriorities: "Liquidity" }),
    /priorities/,
  );
  assert.throws(
    () =>
      profileInput({
        ...row.data.profile,
        decisionPriorities: ["AI certainty"],
      }),
    /priorities/,
  );
});

test("family illustration distinguishes equal shares, non-business assets and current liquidity", () => {
  const r = familyBalance(familyPlanInput(plan));
  assert.equal(r.netEstate, 8000000);
  assert.equal(r.equalShare, 4000000);
  assert.equal(r.nonBusinessTarget, 4000000);
  assert.equal(r.equalizationGap, 1000000);
  assert.equal(r.liquidityGap, 1000000);
  const illiquid = familyBalance({
    ...plan,
    availableLiquidity: 1000000,
    insuranceBenefit: 2000000,
  });
  assert.equal(illiquid.equalizationGap, 1000000);
  assert.equal(illiquid.liquidityGap, 3000000);
  assert.equal(illiquid.illustrativeBenefitGap, 1000000);
  assert.equal(
    illiquid.netEstate,
    r.netEstate,
    "Hypothetical death benefit is not treated as present estate cash",
  );
  assert.equal(
    familyBalance({ ...plan, businessRecipients: 2 }).equalizationGap,
    0,
  );
  assert.equal(familyBalance({ ...plan, liabilities: 9000000 }).netEstate, 0);
});

test("family input rejects overcounted liquid assets, fractional people and invalid allocations", () => {
  assert.throws(
    () => familyPlanInput({ ...plan, availableLiquidity: 4000000 }),
    /cannot exceed/,
  );
  assert.throws(
    () => familyPlanInput({ ...plan, beneficiaries: 2.5 }),
    /whole/,
  );
  assert.throws(
    () => familyPlanInput({ ...plan, businessRecipients: 3 }),
    /between/,
  );
  assert.throws(() => familyPlanInput({ ...plan, liabilities: -1 }), /between/);
  assert.throws(
    () => familyPlanInput({ ...plan, insuranceBenefit: "" }),
    /required/,
  );
});

test("family changes and relationship changes require renewed review and handoff consent", () => {
  const row = readyRow();
  apply(row, owner, "familyPlan", plan);
  assert.equal(row.data.review, null);
  assert.equal(row.data.qualified, false);
  assert.equal(row.data.referrals[0].status, "Withdrawn");
  assert.throws(
    () => apply(row, owner, "familyReview", { note: "Reviewed" }),
    /role/,
  );
  apply(row, advisor, "familyReview", {
    note: "Discuss asset assumptions and family fairness with estate counsel.",
  });
  assert.equal(row.data.familyReview.by, advisor.email);
  assert.throws(() => apply(row, advisor, "familyPlan", plan), /role/);
  apply(row, owner, "stakeholder", {
    name: "Alex",
    relationship: "Child",
    role: "Outside business",
    engagement: "Owner will introduce",
    notes: "Interested in philanthropy",
  });
  assert.equal(row.data.familyReview, null);
  assert.equal(row.data.stakeholders[0].engagement, "Owner will introduce");
});

test("owner path preference preserves review when unchanged and invalidates on actual change", () => {
  const row = readyRow();
  assert.throws(
    () =>
      apply(row, advisor, "pathDecision", {
        path: "Family transfer",
        reason: "Legacy",
      }),
    /role/,
  );
  assert.throws(
    () =>
      apply(row, owner, "pathDecision", {
        path: "Guaranteed sale",
        reason: "Price",
      }),
    /supported/,
  );
  apply(row, owner, "pathDecision", {
    path: "Family transfer",
    reason: "Develop the next generation",
  });
  assert.equal(row.data.review, null);
  assert.equal(row.data.pathDecision.at, now);
  row.data.review = { note: "Reviewed again", at: now };
  apply(row, owner, "pathDecision", {
    path: "Family transfer",
    reason: "Develop the next generation",
  });
  assert.equal(row.data.review.note, "Reviewed again");
  apply(row, owner, "pathDecision", { path: "", reason: "" });
  assert.equal(row.data.pathDecision, null);
  assert.equal(row.data.review, null);
});

test("advisor value range requires provenance and ordered bounds and becomes stale on owner edits", () => {
  const row = fixture();
  assert.throws(
    () =>
      apply(row, owner, "valuationReview", { basis: "Input", low: 1, high: 2 }),
    /role/,
  );
  assert.throws(
    () =>
      apply(row, advisor, "valuationReview", { basis: "", low: 1, high: 2 }),
    /basis/,
  );
  assert.throws(
    () =>
      apply(row, advisor, "valuationReview", {
        basis: "Client financials",
        low: 2,
        high: 1,
      }),
    /between/,
  );
  apply(row, advisor, "valuationReview", {
    basis:
      "Client supplied financials, 27 October 2026. No comparable transaction feed.",
    low: 4000000,
    high: 6000000,
  });
  assert.equal(row.data.valuationReview.high, 6000000);
  apply(row, owner, "scenario", { ...defaultScenario, multiple: 6 });
  assert.equal(row.data.valuationReview, null);
});

test("scenario sensitivity is bounded and exposes debt shortfalls without negative ownership value", () => {
  const p = fixture().data.profile;
  const rows = valuationSensitivity(p, defaultScenario);
  assert.deepEqual(
    rows.map((r) => r.multiple),
    [4, 5, 6],
  );
  assert.deepEqual(
    rows.map((r) => r.ev),
    [4000000, 5000000, 6000000],
  );
  assert.equal(
    valuationSensitivity(p, { ...defaultScenario, multiple: 1 })[0].multiple,
    1,
  );
  assert.equal(
    valuationSensitivity(p, { ...defaultScenario, multiple: 15 })[2].multiple,
    15,
  );
  assert.equal(
    valuationSensitivity({ ...p, debt: 10000000 }, defaultScenario)[0].share,
    0,
  );
  assert.ok(
    valuationSensitivity({ ...p, debt: 10000000 }, defaultScenario)[0]
      .debtShortfall > 0,
  );
});

test("internal case management is advisor-only and omitted from owner and specialist responses", () => {
  const row = readyRow();
  assert.throws(
    () => apply(row, owner, "caseManagement", { stage: "Discovery" }),
    /role/,
  );
  apply(row, advisor, "caseManagement", {
    stage: "Preparation",
    nextContact: "2026-10-30",
    note: "Private internal capacity note",
  });
  assert.equal(
    project(row, advisor).data.management.note,
    "Private internal capacity note",
  );
  assert.equal(project(row, owner).data.management, undefined);
  assert.equal(project(row, specialist).data.management, undefined);
  assert.ok(
    !JSON.stringify(project(row, owner)).includes(
      "Private internal capacity note",
    ),
  );
  assert.equal(
    row.data.management.note,
    "Private internal capacity note",
    "Projection must not mutate stored case",
  );
  assert.throws(
    () =>
      apply(row, advisor, "caseManagement", {
        stage: "Auto approved",
        nextContact: "",
        note: "",
      }),
    /stage/,
  );
  assert.throws(
    () =>
      apply(row, advisor, "caseManagement", {
        stage: "Discovery",
        nextContact: "2026-02-30",
        note: "",
      }),
    /date/,
  );
});

test("relationship map has bounded owner control and never appears in specialist snapshots", () => {
  const row = readyRow();
  const input = {
    name: "Alex Diaz",
    relationship: "Child",
    role: "Active in business",
    engagement: "Permission to discuss",
    notes: "Owner's recorded preference only",
  };
  assert.throws(() => apply(row, advisor, "stakeholder", input), /role/);
  apply(row, owner, "stakeholder", input);
  const id = row.data.stakeholders[0].id;
  apply(row, owner, "stakeholder", {
    ...input,
    id,
    engagement: "Owner will introduce",
  });
  assert.equal(row.data.stakeholders.length, 1);
  assert.equal(project(row, advisor).data.stakeholders.length, 1);
  row.data.referrals[0].status = "Accepted";
  assert.equal(project(row, specialist).data.stakeholders, undefined);
  assert.throws(
    () =>
      apply(row, owner, "stakeholder", {
        ...input,
        engagement: "Bank may contact automatically",
      }),
    /preferences/,
  );
  for (let i = 1; i < 12; i++)
    apply(row, owner, "stakeholder", { ...input, name: `Person ${i}` });
  assert.throws(() => apply(row, owner, "stakeholder", input), /at most 12/);
  apply(row, owner, "removeStakeholder", { id });
  assert.equal(row.data.stakeholders.length, 11);
  assert.throws(
    () => apply(row, owner, "removeStakeholder", { id }),
    /not found/,
  );
});

test("portfolio priorities expose reasons and counts rather than invented opportunity scores", () => {
  const row = fixture();
  row.data.actions.push({
    id: "tax",
    title: "Review structure",
    due: "2026-10-25",
    status: "Open",
  });
  row.data.management = {
    stage: "Preparation",
    nextContact: "2026-10-27",
    note: "",
  };
  const p = portfolioPriority(row, "2026-10-27");
  assert.equal(p.level, "High");
  assert.equal(p.overdue, 1);
  assert.equal(p.openActions, 3);
  assert.equal(p.stage, "Preparation");
  assert.ok(p.reasons.includes("Advisor follow-up is due"));
  row.data.actions[2].status = "Completed";
  row.data.management.nextContact = "2026-10-28";
  assert.equal(portfolioPriority(row, "2026-10-27").level, "Normal");
});

test("journey and routing reflect saved facts with human review still required", () => {
  const row = fixture();
  const journey = transitionJourney(row.data);
  assert.equal(journey[0].status, "Complete");
  assert.equal(journey[1].status, "Current");
  assert.equal(journey[2].status, "Upcoming");
  assert.equal(
    nextSteps(row.data).some((s) => s.id === "relationships"),
    true,
  );
  assert.equal(
    routingSuggestions(row.data).some((s) => s.team === "PNC Private Bank"),
    true,
  );
  row.data.profile.successor = "Management successor interested";
  row.data.profile.decisionPriorities = ["Employee continuity"];
  assert.ok(suggestedPaths(row.data.profile).includes("Management transfer"));
  assert.ok(pathReasons(row.data.profile, "ESOP").length > 0);
  assert.ok(
    routingSuggestions(row.data).some((s) => s.team === "Business Credit"),
  );
  const old = { profile: row.data.profile, evidence: [] };
  assert.doesNotThrow(() => nextSteps(old));
  assert.doesNotThrow(() => transitionJourney(old));
  assert.doesNotThrow(() => portfolioPriority({ data: old }, "2026-10-27"));
});

test("dates reject impossible calendar values", () => {
  assert.equal(dateInput("2028-02-29"), "2028-02-29");
  assert.equal(dateInput(""), "");
  assert.throws(() => dateInput("2026-02-29"), /valid/);
  assert.throws(() => dateInput("2026-10-27T12:00:00Z"), /length/);
});
