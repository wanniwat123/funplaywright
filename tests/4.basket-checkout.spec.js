const { test, expect } = require('@playwright/test');
const { addToCart } = require('./utils/cart');

/**
 * Basic Checkout Test Suite
 * Note: More comprehensive checkout tests are in 7.checkout-validation.spec.js and 10.checkout-complete.spec.js
 */

// Authentication handled by storage state (global-setup.js)
// No beforeEach needed - tests start with authenticated state

test('User can complete checkout flow with a single item', async ({ page }) => {
  await page.goto('/inventory.html');
  await page.waitForLoadState('networkidle');
  await page.locator('.inventory_item').first().waitFor({ state: 'visible' });
  
  // Add product to cart
  await addToCart(page, 'sauce-labs-backpack');
  
  // Navigate to cart
  await page.click('.shopping_cart_link');
  await expect(page).toHaveURL(/cart.html/);
  
  // Verify product is in cart
  await expect(page.locator('.inventory_item_name')).toContainText('Sauce Labs Backpack');
  
  // Click checkout button
  await page.click('button[data-test="checkout"]');
  
  // Fill in checkout information
  await page.fill('input[data-test="firstName"]', 'John');
  await page.fill('input[data-test="lastName"]', 'Doe');
  await page.fill('input[data-test="postalCode"]', '12345');

  // Continue to overview
  await page.click('input[data-test="continue"]');
  
  // Finish order
  await page.click('button[data-test="finish"]');

  // Verify success message
  await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
});