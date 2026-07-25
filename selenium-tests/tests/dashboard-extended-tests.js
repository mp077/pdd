const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');

describe('Dashboard Extended Tests', function () {
    this.timeout(40000);
    let driver;
    let loginPage;
    let dashboardPage;

    before(async function () {
        driver = await DriverUtils.initDriver();
        loginPage = new LoginPage(driver);
        dashboardPage = new DashboardPage(driver);
        await loginPage.open();
        await loginPage.enterCredentials('m@p.com', '123456');
        await loginPage.clickLogin();
        await dashboardPage.isLoaded();
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('[TC_WEB_007] all four KPI cards should be visible', async function () {
        const apptKpi  = await driver.wait(until.elementLocated(By.css('[data-testid="kpi-appointments-count"]')), 8000);
        const waitKpi  = await driver.wait(until.elementLocated(By.css('[data-testid="kpi-waiting-count"]')), 5000);
        const accKpi   = await driver.wait(until.elementLocated(By.css('[data-testid="kpi-accepted-count"]')), 5000);
        const alertKpi = await driver.wait(until.elementLocated(By.css('[data-testid="kpi-alerts-count"]')), 5000);
        expect(apptKpi).to.not.be.undefined;
        expect(waitKpi).to.not.be.undefined;
        expect(accKpi).to.not.be.undefined;
        expect(alertKpi).to.not.be.undefined;
    });

    it('[TC_WEB_008] KPI values should be non-negative numbers', async function () {
        const kpiEl = await driver.wait(until.elementLocated(By.css('[data-testid="kpi-appointments-count"]')), 8000);
        const value = parseInt(await kpiEl.getText());
        expect(value).to.be.greaterThanOrEqual(0);
    });

    it('[TC_WEB_009] dashboard should contain Today\'s Appointments section', async function () {
        const todaySection = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Appointments") or contains(text(), "Today")]')), 8000);
        expect(todaySection).to.not.be.undefined;
    });

    it('[TC_WEB_040] dashboard bottom navigation tabs should be visible', async function () {
        const patientsTab = await driver.wait(until.elementLocated(By.xpath('//*[text()="Patients"]')), 8000);
        const scheduleTab = await driver.wait(until.elementLocated(By.xpath('//*[text()="Schedule"]')), 5000);
        const prescriptionTab = await driver.wait(until.elementLocated(By.xpath('//*[text()="Prescription"]')), 5000);
        expect(patientsTab).to.not.be.undefined;
        expect(scheduleTab).to.not.be.undefined;
        expect(prescriptionTab).to.not.be.undefined;
    });

    it('[TC_WEB_041] navigating back to Dashboard from Patients should work', async function () {
        // Go to Patients
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Patients"]'));
        await driver.sleep(1500);
        // Go back to Dashboard
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Dashboard"]'));
        await driver.sleep(1500);
        const isLoaded = await dashboardPage.isLoaded();
        expect(isLoaded).to.be.true;
    });
});
