const { expect } = require('@playwright/test');

/**
 * Selects a sorting option from the dropdown
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} option - Sort option value ('az', 'za', 'lohi', 'hilo')
 * @returns {Promise<void>}
 */
async function selectSortOption(page, option) {
  // Ensure we're on the inventory page
  await expect(page).toHaveURL(/.*inventory\.html/);
  
  // Wait for the Products title to ensure page is loaded
  await page.locator('.title').waitFor({ state: 'visible', timeout: 10000 });
  
  // Wait for at least one product to be visible (ensures page is ready)
  await page.locator('.inventory_item').first().waitFor({ state: 'visible', timeout: 10000 });
  
  // Find the sort dropdown - try multiple selector strategies
  let sortDropdown = page.locator('[data-test="product_sort_container"]');
  
  // If not found, try select element
  const count = await sortDropdown.count();
  if (count === 0) {
    sortDropdown = page.locator('select.product_sort_container');
  }
  
  // Wait for dropdown to be visible and attached
  await sortDropdown.waitFor({ state: 'attached', timeout: 10000 });
  await sortDropdown.waitFor({ state: 'visible', timeout: 10000 });
  
  // Select the option
  await sortDropdown.selectOption(option);
  
  // Wait for products to re-render after sort
  await page.waitForTimeout(1500);
}

/**
 * Extracts all product names from the inventory page
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<string[]>} Array of product names
 */
async function getProductNames(page) {
  // Ensure we're on the inventory page
  await expect(page).toHaveURL(/.*inventory\.html/);
  
  const nameLocator = page.locator('.inventory_item_name');
  await nameLocator.first().waitFor({ state: 'visible', timeout: 10000 });
  const productNames = await nameLocator.allTextContents();
  return productNames.map(name => name.trim());
}

/**
 * Extracts all product prices from the inventory page
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<number[]>} Array of product prices as numbers
 */
async function getProductPrices(page) {
  // Ensure we're on the inventory page
  await expect(page).toHaveURL(/.*inventory\.html/);
  
  const priceLocator = page.locator('.inventory_item_price');
  await priceLocator.first().waitFor({ state: 'visible', timeout: 10000 });
  const priceElements = await priceLocator.allTextContents();
  // Extract numeric value from "$29.99" format
  return priceElements.map(price => parseFloat(price.trim().replace('$', '')));
}

/**
 * Verifies that an array of strings is in alphabetical order
 * @param {string[]} items - Array of strings to verify
 * @param {boolean} ascending - true for A-Z, false for Z-A
 * @returns {boolean} True if items are in correct order
 */
function verifyAlphabeticalOrder(items, ascending = true) {
  const sorted = [...items].sort((a, b) => {
    const comparison = a.localeCompare(b, undefined, { sensitivity: 'base' });
    return ascending ? comparison : -comparison;
  });
  
  return JSON.stringify(items) === JSON.stringify(sorted);
}

/**
 * Verifies that an array of numbers is in numerical order
 * @param {number[]} prices - Array of numbers to verify
 * @param {boolean} ascending - true for low to high, false for high to low
 * @returns {boolean} True if prices are in correct order
 */
function verifyPriceOrder(prices, ascending = true) {
  const sorted = [...prices].sort((a, b) => ascending ? a - b : b - a);
  return JSON.stringify(prices) === JSON.stringify(sorted);
}

module.exports = {
  selectSortOption,
  getProductNames,
  getProductPrices,
  verifyAlphabeticalOrder,
  verifyPriceOrder
};
