import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results/playwright',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5202',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm run dev -- --host localhost --port 5202 --strictPort',
    url: 'http://localhost:5202',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
