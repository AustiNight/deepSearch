import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 0.0.0.0 --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    { name: 'mobile', use: { ...devices['iPhone 12'] } },
    { name: 'tablet', use: { ...devices['iPad (gen 7)'] } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 720 } } },
    { name: 'desktop-lg', use: { viewport: { width: 1920, height: 1080 } } }
  ]
});
