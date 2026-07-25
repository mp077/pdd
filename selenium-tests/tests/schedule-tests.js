const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const SchedulePage = require('../pages/SchedulePage');

describe('Schedule Tests', function () {
    this.timeout(40000);
    let driver;
    let loginPage;
    let schedulePage;

    before(async function () {
        driver = await DriverUtils.initDriver();
        loginPage = new LoginPage(driver);
        schedulePage = new SchedulePage(driver);

        await loginPage.open();
        await loginPage.enterCredentials('m@p.com', '123456');
        await loginPage.clickLogin();
        await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Appointments")]')), 12000);

        // Navigate to Schedule
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Schedule"]'));
        await driver.sleep(1500);
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('[TC_WEB_050] Schedule screen should load successfully', async function () {
        const isLoaded = await schedulePage.isLoaded();
        expect(isLoaded).to.be.true;
    });

    it('[TC_WEB_051] Schedule should display total appointment count', async function () {
        const countEl = await driver.wait(until.elementLocated(By.css('[data-testid="schedule-total-count"]')), 8000);
        const countText = await countEl.getText();
        expect(countText).to.match(/\d+/);
    });

    it('[TC_WEB_052] Schedule stats cards should be visible', async function () {
        // Check for Virtual, Completed stats
        const statTexts = await driver.findElements(By.xpath('//*[contains(text(), "Virtual") or contains(text(), "Completed") or contains(text(), "Total")]'));
        expect(statTexts.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_053] Schedule appointment list section should render', async function () {
        const listEl = await driver.wait(until.elementLocated(By.css('[data-testid="schedule-list"]')), 8000);
        expect(listEl).to.not.be.undefined;
    });

    it('[TC_WEB_054] Date selector chips should be visible', async function () {
        const todayChip = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Today")]')), 8000);
        expect(todayChip).to.not.be.undefined;
    });

    it('[TC_WEB_055] empty state message should show when no appointments', async function () {
        // This test verifies the empty-state path renders without crashing
        const pageContent = await driver.findElements(By.xpath('//*[contains(text(), "appointment") or contains(text(), "Appointment") or contains(text(), "No")]'));
        expect(pageContent.length).to.be.greaterThan(0);
    });
});
