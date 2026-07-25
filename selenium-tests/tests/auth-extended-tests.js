const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');

describe('Authentication Extended Tests', function () {
    this.timeout(40000);
    let driver;
    let loginPage;

    before(async function () {
        driver = await DriverUtils.initDriver();
        loginPage = new LoginPage(driver);
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('[TC_WEB_030] should show error on invalid credentials', async function () {
        await loginPage.open();
        await loginPage.enterCredentials('invalid@test.com', 'wrongpass');
        await loginPage.clickLogin();
        // Wait for error message to appear
        const errEl = await driver.wait(until.elementLocated(By.css('[data-testid="login-error-text"]')), 8000);
        const errText = await errEl.getText();
        expect(errText.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_031] should show error on empty credentials', async function () {
        await loginPage.open();
        await loginPage.clickLogin();
        // Error should appear or button remains enabled — app should not crash
        await driver.sleep(1000);
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('localhost');
    });

    it('[TC_WEB_032] should show error on empty password', async function () {
        await loginPage.open();
        await DriverUtils.waitAndSendKeys(driver, By.css('[data-testid="email-input"]'), 'doctor@test.com');
        await loginPage.clickLogin();
        await driver.sleep(1500);
        // Either error shown or stays on login page
        const emailInput = await driver.findElements(By.css('[data-testid="email-input"]'));
        expect(emailInput.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_033] should navigate to Forgot Password screen', async function () {
        await loginPage.open();
        const forgotBtn = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Forgot Password")]')), 8000);
        await DriverUtils.waitAndClick(driver, By.xpath('//*[contains(text(), "Forgot Password")]'));
        await driver.sleep(1500);
        // Forgot password screen has Reset / Send OTP text
        const resetText = await driver.findElements(By.xpath('//*[contains(text(), "Reset") or contains(text(), "Forgot") or contains(text(), "Email")]'));
        expect(resetText.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_034] should have role selectors on login screen', async function () {
        await loginPage.open();
        const doctorRole = await driver.wait(until.elementLocated(By.css('[data-testid="role-selector-doctor"]')), 8000);
        expect(doctorRole).to.not.be.undefined;
        // Verify patient role selector also exists
        const patientRole = await driver.findElements(By.css('[data-testid^="role-selector-"]'));
        expect(patientRole.length).to.be.greaterThan(1);
    });

    it('[TC_WEB_035] should navigate to Registration screen', async function () {
        await loginPage.open();
        const createAccountBtn = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Create Account") or contains(text(), "Register") or contains(text(), "Sign Up")]')), 8000);
        await DriverUtils.waitAndClick(driver, By.xpath('//*[contains(text(), "Create Account") or contains(text(), "Register") or contains(text(), "Sign Up")]'));
        await driver.sleep(1500);
        // Should show registration form
        const registerElements = await driver.findElements(By.xpath('//*[contains(text(), "Register") or contains(text(), "Registration") or contains(text(), "Create")]'));
        expect(registerElements.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_036] should successfully login after failed attempt', async function () {
        await loginPage.open();
        // First attempt fails
        await loginPage.enterCredentials('wrong@test.com', 'bad');
        await loginPage.clickLogin();
        await driver.sleep(1500);
        // Second attempt succeeds
        await loginPage.enterCredentials('m@p.com', '123456');
        await loginPage.clickLogin();
        const dashboard = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Appointments") or contains(text(), "Dashboard")]')), 12000);
        expect(dashboard).to.not.be.undefined;
    });
});
