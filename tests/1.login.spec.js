const { test, expect } = require('@playwright/test');
const { login } = require('./utils/auth');

test('Login to SauceDemo and verify products page', async ({ page }) => {
  // Login
  await login(page);
  await page.waitForTimeout(1000);

  // Verify navigation to inventory page
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');

  // Verify "Products" text is displayed
  await expect(page.locator('.title')).toHaveText('Products');
  await page.waitForTimeout(2000);
});
