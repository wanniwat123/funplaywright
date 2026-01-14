const { test, expect } = require('@playwright/test');
const { login } = require('./utils/auth');
// Login before each test
test.beforeEach(async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  await page.waitForTimeout(1000);
});

test('User can complete checkout flow with a single item', async ({ page }) => {
  // Add product to cart
  await page.click('button[data-test="add-to-cart-sauce-labs-backpack"]');
  
  // Navigate to cart
  await page.click('.shopping_cart_link');
  await expect(page).toHaveURL(/cart.html/);
  await page.waitForTimeout(1000);
  
  // Verify product is in cart
  await expect(page.locator('.inventory_item_name')).toContainText('Sauce Labs Backpack');
  
  // Click checkout button
  await page.click('button[data-test="checkout"]');
  
  // Fill in checkout information
  await page.fill('input[data-test="firstName"]', 'koki');
  await page.fill('input[data-test="lastName"]', 'test');
  await page.fill('input[data-test="postalCode"]', '123');
  await page.waitForTimeout(1000);

  // Continue to overview
  await page.locator('input[data-test="continue"]').click({ timeout: 10000 });
  
  // Finish order
  await page.click('button[data-test="finish"]');

  // Verify success message
  await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
})