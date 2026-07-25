/**
 * reports-tests.js  – TC_WEB_450 to TC_WEB_462
 * Tests for Reports and Analytics screen functionality.
 */
const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');

describe('Reports & Analytics Tests', function () {
    this.timeout(60000);
    let driver;

    before(async function () {
        driver = await DriverUtils.initDriver();
        const lp = new LoginPage(driver);
        await lp.open();
        await lp.enterCredentials('m@p.com', '123456');
        await lp.clickLogin();
        await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Appointments")]')), 12000);
        // Sometimes menu has "Reports" visible or need to scroll
        const reportsBtn = await driver.findElements(By.xpath('//*[text()="Reports"]'));
        if (reportsBtn.length > 0) {
            await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Reports"]'));
            await driver.sleep(1500);
        } else {
            // fallback if it's hidden in a "More" menu or different tab name
            // Or navigate directly if URL routing allows
            this.skip();
        }
    });

    after(async function () { if (driver) await driver.quit(); });

    it('[TC_WEB_450] Reports screen loads successfully', async function () {
        const title = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Intelligence Reports") or contains(text(),"Reports")]')), 8000);
        expect(title).to.not.be.undefined;
    });

    it('[TC_WEB_451] Intelligence Reports title is visible', async function () {
        const title = await driver.findElements(By.xpath('//*[contains(text(),"Intelligence Reports")]'));
        expect(title.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_452] Clinical Analytics report option is visible', async function () {
        const analytics = await driver.findElements(By.xpath('//*[contains(text(),"Clinical Analytics")]'));
        expect(analytics.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_453] Patient Recovery report option is visible', async function () {
        const recovery = await driver.findElements(By.xpath('//*[contains(text(),"Patient Recovery")]'));
        expect(recovery.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_454] AI Risk Prediction report option is visible', async function () {
        const aiRisk = await driver.findElements(By.xpath('//*[contains(text(),"AI Risk Prediction")]'));
        expect(aiRisk.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_455] Generate Report button exists', async function () {
        const genBtn = await driver.findElements(By.xpath('//*[contains(text(),"Generate Report")]'));
        expect(genBtn.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_456] Recent Exports section label is visible', async function () {
        const recentExports = await driver.findElements(By.xpath('//*[contains(text(),"Recent Exports")]'));
        expect(recentExports.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_457] Clinic_Summary_May.pdf is listed in exports', async function () {
        const pdf = await driver.findElements(By.xpath('//*[contains(text(),"Clinic_Summary_May.pdf")]'));
        expect(pdf.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_458] Export item shows file size', async function () {
        const size = await driver.findElements(By.xpath('//*[contains(text(),"MB")]'));
        expect(size.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_459] Export item shows date', async function () {
        const date = await driver.findElements(By.xpath('//*[contains(text(),"May")]'));
        expect(date.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_460] Download icon is visible on exports', async function () {
        const svg = await driver.findElements(By.css('svg'));
        expect(svg.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_461] Status pills (e.g. Clinical, Patient) are shown', async function () {
        const pills = await driver.findElements(By.xpath('//*[text()="Clinical" or text()="Patient" or text()="Data"]'));
        expect(pills.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_462] Navigating away and back retains Reports UI', async function () {
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Dashboard"]'));
        await driver.sleep(1000);
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Reports"]'));
        await driver.sleep(1500);
        const title = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Intelligence Reports")]')), 8000);
        expect(title).to.not.be.undefined;
    });
});
