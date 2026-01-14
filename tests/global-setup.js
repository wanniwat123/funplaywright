/**
 * Global Setup: Authenticate and save storage state for reuse across tests
 * This eliminates the need for beforeEach login in each test file
 * 
 * @see https://playwright.dev/docs/auth#reuse-authentication-state
 */

const { chromium } = require('@playwright/test');
const { login } = require('./utils/auth');
const path = require('path');
const fs = require('fs');

/**
 * Performs authentication and saves storage state
 * This runs once before all tests
 */
async function globalSetup(config) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Perform login
    await login(page);
    
    // Verify successful login
    await page.waitForURL('**/inventory.html', { timeout: 10000 });
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    await page.locator('.inventory_item').first().waitFor({ state: 'visible' });

    // Ensure .auth directory exists
    const authDir = path.join(__dirname, '../.auth');
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Save authenticated state to file
    const storageStatePath = path.join(authDir, 'storage-state.json');
    await context.storageState({ path: storageStatePath });
    
    console.log('✅ Authentication state saved successfully');
  } catch (error) {
    console.error('❌ Failed to save authentication state:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;
