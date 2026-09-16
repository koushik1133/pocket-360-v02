import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home portfolio and navigation work", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveTitle(/Pocket Reels 360/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const brandsBtn = page.locator(".work-filters button", {
    hasText: /^Brands$/i,
  });
  await brandsBtn.scrollIntoViewIfNeeded();
  await brandsBtn.click();
  await expect(brandsBtn).toHaveClass(/is-active/);

  const aurumCard = page
    .locator(".work-card button", {
      hasText: /Aurum arrival/i,
    })
    .first();
  await aurumCard.scrollIntoViewIfNeeded();
  await aurumCard.click();

  const lightbox = page.locator(".lightbox");
  await expect(lightbox).toBeVisible();
  await page.locator(".lightbox__top button").click();
  await expect(lightbox).toBeHidden();
});

test("appointment validation and submission work end to end", async ({ page }) => {
  const date = new Date();
  date.setDate(date.getDate() + 45 + (Date.now() % 30));
  const dateValue = date.toISOString().slice(0, 10);
  const minutes = String(Math.floor(Date.now() / 1000) % 60).padStart(2, "0");

  await page.goto("/book");

  // Step 0: Package Selection
  const continueBtn = page.getByRole("button", { name: "Continue" });
  await expect(continueBtn).toBeVisible();
  await continueBtn.click();

  // Step 1: Date validation
  const dateInput = page.getByLabel("Preferred date");
  await expect(dateInput).toBeVisible();
  await continueBtn.click();
  await expect(
    page.getByText("Choose a preferred date.", { exact: true }),
  ).toBeVisible();

  await dateInput.fill(dateValue);
  await continueBtn.click();

  // Step 2: Time
  await expect(page.getByLabel(/Preferred time/i)).toBeVisible();
  await page.getByLabel(/Preferred time/i).fill(`13:${minutes}`);
  await continueBtn.click();

  // Step 3: Contact
  await expect(page.getByLabel("Name")).toBeVisible();
  await page.getByLabel("Name").fill("Website QA");
  await page.getByLabel("Phone").fill("+1 469 555 0199");
  await page.getByLabel("Email").fill("qa@example.com");
  await continueBtn.click();

  // Step 4: Event Details
  await expect(
    page.getByLabel(/Tell us a little about your project/i),
  ).toBeVisible();
  await page
    .getByLabel(/Tell us a little about your project/i)
    .fill("End-to-end booking verification.");
  await continueBtn.click();

  // Step 5: Review & Submit — consent is required and never pre-checked
  const confirmBtn = page.getByRole("button", { name: "Confirm appointment" });
  await confirmBtn.click();
  await expect(
    page.getByText("Confirm you are 18 or older to continue.", { exact: true }),
  ).toBeVisible();

  await page.getByLabel(/at least 18 years of age/i).check();
  await page.getByLabel(/I agree to the/i).check();
  await confirmBtn.click();

  await expect(
    page.getByRole("heading", { name: "You're all set." }),
  ).toBeVisible();
  await expect(page.getByText(/appointment request has been received/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Add to Google Calendar/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Download \.ics/i })).toBeVisible();
});

test("appointment API rejects invalid and duplicate requests", async ({
  request,
}) => {
  const date = new Date();
  date.setDate(date.getDate() + 60 + Math.floor(Math.random() * 120));
  const dateValue = date.toISOString().slice(0, 10);
  const randomMin = String(Math.floor(Math.random() * 55)).padStart(2, "0");
  const headers = {
    Origin: "http://localhost:3003",
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
    packageType: "Wedding & Reception Reels",
    date: dateValue,
    time: `15:${randomMin}`,
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
    await page.evaluate(() => {
      document
        .querySelectorAll("[data-reveal]")
        .forEach((el) => el.classList.add("is-visible"));
      document
        .querySelectorAll("[data-stagger]")
        .forEach((el) => el.classList.add("is-visible"));
    });
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

test("assistant handles privacy policy request and off-topic guardrails", async ({
  page,
}) => {
  await page.goto("/");
  const launcher = page.getByRole("button", {
    name: /Open the Pocket Reels assistant/i,
  });
  await expect(launcher).toBeVisible();
  await launcher.click();

  const panel = page.locator(".assistant-panel");
  await expect(panel).toBeVisible();

  // 1. Ask to open privacy policy
  const input = page.getByPlaceholder(/Ask about reels/i);
  await input.fill("Can I open the privacy policy?");
  await page.getByRole("button", { name: "Send message" }).click();

  // Verify privacy policy action button appears
  const privacyButton = page.locator(".assistant-action", {
    hasText: /Privacy Policy/i,
  }).first();
  await expect(privacyButton).toBeVisible({ timeout: 15000 });
  await privacyButton.click();

  // Verify navigation to /privacy
  await page.waitForURL("**/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Privacy Policy/i);

  // 2. Open assistant on /privacy and test off-topic guardrail
  const assistantOnPrivacy = page.getByRole("button", {
    name: /Open the Pocket Reels assistant/i,
  });
  await expect(assistantOnPrivacy).toBeVisible();
  await assistantOnPrivacy.click();

  const input2 = page.getByPlaceholder(/Ask about reels/i);
  await input2.fill("Can you write a Python script for me?");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(
    page.locator(".assistant-bubble--assistant").last(),
  ).toContainText(/Pocket Reels/i, { timeout: 15000 });
});

test("admin dashboard requires PIN 9912 and shows enquiries table", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Pocket Reels 360 Admin" }),
  ).toBeVisible();

  // Test invalid PIN
  const pinInput = page.getByLabel("Access PIN / Password");
  await pinInput.fill("0000");
  await page.getByRole("button", { name: "Unlock Dashboard" }).click();
  await expect(page.getByText(/Incorrect PIN/i)).toBeVisible();

  // Test valid PIN 9912
  await pinInput.fill("9912");
  await page.getByRole("button", { name: "Unlock Dashboard" }).click();

  await expect(
    page.getByRole("heading", { name: /Bookings Manager/i }),
  ).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("button", { name: "Export CSV" })).toBeVisible();
  await expect(page.getByPlaceholder(/Search by client/i)).toBeVisible();
});

test("admin API rejects unauthenticated status updates and accepts valid ones", async ({
  request,
}) => {
  const denied = await request.patch("/api/admin/appointments", {
    data: { id: crypto.randomUUID(), status: "confirmed" },
  });
  expect(denied.status()).toBe(401);

  const list = await request.get("/api/admin/appointments", {
    headers: { "x-admin-pin": "9912" },
  });
  expect(list.status()).toBe(200);
  const body = (await list.json()) as {
    appointments: { id: string; status: string }[];
  };
  const target = body.appointments[0];
  if (!target) return; // nothing to update in an empty store

  const updated = await request.patch("/api/admin/appointments", {
    headers: { "x-admin-pin": "9912" },
    data: { id: target.id, status: target.status },
  });
  expect(updated.status()).toBe(200);

  const csv = await request.get("/api/admin/appointments?format=csv", {
    headers: { "x-admin-pin": "9912" },
  });
  expect(csv.status()).toBe(200);
  expect(csv.headers()["content-type"]).toContain("text/csv");

  // Decision endpoint: rejects bad input, and either sends (200/207) or
  // refuses honestly when no client-capable email transport is configured (503).
  const badDecision = await request.post("/api/admin/appointments/decision", {
    headers: { "x-admin-pin": "9912" },
    data: { id: target.id, decision: "approve", subject: "x", body: "short" },
  });
  expect(badDecision.status()).toBe(422);

  const status = await request.get("/api/admin/status", {
    headers: { "x-admin-pin": "9912" },
  });
  expect(status.status()).toBe(200);
  const system = (await status.json()) as {
    email: { canEmailClients: boolean };
    storage: { kind: string };
  };
  expect(["supabase", "postgres", "local-file"]).toContain(system.storage.kind);
  if (!system.email.canEmailClients) {
    const refused = await request.post("/api/admin/appointments/decision", {
      headers: { "x-admin-pin": "9912" },
      data: {
        id: target.id,
        decision: "deny",
        subject: "About your booking",
        body: "Unfortunately we cannot take this booking right now.",
      },
    });
    expect(refused.status()).toBe(503);
  }
});




