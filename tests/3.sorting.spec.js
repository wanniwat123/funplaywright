const { test, expect } = require('@playwright/test');
const { login } = require('./utils/auth');
const {
  selectSortOption,
  getProductNames,
  getProductPrices,
  verifyAlphabeticalOrder,
  verifyPriceOrder
} = require('./utils/sorting');

// Login before each test
test.beforeEach(async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  // Wait for page to be fully loaded before proceeding
  await page.waitForLoadState('networkidle');
  // Ensure products are visible
  await page.locator('.inventory_item').first().waitFor({ state: 'visible' });
});

test('Verify sorting by Name (A to Z)', async ({ page }) => {
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
  
  await page.waitForTimeout(1000);
});

test('Verify sorting by Name (Z to A)', async ({ page }) => {
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
  
  await page.waitForTimeout(1000);
});

test('Verify sorting by Price (low to high)', async ({ page }) => {
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
  
  await page.waitForTimeout(1000);
});

test('Verify sorting by Price (high to low)', async ({ page }) => {
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
  
  await page.waitForTimeout(1000);
});
