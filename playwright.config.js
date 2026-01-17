// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests',
  // Keep runs deterministic and single-browser
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  // Global setup to authenticate once
  globalSetup: require.resolve('./tests/global-setup.js'),
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    headless: true, // Default to headless for cleaner runs
  },
  projects: [
    {
      name: 'login-tests',
      testMatch: '**/1.login.spec.js',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        // Login tests should NOT use storage state (testing authentication)
      },
    },
    {
      name: 'chrome',
      testIgnore: '**/1.login.spec.js',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        // Reuse authenticated state for other tests
        storageState: path.join(__dirname, '.auth/storage-state.json'),
      },
    },
  ],
});
