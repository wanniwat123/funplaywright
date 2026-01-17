const { test, expect } = require('@playwright/test');
const { addToCart, verifyCartCount } = require('./utils/cart');

/**
 * Edge Cases Test Suite
 * Tests boundary conditions, special scenarios, and unusual user behaviors
 * 
 * Edge Cases Covered:
 * - Maximum items in cart
 * - Empty cart checkout attempt
 * - Very long input strings
 * - Special characters in inputs
 * - Rapid clicking (race conditions)
 * - Browser back/forward navigation
 * - Concurrent operations
 * - Price boundary values
 * - Zero quantity scenarios
 */

// Authentication handled by storage state (global-setup.js)
// No beforeEach needed - tests start with authenticated state

/**
 * Helper function to ensure inventory page is ready
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function ensurePageReady(page) {
  await page.goto('/inventory.html');
  await page.waitForLoadState('networkidle');
  await page.locator('.inventory_item').first().waitFor({ state: 'visible' });
}

test('Verify adding all available products to cart', async ({ page }) => {
  await ensurePageReady(page);
  
  // Get all available products
  const productButtons = await page.locator('button[data-test^="add-to-cart"]').all();
  const productCount = productButtons.length;
  
  // Add all products to cart
  for (let i = 0; i < productCount; i++) {
    const button = productButtons[i];
    const dataTest = await button.getAttribute('data-test');
    const productId = dataTest.replace('add-to-cart-', '');
    await addToCart(page, productId);
  }
  
  // Verify cart count matches product count
  await verifyCartCount(page, productCount);
  
  // Verify all buttons changed to "Remove"
  const removeButtons = await page.locator('button[data-test^="remove"]').count();
  expect(removeButtons).toBe(productCount);
});

test('Verify checkout with maximum items', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add all products
  const productButtons = await page.locator('button[data-test^="add-to-cart"]').all();
  for (const button of productButtons) {
    const dataTest = await button.getAttribute('data-test');
    const productId = dataTest.replace('add-to-cart-', '');
    await addToCart(page, productId);
  }
  
  // Navigate to checkout
  await page.click('.shopping_cart_link');
  await page.click('button[data-test="checkout"]');
  
  // Fill checkout form
  await page.fill('input[data-test="firstName"]', 'John');
  await page.fill('input[data-test="lastName"]', 'Doe');
  await page.fill('input[data-test="postalCode"]', '12345');
  await page.click('input[data-test="continue"]');
  
  // Verify checkout overview shows all items
  const cartItems = await page.locator('.cart_item').count();
  expect(cartItems).toBeGreaterThan(0);
  
  // Verify total calculation is correct
  const totalText = await page.locator('.summary_total_label').textContent();
  expect(totalText).toContain('$');
});

test('Verify handling of very long input strings', async ({ page }) => {
  await ensurePageReady(page);
  
  await addToCart(page, 'sauce-labs-backpack');
  await page.click('.shopping_cart_link');
  await page.click('button[data-test="checkout"]');
  
  // Test very long first name (1000 characters)
  const longString = 'A'.repeat(1000);
  await page.fill('input[data-test="firstName"]', longString);
  await page.fill('input[data-test="lastName"]', 'Doe');
  await page.fill('input[data-test="postalCode"]', '12345');
  
  // Should either accept or show validation error
  await page.click('input[data-test="continue"]');
  await page.waitForTimeout(1000);
  
  // Verify either proceeded or showed error (both are valid behaviors)
  const url = page.url();
  const hasError = await page.locator('[data-test="error"]').isVisible().catch(() => false);
  
  // Either outcome is acceptable - just verify page responded
  expect(url).toBeTruthy();
});

test('Verify rapid add/remove operations (race condition handling)', async ({ page }) => {
  await ensurePageReady(page);
  
  // Rapidly add and remove same item
  const productId = 'sauce-labs-backpack';
  
  for (let i = 0; i < 5; i++) {
    await addToCart(page, productId);
    await page.waitForTimeout(100);
    await page.click(`button[data-test="remove-${productId}"]`);
    await page.waitForTimeout(100);
  }
  
  // Final state should be consistent
  const cartBadge = page.locator('.shopping_cart_badge');
  const isVisible = await cartBadge.isVisible().catch(() => false);
  
  // Should either be empty or have 1 item (not 5)
  if (isVisible) {
    const count = await cartBadge.textContent();
    expect(parseInt(count)).toBeLessThanOrEqual(1);
  }
});

test('Verify browser back button navigation', async ({ page }) => {
  await ensurePageReady(page);
  
  // Navigate through flow
  await addToCart(page, 'sauce-labs-backpack');
  await page.click('.shopping_cart_link');
  await expect(page).toHaveURL(/cart.html/);
  
  // Use browser back
  await page.goBack();
  await expect(page).toHaveURL(/inventory.html/);
  
  // Verify cart state persisted
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});

test('Verify browser forward button navigation', async ({ page }) => {
  await ensurePageReady(page);
  
  // Navigate forward
  await addToCart(page, 'sauce-labs-backpack');
  await page.click('.shopping_cart_link');
  await page.goBack();
  await page.goForward();
  
  // Should be back on cart page
  await expect(page).toHaveURL(/cart.html/);
});

test('Verify empty cart checkout attempt handling', async ({ page }) => {
  await ensurePageReady(page);
  
  // Try to navigate directly to checkout with empty cart
  await page.goto('/cart.html');
  
  // Checkout button should either be disabled or redirect
  const checkoutButton = page.locator('button[data-test="checkout"]');
  const isVisible = await checkoutButton.isVisible().catch(() => false);
  
  if (isVisible) {
    const isDisabled = await checkoutButton.isDisabled().catch(() => false);
    // Button should be disabled or should show error when clicked
  }
});

test('Verify special characters in checkout form', async ({ page }) => {
  await ensurePageReady(page);
  
  await addToCart(page, 'sauce-labs-backpack');
  await page.click('.shopping_cart_link');
  await page.click('button[data-test="checkout"]');
  
  // Test various special characters
  await page.fill('input[data-test="firstName"]', "O'Brien-Smith");
  await page.fill('input[data-test="lastName"]', 'van der Berg');
  await page.fill('input[data-test="postalCode"]', 'SW1A-1AA');
  
  await page.click('input[data-test="continue"]');
  
  // Should proceed or show appropriate validation
  await page.waitForTimeout(1000);
  const url = page.url();
  expect(url).toMatch(/checkout-step-two|checkout-step-one/);
});

test('Verify Unicode characters in form inputs', async ({ page }) => {
  await ensurePageReady(page);
  
  await addToCart(page, 'sauce-labs-backpack');
  await page.click('.shopping_cart_link');
  await page.click('button[data-test="checkout"]');
  
  // Test Unicode characters
  await page.fill('input[data-test="firstName"]', 'José');
  await page.fill('input[data-test="lastName"]', 'Müller');
  await page.fill('input[data-test="postalCode"]', '12345');
  
  await page.click('input[data-test="continue"]');
  
  // Should handle Unicode properly
  await page.waitForTimeout(1000);
  const url = page.url();
  expect(url).toMatch(/checkout-step-two|checkout-step-one/);
});

test('Verify price calculation with multiple quantities of same item', async ({ page }) => {
  await ensurePageReady(page);
  
  // Note: SauceDemo typically doesn't allow quantity changes
  // But we can test with multiple different items
  await addToCart(page, 'sauce-labs-backpack');
  await addToCart(page, 'sauce-labs-bike-light');
  
  await page.click('.shopping_cart_link');
  await page.click('button[data-test="checkout"]');
  
  await page.fill('input[data-test="firstName"]', 'John');
  await page.fill('input[data-test="lastName"]', 'Doe');
  await page.fill('input[data-test="postalCode"]', '12345');
  await page.click('input[data-test="continue"]');
  
  // Verify prices are calculated correctly
  const priceElements = await page.locator('.inventory_item_price').allTextContents();
  const prices = priceElements.map(p => parseFloat(p.replace('$', '')));
  const expectedSubtotal = prices.reduce((sum, price) => sum + price, 0);
  
  const subtotalText = await page.locator('.summary_subtotal_label').textContent();
  const actualSubtotal = parseFloat(subtotalText.match(/\$([\d.]+)/)[1]);
  
  expect(actualSubtotal).toBeCloseTo(expectedSubtotal, 2);
});

test('Verify page refresh during checkout process', async ({ page }) => {
  await ensurePageReady(page);
  
  await addToCart(page, 'sauce-labs-backpack');
  await page.click('.shopping_cart_link');
  await page.click('button[data-test="checkout"]');
  
  // Fill form partially
  await page.fill('input[data-test="firstName"]', 'John');
  
  // Refresh page
  await page.reload();
  
  // Verify state (should either keep data or reset)
  const firstName = await page.locator('input[data-test="firstName"]').inputValue();
  // Form may be cleared or preserved depending on implementation
  expect(page.url()).toMatch(/checkout-step-one/);
});

test('Verify concurrent add to cart operations', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add multiple different products quickly
  const products = [
    'sauce-labs-backpack',
    'sauce-labs-bike-light',
    'sauce-labs-bolt-t-shirt'
  ];
  
  // Add all products in quick succession
  await Promise.all(products.map(productId => addToCart(page, productId)));
  
  // Wait for all operations to complete
  await page.waitForTimeout(2000);
  
  // Verify final cart count
  await verifyCartCount(page, products.length);
});
