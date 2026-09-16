import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["line"]],
  use: {
    baseURL: "http://localhost:3003",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "ALLOW_FILE_APPOINTMENTS=true npm run start -- -p 3003",
    url: "http://localhost:3003",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

