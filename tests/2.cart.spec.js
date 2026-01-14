const { test } = require('@playwright/test');
const { addToCart, verifyCartCount } = require('./utils/cart');

// Authentication handled by storage state (global-setup.js)
// No beforeEach needed - tests start with authenticated state

test('Add product Sauce Labs Backpack to cart and verify cart count', async ({ page }) => {
  await page.goto('/inventory.html');
  await page.waitForLoadState('networkidle');
  await page.locator('.inventory_item').first().waitFor({ state: 'visible' });
  
  await addToCart(page, 'sauce-labs-backpack');
  await verifyCartCount(page, 1);
});

test('Add multiple products to cart and verify cart count', async ({ page }) => {
  await page.goto('/inventory.html');
  await page.waitForLoadState('networkidle');
  await page.locator('.inventory_item').first().waitFor({ state: 'visible' });
  
  // Add first product
  await addToCart(page, 'sauce-labs-backpack');
  await verifyCartCount(page, 1);
  
  // Add second product
  await addToCart(page, 'sauce-labs-bike-light');
  await verifyCartCount(page, 2);
});