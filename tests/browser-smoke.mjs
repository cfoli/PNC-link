import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:8889");
await page
  .getByRole("heading", {
    name: "A thoughtful transition starts with a connected plan.",
  })
  .waitFor();
await page
  .getByRole("button", { name: "Explore the sample", exact: true })
  .click();
await page
  .getByRole("heading", {
    name: "Bennett Precision Manufacturing",
    exact: true,
  })
  .waitFor();
assert.equal(await page.locator('input[name="topic"]').count(), 1);
assert.equal(
  await page
    .getByRole("button", { name: "Request advisor meeting" })
    .isDisabled(),
  true,
);
for (const [name, title] of [
  ["Discovery profile", "The full picture starts here."],
  ["Readiness & review", "Evidence before conclusions."],
  ["Transition options", "Choose the outcome before the structure."],
  ["Proceeds & wealth", "From business value to personal choices."],
  ["Specialist referrals", "The right team, with your permission."],
  ["Shared action plan", "Every next step has an owner."],
  ["AI assistant", "Support for your next conversation."],
  ["Case history", "A visible record of progress."],
]) {
  await page.getByRole("link", { name, exact: true }).click();
  await page.getByRole("heading", { name: title, exact: true }).waitFor();
  if (name === "Transition options")
    assert.equal(await page.locator(".path-card").count(), 7);
}
await page
  .getByRole("button", { name: "View as advisor", exact: true })
  .click();
await page
  .getByRole("link", { name: "Practice insights", exact: true })
  .click();
await page
  .getByRole("heading", { name: "Measure the journey, then test the impact." })
  .waitFor();
await page
  .getByRole("link", { name: "Readiness & review", exact: true })
  .click();
assert.equal(
  await page
    .getByRole("button", { name: "Record advisor review" })
    .isDisabled(),
  true,
);
await page.screenshot({ path: "/tmp/nexus-advisor.png", fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page
  .getByRole("link", { name: "Transition options", exact: true })
  .click();
await page
  .getByRole("heading", { name: "Choose the outcome before the structure." })
  .waitFor();
assert.ok(
  await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  ),
  "mobile page overflows",
);
await page.screenshot({ path: "/tmp/nexus-mobile.png", fullPage: true });
await page.getByRole("link", { name: "Create your case", exact: true }).click();
await page
  .getByRole("heading", { name: "Start your next chapter.", exact: true })
  .waitFor();
assert.equal(await page.locator(".demo-bar").count(), 0);
assert.equal(
  await page.locator('input[name="password"]').getAttribute("minlength"),
  "12",
);
assert.deepEqual(errors, []);
console.log(
  "PASS: home, both sample workspaces, all nine case screens, read-only actions, seven transition paths, mobile layout, and signup.",
);
await browser.close();
