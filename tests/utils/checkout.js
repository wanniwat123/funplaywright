const { expect } = require('@playwright/test');

/**
 * Checkout utility functions
 * Provides reusable functions for checkout flow operations
 */

/**
 * Fills checkout step one form
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} customerInfo - Customer information object
 * @param {string} customerInfo.firstName - First name
 * @param {string} customerInfo.lastName - Last name
 * @param {string} customerInfo.postalCode - Postal code
 * @returns {Promise<void>}
 */
async function fillCheckoutForm(page, { firstName, lastName, postalCode }) {
  await page.fill('input[data-test="firstName"]', firstName);
  await page.fill('input[data-test="lastName"]', lastName);
  await page.fill('input[data-test="postalCode"]', postalCode);
}

/**
 * Completes checkout step one
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} customerInfo - Customer information object
 * @returns {Promise<void>}
 */
async function completeCheckoutStepOne(page, customerInfo) {
  await fillCheckoutForm(page, customerInfo);
  await page.click('input[data-test="continue"]');
  await expect(page).toHaveURL(/checkout-step-two.html/);
}

/**
 * Completes checkout step two (finish order)
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<void>}
 */
async function completeCheckoutStepTwo(page) {
  await page.click('button[data-test="finish"]');
  await expect(page).toHaveURL(/checkout-complete.html/);
}

/**
 * Gets checkout summary totals
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<Object>} Object with subtotal, tax, and total
 */
async function getCheckoutTotals(page) {
  const subtotalText = await page.locator('.summary_subtotal_label').textContent();
  const taxText = await page.locator('.summary_tax_label').textContent();
  const totalText = await page.locator('.summary_total_label').textContent();
  
  const extractPrice = (text) => {
    const match = text.match(/\$([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };
  
  return {
    subtotal: extractPrice(subtotalText),
    tax: extractPrice(taxText),
    total: extractPrice(totalText)
  };
}

/**
 * Verifies checkout totals are calculated correctly
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<boolean>} True if totals are correct
 */
async function verifyCheckoutTotals(page) {
  const totals = await getCheckoutTotals(page);
  const expectedTotal = totals.subtotal + totals.tax;
  return Math.abs(totals.total - expectedTotal) < 0.01; // Allow for floating point precision
}

module.exports = {
  fillCheckoutForm,
  completeCheckoutStepOne,
  completeCheckoutStepTwo,
  getCheckoutTotals,
  verifyCheckoutTotals
};
