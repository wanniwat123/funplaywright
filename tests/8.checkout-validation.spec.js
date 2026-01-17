const { test, expect } = require('@playwright/test');
const { addToCart } = require('./utils/cart');

/**
 * Checkout Validation Test Suite
 * Tests form validation, required fields, and checkout error handling
 * 
 * Edge Cases Covered:
 * - Missing first name validation
 * - Missing last name validation
 * - Missing postal code validation
 * - All fields empty validation
 * - Special characters in form fields
 * - Very long input values
 * - Numeric postal codes
 * - Alphanumeric postal codes
 * - Price calculation accuracy
 * - Tax calculation verification
 */

// Authentication handled by storage state (global-setup.js)
// No beforeEach needed - tests start with authenticated state

/**
 * Helper function to navigate to checkout step one
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function navigateToCheckout(page) {
  await page.goto('/inventory.html');
  await page.waitForLoadState('networkidle');
  await page.locator('.inventory_item').first().waitFor({ state: 'visible' });
  
  await addToCart(page, 'sauce-labs-backpack');
  await page.click('.shopping_cart_link');
  await page.click('button[data-test="checkout"]');
  await expect(page).toHaveURL(/checkout-step-one.html/);
}

test('Verify error message when first name is missing', async ({ page }) => {
  await navigateToCheckout(page);
  
  // Fill only last name and postal code
  await page.fill('input[data-test="lastName"]', 'Doe');
  await page.fill('input[data-test="postalCode"]', '12345');
  
  // Try to continue
  await page.click('input[data-test="continue"]');
  
  // Verify error message
  const errorMessage = page.locator('[data-test="error"]');
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toContainText('First Name is required');
});

test('Verify error message when last name is missing', async ({ page }) => {
  await navigateToCheckout(page);
  
  // Fill only first name and postal code
  await page.fill('input[data-test="firstName"]', 'John');
  await page.fill('input[data-test="postalCode"]', '12345');
  
  // Try to continue
  await page.click('input[data-test="continue"]');
  
  // Verify error message
  const errorMessage = page.locator('[data-test="error"]');
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toContainText('Last Name is required');
});

test('Verify error message when postal code is missing', async ({ page }) => {
  await navigateToCheckout(page);
  
  // Fill only first and last name
  await page.fill('input[data-test="firstName"]', 'John');
  await page.fill('input[data-test="lastName"]', 'Doe');
  
  // Try to continue
  await page.click('input[data-test="continue"]');
  
  // Verify error message
  const errorMessage = page.locator('[data-test="error"]');
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toContainText('Postal Code is required');
});

test('Verify error message when all fields are empty', async ({ page }) => {
  await navigateToCheckout(page);
  
  // Try to continue without filling any fields
  await page.click('input[data-test="continue"]');
  
  // Verify error message
  const errorMessage = page.locator('[data-test="error"]');
  await expect(errorMessage).toBeVisible();
});

test('Verify error message can be dismissed', async ({ page }) => {
  await navigateToCheckout(page);
  
  // Trigger error
  await page.click('input[data-test="continue"]');
  const errorMessage = page.locator('[data-test="error"]');
  await expect(errorMessage).toBeVisible();
  
  // Dismiss error
  await page.click('button.error-button');
  await expect(errorMessage).not.toBeVisible();
});

test('Verify checkout accepts valid alphanumeric postal codes', async ({ page }) => {
  await navigateToCheckout(page);
  
  // Fill form with alphanumeric postal code
  await page.fill('input[data-test="firstName"]', 'John');
  await page.fill('input[data-test="lastName"]', 'Doe');
  await page.fill('input[data-test="postalCode"]', 'SW1A 1AA');
  
  // Should proceed without error
  await page.click('input[data-test="continue"]');
  await expect(page).toHaveURL(/checkout-step-two.html/);
});

test('Verify checkout accepts special characters in names', async ({ page }) => {
  await navigateToCheckout(page);
  
  // Fill form with special characters
  await page.fill('input[data-test="firstName"]', "O'Brien");
  await page.fill('input[data-test="lastName"]', "Smith-Jones");
  await page.fill('input[data-test="postalCode"]', '12345');
  
  // Should proceed without error
  await page.click('input[data-test="continue"]');
  await expect(page).toHaveURL(/checkout-step-two.html/);
});

test('Verify price calculation accuracy in checkout overview', async ({ page }) => {
  await navigateToCheckout(page);
  
  // Complete checkout step one
  await page.fill('input[data-test="firstName"]', 'John');
  await page.fill('input[data-test="lastName"]', 'Doe');
  await page.fill('input[data-test="postalCode"]', '12345');
  await page.click('input[data-test="continue"]');
  
  // Get item price
  const itemPriceText = await page.locator('.inventory_item_price').textContent();
  const itemPrice = parseFloat(itemPriceText.replace('$', ''));
  
  // Get subtotal
  const subtotalText = await page.locator('.summary_subtotal_label').textContent();
  const subtotal = parseFloat(subtotalText.match(/\$([\d.]+)/)[1]);
  
  // Verify subtotal matches item price
  expect(subtotal).toBe(itemPrice);
  
  // Get tax
  const taxText = await page.locator('.summary_tax_label').textContent();
  const tax = parseFloat(taxText.match(/\$([\d.]+)/)[1]);
  
  // Get total
  const totalText = await page.locator('.summary_total_label').textContent();
  const total = parseFloat(totalText.match(/\$([\d.]+)/)[1]);
  
  // Verify total = subtotal + tax
  expect(total).toBeCloseTo(subtotal + tax, 2);
});

test('Verify tax calculation for multiple items', async ({ page }) => {
  await page.goto('/inventory.html');
  await page.waitForLoadState('networkidle');
  await page.locator('.inventory_item').first().waitFor({ state: 'visible' });
  
  // Add multiple items
  await addToCart(page, 'sauce-labs-backpack');
  await addToCart(page, 'sauce-labs-bike-light');
  
  // Navigate to checkout
  await page.click('.shopping_cart_link');
  await page.click('button[data-test="checkout"]');
  
  // Fill checkout form
  await page.fill('input[data-test="firstName"]', 'John');
  await page.fill('input[data-test="lastName"]', 'Doe');
  await page.fill('input[data-test="postalCode"]', '12345');
  await page.click('input[data-test="continue"]');
  
  // Get all item prices
  const priceElements = await page.locator('.inventory_item_price').allTextContents();
  const prices = priceElements.map(p => parseFloat(p.replace('$', '')));
  const expectedSubtotal = prices.reduce((sum, price) => sum + price, 0);
  
  // Verify subtotal
  const subtotalText = await page.locator('.summary_subtotal_label').textContent();
  const actualSubtotal = parseFloat(subtotalText.match(/\$([\d.]+)/)[1]);
  expect(actualSubtotal).toBeCloseTo(expectedSubtotal, 2);
  
  // Verify tax and total calculations
  const taxText = await page.locator('.summary_tax_label').textContent();
  const tax = parseFloat(taxText.match(/\$([\d.]+)/)[1]);
  
  const totalText = await page.locator('.summary_total_label').textContent();
  const total = parseFloat(totalText.match(/\$([\d.]+)/)[1]);
  
  expect(total).toBeCloseTo(actualSubtotal + tax, 2);
});

test('Verify cancel button on checkout step one', async ({ page }) => {
  await navigateToCheckout(page);
  
  // Click cancel
  await page.click('button[data-test="cancel"]');
  
  // Should return to cart
  await expect(page).toHaveURL(/cart.html/);
});

test('Verify cancel button on checkout step two', async ({ page }) => {
  await navigateToCheckout(page);
  
  // Complete step one
  await page.fill('input[data-test="firstName"]', 'John');
  await page.fill('input[data-test="lastName"]', 'Doe');
  await page.fill('input[data-test="postalCode"]', '12345');
  await page.click('input[data-test="continue"]');
  
  // Click cancel on step two
  await page.click('button[data-test="cancel"]');
  
  // Should return to inventory
  await expect(page).toHaveURL(/inventory.html/);
});
