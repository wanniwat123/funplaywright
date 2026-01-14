const { test, expect } = require('@playwright/test');
const {
  selectSortOption,
  getProductNames,
  getProductPrices,
  verifyAlphabeticalOrder,
  verifyPriceOrder
} = require('./utils/sorting');

// Authentication handled by storage state (global-setup.js)
// No beforeEach needed - tests start with authenticated state

/**
 * Helper function to ensure page is ready for testing
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function ensurePageReady(page) {
  await page.goto('/inventory.html');
  await page.waitForLoadState('networkidle');
  await page.locator('.inventory_item').first().waitFor({ state: 'visible' });
}

test('Verify sorting by Name (A to Z)', async ({ page }) => {
  await ensurePageReady(page);
  
  // Arrange: Select A-Z sort option
  await selectSortOption(page, 'az');
  
  // Act: Extract product names from UI
  const productNames = await getProductNames(page);
  
  // Assert: Verify names are in alphabetical order (A-Z)
  expect(productNames.length).toBeGreaterThan(0);
  const isSorted = verifyAlphabeticalOrder(productNames, true);
  expect(isSorted).toBe(true);
  if (!isSorted) {
    console.log('Expected A-Z order, but got:', productNames);
  }
});

test('Verify sorting by Name (Z to A)', async ({ page }) => {
  await ensurePageReady(page);
  
  // Arrange: Select Z-A sort option
  await selectSortOption(page, 'za');
  
  // Act: Extract product names from UI
  const productNames = await getProductNames(page);
  
  // Assert: Verify names are in reverse alphabetical order (Z-A)
  expect(productNames.length).toBeGreaterThan(0);
  const isSorted = verifyAlphabeticalOrder(productNames, false);
  expect(isSorted).toBe(true);
  if (!isSorted) {
    console.log('Expected Z-A order, but got:', productNames);
  }
});

test('Verify sorting by Price (low to high)', async ({ page }) => {
  await ensurePageReady(page);
  
  // Arrange: Select low to high price sort option
  await selectSortOption(page, 'lohi');
  
  // Act: Extract product prices from UI
  const productPrices = await getProductPrices(page);
  
  // Assert: Verify prices are in ascending order
  expect(productPrices.length).toBeGreaterThan(0);
  const isSorted = verifyPriceOrder(productPrices, true);
  expect(isSorted).toBe(true);
  if (!isSorted) {
    console.log('Expected low-to-high order, but got:', productPrices);
  }
});

test('Verify sorting by Price (high to low)', async ({ page }) => {
  await ensurePageReady(page);
  
  // Arrange: Select high to low price sort option
  await selectSortOption(page, 'hilo');
  
  // Act: Extract product prices from UI
  const productPrices = await getProductPrices(page);
  
  // Assert: Verify prices are in descending order
  expect(productPrices.length).toBeGreaterThan(0);
  const isSorted = verifyPriceOrder(productPrices, false);
  expect(isSorted).toBe(true);
  if (!isSorted) {
    console.log('Expected high-to-low order, but got:', productPrices);
  }
});
