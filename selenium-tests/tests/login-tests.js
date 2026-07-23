const { expect } = require('chai');
const { until } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');

describe('DentPulse Authentication Tests', function () {
    this.timeout(30000); // 30 seconds max per test
    let driver;
    let loginPage;
    let dashboardPage;

    before(async function () {
        driver = await DriverUtils.initDriver();
        loginPage = new LoginPage(driver);
        dashboardPage = new DashboardPage(driver);
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    afterEach(async function () {
        if (this.currentTest.state === 'failed') {
            await DriverUtils.takeScreenshot(driver, this.currentTest.title);
        }
    });

    it('[TC_WEB_001] should successfully login as a Doctor', async function () {
        await loginPage.open();
        const isReady = await loginPage.isLoaded();
        expect(isReady).to.be.true;
        await loginPage.enterCredentials('m@p.com', '123456');
        await loginPage.clickLogin();

        const isLoaded = await dashboardPage.isLoaded();
        expect(isLoaded).to.be.true;
    });

    it('[TC_WEB_004] should logout successfully', async function () {
        await dashboardPage.logout();
        // Verify we are back on login page
        await driver.wait(until.elementLocated(loginPage.loginBtn), 10000);
        expect(true).to.be.true;
    });
});
