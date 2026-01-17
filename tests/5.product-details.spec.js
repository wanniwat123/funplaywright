const { test, expect } = require('@playwright/test');
const { addToCart } = require('./utils/cart');

/**
 * Product Details Test Suite
 * Tests product information display, images, descriptions, and detail page navigation
 * 
 * Edge Cases Covered:
 * - Product image loading and alt text
 * - Product description accuracy
 * - Price display consistency
 * - Navigation to/from product details
 * - Add to cart from detail page
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

test('Verify product details page displays all required information', async ({ page }) => {
  await ensurePageReady(page);
  
  // Click on first product to view details
  await page.locator('.inventory_item_name').first().click();
  await expect(page).toHaveURL(/.*inventory-item\.html/);
  
  // Verify product name is displayed
  await expect(page.locator('.inventory_details_name')).toBeVisible();
  
  // Verify product description is displayed
  await expect(page.locator('.inventory_details_desc')).toBeVisible();
  
  // Verify product price is displayed
  await expect(page.locator('.inventory_details_price')).toBeVisible();
  
  // Verify product image is displayed
  const productImage = page.locator('.inventory_details_img');
  await expect(productImage).toBeVisible();
  
  // Verify image has alt text (accessibility)
  const altText = await productImage.getAttribute('alt');
  expect(altText).toBeTruthy();
});

test('Verify product image loads correctly', async ({ page }) => {
  await ensurePageReady(page);
  
  // Get first product image from inventory
  const firstProductImage = page.locator('.inventory_item_img').first();
  await expect(firstProductImage).toBeVisible();
  
  // Verify image source is valid
  const imageSrc = await firstProductImage.getAttribute('src');
  expect(imageSrc).toBeTruthy();
  expect(imageSrc).toContain('.jpg');
  
  // Verify image has proper dimensions
  const boundingBox = await firstProductImage.boundingBox();
  expect(boundingBox).toBeTruthy();
  expect(boundingBox.width).toBeGreaterThan(0);
  expect(boundingBox.height).toBeGreaterThan(0);
});

test('Verify product details match inventory listing', async ({ page }) => {
  await ensurePageReady(page);
  
  // Get product info from inventory page
  const productName = await page.locator('.inventory_item_name').first().textContent();
  const productPrice = await page.locator('.inventory_item_price').first().textContent();
  const productDescription = await page.locator('.inventory_item_desc').first().textContent();
  
  // Navigate to product details
  await page.locator('.inventory_item_name').first().click();
  await expect(page).toHaveURL(/.*inventory-item\.html/);
  
  // Verify details match
  await expect(page.locator('.inventory_details_name')).toHaveText(productName.trim());
  await expect(page.locator('.inventory_details_price')).toHaveText(productPrice.trim());
  await expect(page.locator('.inventory_details_desc')).toContainText(productDescription.trim());
});

test('Verify add to cart from product details page', async ({ page }) => {
  await ensurePageReady(page);
  
  // Navigate to product details
  await page.locator('.inventory_item_name').first().click();
  await expect(page).toHaveURL(/.*inventory-item\.html/);
  
  // Get product ID from URL or button
  const url = page.url();
  const productIdMatch = url.match(/id=(\d+)/);
  const productId = productIdMatch ? productIdMatch[1] : 'sauce-labs-backpack';
  
  // Add to cart from details page
  await page.click('button[data-test*="add-to-cart"]');
  
  // Verify button changes to "Remove"
  await expect(page.locator('button[data-test*="remove"]')).toBeVisible();
  
  // Verify cart badge appears
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});

test('Verify back button navigation from product details', async ({ page }) => {
  await ensurePageReady(page);
  
  // Navigate to product details
  await page.locator('.inventory_item_name').first().click();
  await expect(page).toHaveURL(/.*inventory-item\.html/);
  
  // Click back button
  await page.click('button[data-test="back-to-products"]');
  
  // Verify navigation back to inventory
  await expect(page).toHaveURL(/.*inventory\.html/);
  await expect(page.locator('.title')).toHaveText('Products');
});

test('Verify all products have valid details pages', async ({ page }) => {
  await ensurePageReady(page);
  
  // Get all product names
  const productNames = await page.locator('.inventory_item_name').allTextContents();
  
  // Verify each product can be clicked and has a details page
  for (let i = 0; i < productNames.length; i++) {
    await ensurePageReady(page);
    
    const productName = productNames[i];
    const productLink = page.locator('.inventory_item_name').nth(i);
    
    await productLink.click();
    await expect(page).toHaveURL(/.*inventory-item\.html/);
    
    // Verify product name matches
    await expect(page.locator('.inventory_details_name')).toContainText(productName.trim());
    
    // Navigate back
    await page.click('button[data-test="back-to-products"]');
  }
});

test('Verify product price format consistency', async ({ page }) => {
  await ensurePageReady(page);
  
  // Get all prices from inventory
  const prices = await page.locator('.inventory_item_price').allTextContents();
  
  // Verify all prices follow $XX.XX format
  const priceRegex = /^\$[\d]+\.[\d]{2}$/;
  prices.forEach(price => {
    expect(price.trim()).toMatch(priceRegex);
  });
  
  // Navigate to first product details and verify price format
  await page.locator('.inventory_item_name').first().click();
  const detailPrice = await page.locator('.inventory_details_price').textContent();
  expect(detailPrice.trim()).toMatch(priceRegex);
});
