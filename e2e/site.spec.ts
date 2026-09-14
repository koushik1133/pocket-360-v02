import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home portfolio and navigation work", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await page.goto("/");
  await expect(page).toHaveTitle(/Pocket Reels 360/);
  await expect(
    page.getByRole("heading", { name: /Your spotlight/i }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Brands" }).click();
  await expect(page.getByRole("button", { name: /View Aurum arrival/i })).toBeVisible();
  await page.getByRole("button", { name: /View Aurum arrival/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Aurum arrival" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close work viewer" }).last().click();
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(runtimeErrors).toEqual([]);
});

test("appointment validation and submission work end to end", async ({ page }) => {
  const date = new Date();
  date.setDate(date.getDate() + 45 + (Date.now() % 30));
  const dateValue = date.toISOString().slice(0, 10);
  const minutes = String(Math.floor(Date.now() / 1000) % 60).padStart(2, "0");

  await page.goto("/book");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(
    page.getByText("Choose a preferred date.", { exact: true }),
  ).toBeVisible();

  await page.getByLabel("Preferred date").fill(dateValue);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Preferred time").fill(`13:${minutes}`);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Name").fill("Website QA");
  await page.getByLabel("Phone").fill("+1 469 555 0199");
  await page.getByLabel("Email").fill("qa@example.com");
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByLabel(/Tell us a little about your project/i)
    .fill("End-to-end booking verification.");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Confirm appointment" }).click();

  await expect(
    page.getByRole("heading", { name: "You're all set." }),
  ).toBeVisible();
  await expect(page.getByText(/appointment request has been received/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Add to calendar/i })).toBeVisible();
});

test("appointment API rejects invalid and duplicate requests", async ({
  request,
}) => {
  const date = new Date();
  date.setDate(date.getDate() + 180 + (Date.now() % 60));
  const dateValue = date.toISOString().slice(0, 10);
  const headers = {
    Origin: "http://127.0.0.1:3000",
    "X-Forwarded-For": `203.0.113.${10 + (Date.now() % 100)}`,
  };

  const invalid = await request.post("/api/appointments", {
    headers,
    data: {
      service: "reel-production",
      date: dateValue,
      time: "13:30",
      name: "Q",
      phone: "12",
      email: "invalid",
      projectDetails: "",
      website: "",
      idempotencyKey: crypto.randomUUID(),
    },
  });
  expect(invalid.status()).toBe(422);

  const payload = {
    service: "reel-production",
    date: dateValue,
    time: `15:${String(Math.floor(Date.now() / 1000) % 60).padStart(2, "0")}`,
    name: "API QA",
    phone: "+1 469 555 0177",
    email: "api.qa@example.com",
    projectDetails: "Duplicate-slot verification.",
    website: "",
  };
  const created = await request.post("/api/appointments", {
    headers,
    data: { ...payload, idempotencyKey: crypto.randomUUID() },
  });
  expect(created.status()).toBe(201);

  const duplicate = await request.post("/api/appointments", {
    headers,
    data: { ...payload, idempotencyKey: crypto.randomUUID() },
  });
  expect(duplicate.status()).toBe(409);
});

test("main pages have no WCAG A or AA violations", async ({ page }) => {
  for (const route of ["/", "/book", "/privacy", "/terms"]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(
      results.violations,
      `${route} accessibility violations`,
    ).toEqual([]);
  }
});

test("layouts do not overflow at key widths", async ({ page }) => {
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/book"]) {
      await page.goto(route);
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
      }));
      expect(
        dimensions.document,
        `${route} has document overflow at ${width}px`,
      ).toBeLessThanOrEqual(dimensions.viewport);
    }
  }
});
