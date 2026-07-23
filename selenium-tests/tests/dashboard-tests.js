const { expect } = require('chai');
const { until } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');

describe('Dashboard Tests', function () {
    this.timeout(30000);
    let driver;
    let loginPage;
    let dashboardPage;

    before(async function () {
        driver = await DriverUtils.initDriver();
        loginPage = new LoginPage(driver);
        dashboardPage = new DashboardPage(driver);
        
        // Ensure logged in
        await loginPage.open();
        await loginPage.enterCredentials('m@p.com', '123456');
        await loginPage.clickLogin();
        await dashboardPage.isLoaded();
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('[TC_WEB_005] Dashboard should load successfully', async function () {
        const isLoaded = await dashboardPage.isLoaded();
        expect(isLoaded).to.be.true;
    });

    it('[TC_WEB_006] KPI cards should display numeric values', async function () {
        const apptKpi = await driver.wait(until.elementLocated({ css: '[data-testid="kpi-appointments-count"]' }), 5000);
        const waitingKpi = await driver.wait(until.elementLocated({ css: '[data-testid="kpi-waiting-count"]' }), 5000);
        const acceptedKpi = await driver.wait(until.elementLocated({ css: '[data-testid="kpi-accepted-count"]' }), 5000);
        const alertsKpi = await driver.wait(until.elementLocated({ css: '[data-testid="kpi-alerts-count"]' }), 5000);
        
        const apptVal = await apptKpi.getText();
        expect(apptVal).to.match(/\d+/);
        
        const waitVal = await waitingKpi.getText();
        expect(waitVal).to.match(/\d+/);
    });
});
