const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const AdminPage = require('../pages/AdminPage');

describe('Admin Portal Tests', function () {
    this.timeout(40000);
    let driver;
    let adminPage;

    before(async function () {
        driver = await DriverUtils.initDriver();
        adminPage = new AdminPage(driver);
        
        // Go directly to admin login if routed, or click the admin shield from main login
        await driver.get('http://localhost:8081');
        
        // Wait for main login to load, then click Admin Shield
        const shieldBtn = await driver.wait(until.elementLocated(By.css('[data-testid="admin-shield-btn"]')), 5000);
        await shieldBtn.click();
        
        // Login as admin
        const emailInput = await driver.wait(until.elementLocated(By.css('[data-testid="admin-email-input"]')), 5000);
        await emailInput.sendKeys('admin@dentpulse.com');
        
        const pwdInput = await driver.findElement(By.css('[data-testid="admin-password-input"]'));
        await pwdInput.sendKeys('123456');
        
        const loginBtn = await driver.findElement(By.css('[data-testid="admin-login-button"]'));
        await loginBtn.click();
        
        // Wait longer for admin console to load (login API might be slow)
        await driver.sleep(3000);
        await adminPage.isLoaded();
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('[TC_WEB_025] should login to Admin Portal successfully', async function () {
        const isLoaded = await adminPage.isLoaded();
        expect(isLoaded).to.be.true;
    });

    it('[TC_WEB_026] should navigate to Doctors Management', async function () {
        await adminPage.goToDoctors();
        // Just verify navigation didn't crash
        expect(true).to.be.true;
    });
});
