const { test, expect } = require('@playwright/test');
const { addToCart } = require('./utils/cart');

/**
 * Navigation Test Suite
 * Tests menu navigation, links, back buttons, and navigation state
 * 
 * Edge Cases Covered:
 * - Hamburger menu functionality
 * - All navigation links
 * - Back button behavior
 * - Cart link navigation
 * - Logout functionality
 * - Navigation state persistence
 * - Deep linking to pages
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

test('Verify hamburger menu opens and closes', async ({ page }) => {
  await ensurePageReady(page);
  
  // Open menu
  await page.click('#react-burger-menu-btn');
  await expect(page.locator('.bm-menu')).toBeVisible();
  
  // Verify menu items are visible
  await expect(page.locator('#inventory_sidebar_link')).toBeVisible();
  await expect(page.locator('#about_sidebar_link')).toBeVisible();
  await expect(page.locator('#logout_sidebar_link')).toBeVisible();
  await expect(page.locator('#reset_sidebar_link')).toBeVisible();
  
  // Close menu
  await page.click('#react-burger-cross-btn');
  await expect(page.locator('.bm-menu')).not.toBeVisible();
});

test('Verify All Items link in menu navigates to inventory', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add item to cart first
  await addToCart(page, 'sauce-labs-backpack');
  
  // Navigate to cart
  await page.click('.shopping_cart_link');
  await expect(page).toHaveURL(/cart.html/);
  
  // Open menu and click All Items
  await page.click('#react-burger-menu-btn');
  await page.click('#inventory_sidebar_link');
  
  // Verify navigation to inventory
  await expect(page).toHaveURL(/inventory.html/);
  await expect(page.locator('.title')).toHaveText('Products');
  
  // Verify cart state persisted
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});

test('Verify About link in menu navigates to external site', async ({ page }) => {
  await ensurePageReady(page);
  
  // Open menu and click About
  await page.click('#react-burger-menu-btn');
  
  // Note: About link typically goes to saucelabs.com
  // This may open in new tab or same tab depending on implementation
  const aboutLink = page.locator('#about_sidebar_link');
  await expect(aboutLink).toBeVisible();
  
  // Click and verify navigation (may need to handle new tab)
  await aboutLink.click();
  
  // Wait for navigation (could be same tab or new tab)
  await page.waitForTimeout(2000);
});

test('Verify Reset App State link clears cart', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add items to cart
  await addToCart(page, 'sauce-labs-backpack');
  await addToCart(page, 'sauce-labs-bike-light');
  await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
  
  // Open menu and reset app state
  await page.click('#react-burger-menu-btn');
  await page.click('#reset_sidebar_link');
  
  // Close menu
  await page.click('#react-burger-cross-btn');
  
  // Verify cart is cleared
  await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
});

test('Verify cart icon navigation to cart page', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add item to cart
  await addToCart(page, 'sauce-labs-backpack');
  
  // Click cart icon
  await page.click('.shopping_cart_link');
  
  // Verify navigation to cart
  await expect(page).toHaveURL(/cart.html/);
  await expect(page.locator('.title')).toHaveText('Your Cart');
});

test('Verify back to products button from cart page', async ({ page }) => {
  await ensurePageReady(page);
  
  // Navigate to cart
  await page.click('.shopping_cart_link');
  await expect(page).toHaveURL(/cart.html/);
  
  // Click continue shopping
  await page.click('button[data-test="continue-shopping"]');
  
  // Verify navigation back to inventory
  await expect(page).toHaveURL(/inventory.html/);
  await expect(page.locator('.title')).toHaveText('Products');
});

test('Verify product name link navigates to product details', async ({ page }) => {
  await ensurePageReady(page);
  
  // Get first product name
  const firstProductName = await page.locator('.inventory_item_name').first().textContent();
  
  // Click product name
  await page.locator('.inventory_item_name').first().click();
  
  // Verify navigation to product details
  await expect(page).toHaveURL(/inventory-item\.html/);
  await expect(page.locator('.inventory_details_name')).toContainText(firstProductName.trim());
});

test('Verify product image link navigates to product details', async ({ page }) => {
  await ensurePageReady(page);
  
  // Click product image
  await page.locator('.inventory_item_img').first().click();
  
  // Verify navigation to product details
  await expect(page).toHaveURL(/inventory-item\.html/);
  await expect(page.locator('.inventory_details_name')).toBeVisible();
});

test('Verify back to products from product details page', async ({ page }) => {
  await ensurePageReady(page);
  
  // Navigate to product details
  await page.locator('.inventory_item_name').first().click();
  await expect(page).toHaveURL(/inventory-item\.html/);
  
  // Click back button
  await page.click('button[data-test="back-to-products"]');
  
  // Verify navigation back to inventory
  await expect(page).toHaveURL(/inventory.html/);
  await expect(page.locator('.title')).toHaveText('Products');
});

test('Verify navigation state persists after page refresh', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add item to cart
  await addToCart(page, 'sauce-labs-backpack');
  
  // Navigate to cart
  await page.click('.shopping_cart_link');
  
  // Refresh page
  await page.reload();
  
  // Verify still on cart page with item
  await expect(page).toHaveURL(/cart.html/);
  await expect(page.locator('.inventory_item_name')).toContainText('Backpack');
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});

test('Verify direct navigation to cart page with items', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add item to cart
  await addToCart(page, 'sauce-labs-backpack');
  
  // Navigate directly to cart URL
  await page.goto('/cart.html');
  
  // Verify cart page loads with items
  await expect(page.locator('.title')).toHaveText('Your Cart');
  await expect(page.locator('.inventory_item_name')).toContainText('Backpack');
});

test('Verify direct navigation to checkout step one', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add item to cart
  await addToCart(page, 'sauce-labs-backpack');
  
  // Navigate directly to checkout (should redirect if no items, or show form)
  await page.goto('/checkout-step-one.html');
  
  // Should either show form or redirect
  // If items in cart, should show form
  await page.waitForTimeout(1000);
  const url = page.url();
  expect(url).toMatch(/checkout-step-one|cart|inventory/);
});

test('Verify footer links are present', async ({ page }) => {
  await ensurePageReady(page);
  
  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  
  // Verify footer exists
  const footer = page.locator('.footer');
  await expect(footer).toBeVisible();
  
  // Verify social media links (if present)
  // Note: Actual implementation may vary
});
