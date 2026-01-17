const { test, expect } = require('@playwright/test');
const { addToCart, removeFromCart, verifyCartCount } = require('./utils/cart');

/**
 * Cart Removal Test Suite
 * Tests removing items from cart, empty cart scenarios, and cart state management
 * 
 * Edge Cases Covered:
 * - Remove single item from cart
 * - Remove multiple items from cart
 * - Remove all items (empty cart)
 * - Remove item from cart page
 * - Remove item from inventory page after adding
 * - Cart persistence across navigation
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


test('Verify removing single item from cart on inventory page', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add item to cart
  await addToCart(page, 'sauce-labs-backpack');
  await verifyCartCount(page, 1);
  
  // Remove item from cart
  await removeFromCart(page, 'sauce-labs-backpack');
  
  // Verify cart badge is not visible (empty cart)
  await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  
  // Verify button changed back to "Add to cart"
  await expect(page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible();
});

test('Verify removing item from cart page', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add multiple items
  await addToCart(page, 'sauce-labs-backpack');
  await addToCart(page, 'sauce-labs-bike-light');
  await verifyCartCount(page, 2);
  
  // Navigate to cart
  await page.click('.shopping_cart_link');
  await expect(page).toHaveURL(/cart.html/);
  
  // Remove one item
  await removeFromCart(page, 'sauce-labs-backpack');
  
  // Verify cart count updated
  await verifyCartCount(page, 1);
  
  // Verify remaining item is still in cart
  await expect(page.locator('.inventory_item_name')).toContainText('Bike Light');
  
  // Verify removed item is not in cart
  await expect(page.locator('.inventory_item_name')).not.toContainText('Backpack');
});

test('Verify removing all items results in empty cart', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add multiple items
  await addToCart(page, 'sauce-labs-backpack');
  await addToCart(page, 'sauce-labs-bike-light');
  await addToCart(page, 'sauce-labs-bolt-t-shirt');
  await verifyCartCount(page, 3);
  
  // Navigate to cart
  await page.click('.shopping_cart_link');
  await expect(page).toHaveURL(/cart.html/);
  
  // Remove all items
  await removeFromCart(page, 'sauce-labs-backpack');
  await removeFromCart(page, 'sauce-labs-bike-light');
  await removeFromCart(page, 'sauce-labs-bolt-t-shirt');
  
  // Verify cart is empty
  await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  
  // Verify empty cart message or continue shopping button
  const continueShoppingButton = page.locator('button[data-test="continue-shopping"]');
  await expect(continueShoppingButton).toBeVisible();
});

test('Verify cart state persists after removing and re-adding item', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add item
  await addToCart(page, 'sauce-labs-backpack');
  await verifyCartCount(page, 1);
  
  // Remove item
  await removeFromCart(page, 'sauce-labs-backpack');
  await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  
  // Re-add same item
  await addToCart(page, 'sauce-labs-backpack');
  await verifyCartCount(page, 1);
});

test('Verify removing item updates button state on inventory page', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add item
  await addToCart(page, 'sauce-labs-backpack');
  
  // Verify button changed to "Remove"
  await expect(page.locator('button[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
  await expect(page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]')).not.toBeVisible();
  
  // Remove item
  await removeFromCart(page, 'sauce-labs-backpack');
  
  // Verify button changed back to "Add to cart"
  await expect(page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible();
  await expect(page.locator('button[data-test="remove-sauce-labs-backpack"]')).not.toBeVisible();
});

test('Verify continue shopping button works from empty cart', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add and remove item to get empty cart
  await addToCart(page, 'sauce-labs-backpack');
  await page.click('.shopping_cart_link');
  await removeFromCart(page, 'sauce-labs-backpack');
  
  // Click continue shopping
  await page.click('button[data-test="continue-shopping"]');
  
  // Verify navigation back to inventory
  await expect(page).toHaveURL(/inventory.html/);
  await expect(page.locator('.title')).toHaveText('Products');
});

test('Verify removing item from detail page updates cart', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add item
  await addToCart(page, 'sauce-labs-backpack');
  await verifyCartCount(page, 1);
  
  // Navigate to product details
  await page.locator('.inventory_item_name').first().click();
  
  // Remove from detail page
  await page.click('button[data-test*="remove"]');
  
  // Verify cart updated
  await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  
  // Verify button changed to "Add to cart"
  await expect(page.locator('button[data-test*="add-to-cart"]')).toBeVisible();
});

test('Verify cart count accuracy when removing multiple items', async ({ page }) => {
  await ensurePageReady(page);
  
  // Add 5 different items
  const products = [
    'sauce-labs-backpack',
    'sauce-labs-bike-light',
    'sauce-labs-bolt-t-shirt',
    'sauce-labs-fleece-jacket',
    'sauce-labs-onesie'
  ];
  
  for (const product of products) {
    await addToCart(page, product);
  }
  await verifyCartCount(page, 5);
  
  // Remove items one by one and verify count
  for (let i = products.length - 1; i >= 0; i--) {
    await removeFromCart(page, products[i]);
    if (i > 0) {
      await verifyCartCount(page, i);
    } else {
      await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
    }
  }
});
