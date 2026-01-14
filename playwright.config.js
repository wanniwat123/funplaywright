// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  // Global setup to authenticate once
  globalSetup: require.resolve('./tests/global-setup.js'),
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    headless: false, // Visible browser for regular test runs
    slowMo: 500, // Slow down all actions by 500ms to see them better
    // Reuse authenticated state across all tests
    storageState: path.join(__dirname, '.auth/storage-state.json'),
  },
  projects: [
    {
      name: 'chrome',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
});
