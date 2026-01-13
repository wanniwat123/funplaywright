# Playwright Automation Tests

Simple Playwright test automation for SauceDemo.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

Run tests:
```bash
npm test
```

Run tests in headed mode (see browser):
```bash
npm run test:headed
```

## Test Case

The test performs the following:
1. Opens https://www.saucedemo.com/
2. Enters username: `standard_user`
3. Enters password: `secret_sauce`
4. Clicks Login button
5. Verifies navigation to inventory page
6. Verifies "Products" text is displayed
