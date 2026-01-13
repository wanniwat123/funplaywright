const { test, expect } = require('@playwright/test');

test('Login to SauceDemo and verify products page', async ({ page }) => {
  // 1. Open https://www.saucedemo.com/
  await page.goto('https://www.saucedemo.com/');
  await page.waitForTimeout(2000); // Wait 2 seconds to see the page

  // 2. Insert username standard_user
  await page.fill('#user-name', 'standard_user');
  await page.waitForTimeout(1000); // Wait 1 second

  // 3. Insert password secret_sauce
  await page.fill('#password', 'secret_sauce');
  await page.waitForTimeout(1000); // Wait 1 second

  // 4. Click Login
  await page.click('#login-button');
  await page.waitForTimeout(2000); // Wait 2 seconds for navigation

  // 5. Verify it navigate to https://www.saucedemo.com/inventory.html
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  await page.waitForTimeout(1000); // Wait 1 second

  // 6. Verify it show text "Products"
  await expect(page.locator('.title')).toHaveText('Products');
  await page.waitForTimeout(3000); // Wait 3 seconds to see the final result
});
