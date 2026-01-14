// Authentication utility functions
async function login(page, username = 'standard_user', password = 'secret_sauce') {
  await page.goto('https://www.saucedemo.com/');
  await page.waitForTimeout(1000);
  
  await page.fill('#user-name', username);
  await page.waitForTimeout(500);
  
  await page.fill('#password', password);
  await page.waitForTimeout(500);
  
  await page.click('#login-button');
  await page.waitForTimeout(2000);
}

module.exports = { login };
