const { expect } = require('@playwright/test');

// Cart utility functions
async function addToCart(page, productId) {
  await page.click(`button[data-test="add-to-cart-${productId}"]`);
  await page.waitForTimeout(1000);
}

// Helper function to verify cart count
async function verifyCartCount(page, expectedCount) {
  await expect(page.locator('.shopping_cart_badge')).toHaveText(expectedCount.toString());
  await page.waitForTimeout(1000);
}

module.exports = { addToCart, verifyCartCount };
