const { test, expect } = require('@playwright/test');
const { login } = require('./utils/auth');

/**
 * Error Handling Test Suite
 * Tests various error scenarios including invalid credentials, locked accounts, and performance issues
 * 
 * Edge Cases Covered:
 * - Invalid username/password combinations
 * - Locked out user account
 * - Performance glitch user (slow responses)
 * - Empty form submissions
 * - SQL injection attempts (security)
 * - XSS attempts (security)
 * 
 * Note: These tests do NOT use storage state as they test authentication failures
 */

test.describe('Login Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test - no storage state
    await page.goto('https://www.saucedemo.com/');
  });

  test('Verify error message for invalid username', async ({ page }) => {
    await page.fill('#user-name', 'invalid_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    
    // Verify error message appears
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Username and password do not match');
  });

  test('Verify error message for invalid password', async ({ page }) => {
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'wrong_password');
    await page.click('#login-button');
    
    // Verify error message appears
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Username and password do not match');
  });

  test('Verify error message for locked out user', async ({ page }) => {
    await login(page, 'locked_out_user', 'secret_sauce');
    
    // Verify error message for locked account
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Sorry, this user has been locked out');
    
    // Verify user is still on login page
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('Verify error message for empty username', async ({ page }) => {
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    
    // Verify error message appears
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Username is required');
  });

  test('Verify error message for empty password', async ({ page }) => {
    await page.fill('#user-name', 'standard_user');
    await page.click('#login-button');
    
    // Verify error message appears
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Password is required');
  });

  test('Verify error message for empty form submission', async ({ page }) => {
    await page.click('#login-button');
    
    // Verify error message appears
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
  });

  test('Verify error message can be dismissed', async ({ page }) => {
    await page.fill('#user-name', 'invalid_user');
    await page.fill('#password', 'wrong_password');
    await page.click('#login-button');
    
    // Verify error message appears
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    
    // Click error button to dismiss
    await page.click('button.error-button');
    
    // Verify error message is hidden
    await expect(errorMessage).not.toBeVisible();
  });

  test('Verify SQL injection attempt is handled securely', async ({ page }) => {
    // Attempt SQL injection in username field
    await page.fill('#user-name', "admin' OR '1'='1");
    await page.fill('#password', "admin' OR '1'='1");
    await page.click('#login-button');
    
    // Should show error, not allow access
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('Verify XSS attempt is handled securely', async ({ page }) => {
    // Attempt XSS in username field
    await page.fill('#user-name', '<script>alert("XSS")</script>');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    
    // Should show error, not execute script
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('Verify performance glitch user can still login (with delay)', async ({ page }) => {
    // Performance glitch user should work but be slow
    await login(page, 'performance_glitch_user', 'secret_sauce');
    
    // Wait longer for slow response
    await page.waitForURL('**/inventory.html', { timeout: 30000 });
    
    // Verify successful login despite performance issues
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('Verify case sensitivity of credentials', async ({ page }) => {
    // Test case sensitivity
    await page.fill('#user-name', 'STANDARD_USER');
    await page.fill('#password', 'SECRET_SAUCE');
    await page.click('#login-button');
    
    // Should fail due to case sensitivity
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
  });

  test('Verify special characters in credentials are handled', async ({ page }) => {
    // Test special characters
    await page.fill('#user-name', 'user@#$%');
    await page.fill('#password', 'pass!@#$');
    await page.click('#login-button');
    
    // Should show error
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
  });
});
