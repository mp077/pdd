# DentPulse AI - Complete E2E Testing Suite

This repository contains the complete End-to-End (E2E) testing framework for DentPulse AI, covering both the React Native Web interface and the React Native Mobile app.

## Folder Structure

```
├── selenium-tests/          # Web UI Testing (Selenium + Mocha)
│   ├── package.json
│   ├── pages/               # Page Object Models
│   ├── tests/               # Mocha test suites
│   ├── utils/               # Driver and screenshot utilities
│   ├── reports/             # HTML/JSON Mochawesome reports
│   └── screenshots/         # Captured on failure
│
├── appium-tests/            # Mobile App Testing (Appium + WDIO)
│   ├── package.json
│   ├── wdio.conf.js         # WebdriverIO Configuration
│   ├── pages/               # Mobile POMs
│   ├── tests/               # WDIO Mobile test suites
│   ├── reports/             # Allure Reports
│   └── screenshots/         # Captured on failure
│
├── selenium-tests/generate-selenium-excel.js   # Script to generate 300+ Web test cases
└── appium-tests/generate-appium-excel.js       # Script to generate 300+ Mobile test cases
```

## Installation

You need Node.js installed on your machine.

### Web Tests (Selenium)
1. `cd selenium-tests`
2. `npm install`
3. Ensure you have Google Chrome installed. The `selenium-webdriver` will automatically manage the ChromeDriver.

### Mobile Tests (Appium)
1. `cd appium-tests`
2. `npm install`
3. Make sure you have Android Studio / Android Emulator configured and running.
4. Ensure Appium is installed globally (`npm install -g appium`) and the uiautomator2 driver is installed (`appium driver install uiautomator2`).
5. Update `wdio.conf.js` to point to the correct path of your built `.apk` file.

## Generating the 600+ Excel Test Cases

To generate the comprehensive test documentation with over 300 unique test cases each:

1. `cd selenium-tests`
2. `npm install exceljs`
3. `node generate-selenium-excel.js`
4. The `Selenium_TestCases.xlsx` will be generated in the directory.

Repeat the exact same steps in the `appium-tests` directory for mobile test cases using `node generate-appium-excel.js`.

## Running the Tests

### Selenium Web Tests
```bash
cd selenium-tests
npm test
```
- Tests will launch Chrome, execute the flows, and close the browser.
- HTML reports are saved in `selenium-tests/reports/`.
- Screenshots of failures are saved in `selenium-tests/screenshots/`.

### Appium Mobile Tests
```bash
cd appium-tests
npm test
```
- Will connect to your running Android Emulator.
- Executes the tests via WDIO.
- Reports are pushed to `appium-tests/reports/allure-results`.
- Screenshots of failures are in `appium-tests/screenshots/`.
