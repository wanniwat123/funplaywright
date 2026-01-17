const { expect } = require('@playwright/test');

/**
 * Cart utility functions
 * Provides reusable functions for cart operations
 */

/**
 * Adds a product to the cart
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} productId - Product ID (e.g., 'sauce-labs-backpack')
 * @returns {Promise<void>}
 */
async function addToCart(page, productId) {
  await page.click(`button[data-test="add-to-cart-${productId}"]`);
  await page.waitForTimeout(1000);
}

/**
 * Removes a product from the cart
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} productId - Product ID (e.g., 'sauce-labs-backpack')
 * @returns {Promise<void>}
 */
async function removeFromCart(page, productId) {
  await page.click(`button[data-test="remove-${productId}"]`);
  await page.waitForTimeout(1000);
}

/**
 * Verifies the cart badge shows the expected count
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} expectedCount - Expected number of items in cart
 * @returns {Promise<void>}
 */
async function verifyCartCount(page, expectedCount) {
  if (expectedCount === 0) {
    // Cart badge should not be visible when cart is empty
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  } else {
    await expect(page.locator('.shopping_cart_badge')).toHaveText(expectedCount.toString());
  }
  await page.waitForTimeout(1000);
}

/**
 * Verifies cart is empty (no badge visible)
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<void>}
 */
async function verifyCartEmpty(page) {
  await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
}

module.exports = { 
  addToCart, 
  removeFromCart,
  verifyCartCount,
  verifyCartEmpty
};
