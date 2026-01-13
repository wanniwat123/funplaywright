const { test, expect } = require('@playwright/test');
const { login } = require('./utils/auth');
const { addToCart, verifyCartCount } = require('./utils/cart');

// Login before each test
test.beforeEach(async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
});

test('Add product Sauce Labs Backpack to cart and verify cart count', async ({ page }) => {
  await addToCart(page, 'sauce-labs-backpack');
  await verifyCartCount(page, 1);
  await page.waitForTimeout(2000);
});

test('Add multiple products to cart and verify cart count', async ({ page }) => {
  // Add first product
  await addToCart(page, 'sauce-labs-backpack');
  await verifyCartCount(page, 1);
  
  // Add second product
  await addToCart(page, 'sauce-labs-bike-light');
  await verifyCartCount(page, 2);
  
  await page.waitForTimeout(2000);
});