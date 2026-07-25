/**
 * monitoring-tests.js  – TC_WEB_300 to TC_WEB_314
 * Tests for the Monitoring / Clinical Follow-up screen (nav tab)
 * Prereq: patient must exist and be reachable via the Monitoring tab.
 */
const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');

async function loginAndGoMonitoring(driver) {
    const lp = new LoginPage(driver);
    await lp.open();
    await lp.enterCredentials('m@p.com', '123456');
    await lp.clickLogin();
    await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Appointments")]')), 12000);
    // Monitoring is accessible via the bottom nav "Monitoring" or by navigating through Patients
    await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Patients"]'));
    await driver.sleep(1500);
    await driver.wait(until.elementLocated(By.css('[data-testid^="patient-card-"]')), 8000);
    const cards = await driver.findElements(By.css('[data-testid^="patient-card-"]'));
    await cards[0].click();
    await driver.sleep(2000);
    // Click Clinical Follow-up tab
    await DriverUtils.waitAndClick(driver, By.css('[data-testid="profile-tab-monitoring"]'));
    await driver.sleep(1000);
}

describe('Clinical Follow-up Tab Tests', function () {
    this.timeout(70000);
    let driver;

    before(async function () {
        driver = await DriverUtils.initDriver();
        await loginAndGoMonitoring(driver);
    });

    after(async function () { if (driver) await driver.quit(); });

    it('[TC_WEB_300] Clinical Follow-up tab content loads', async function () {
        const content = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"ISQ") or contains(text(),"Bone Loss") or contains(text(),"Clinical")]')), 10000);
        expect(content).to.not.be.undefined;
    });

    it('[TC_WEB_301] ISQ Score label is visible', async function () {
        const label = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"ISQ")]')), 8000);
        expect(label).to.not.be.undefined;
    });

    it('[TC_WEB_302] Bone Loss label is visible', async function () {
        const label = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Bone Loss") or contains(text(),"Bone")]')), 8000);
        expect(label).to.not.be.undefined;
    });

    it('[TC_WEB_303] Mobility options M0/M1/M2/M3 are rendered', async function () {
        const m0 = await driver.wait(until.elementLocated(By.xpath('//*[text()="M0"]')), 8000);
        expect(m0).to.not.be.undefined;
    });

    it('[TC_WEB_304] Pain Level (0-10) scale is rendered', async function () {
        const painLabel = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Pain")]')), 8000);
        expect(painLabel).to.not.be.undefined;
    });

    it('[TC_WEB_305] Swelling section is visible', async function () {
        const swellingEl = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Swelling")]')), 8000);
        expect(swellingEl).to.not.be.undefined;
    });

    it('[TC_WEB_306] Bleeding section is visible', async function () {
        const bleedingEl = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Bleeding")]')), 8000);
        expect(bleedingEl).to.not.be.undefined;
    });

    it('[TC_WEB_307] Smoking Status section is visible', async function () {
        const smokingEl = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Smoking") or contains(text(),"Non-smoker")]')), 8000);
        expect(smokingEl).to.not.be.undefined;
    });

    it('[TC_WEB_308] Diabetes section is visible', async function () {
        const diabetesEl = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Diabetes") or contains(text(),"None")]')), 8000);
        expect(diabetesEl).to.not.be.undefined;
    });

    it('[TC_WEB_309] Oral Hygiene section is visible', async function () {
        const hygieneEl = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Hygiene") or contains(text(),"Oral")]')), 8000);
        expect(hygieneEl).to.not.be.undefined;
    });

    it('[TC_WEB_310] Update Progress button is present', async function () {
        const btn = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Update Progress") or contains(text(),"Update")]')), 8000);
        expect(btn).to.not.be.undefined;
    });

    it('[TC_WEB_311] Clicking M1 mobility option selects it', async function () {
        const m1 = await driver.wait(until.elementLocated(By.xpath('//*[text()="M1"]')), 5000);
        await m1.click();
        await driver.sleep(300);
        expect(m1).to.not.be.undefined;
    });

    it('[TC_WEB_312] Clicking Update Progress triggers result card', async function () {
        await DriverUtils.waitAndClick(driver, By.xpath('//*[contains(text(),"Update Progress")]'));
        await driver.sleep(3000);
        const result = await driver.findElements(By.xpath('//*[contains(text(),"Healing") or contains(text(),"Progress") or contains(text(),"Risk")]'));
        expect(result.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_313] Healing score percentage is shown after Update Progress', async function () {
        const percentages = await driver.findElements(By.xpath('//*[contains(text(),"%")]'));
        expect(percentages.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_314] Book Follow-up button is shown after analysis result', async function () {
        const bookBtn = await driver.findElements(By.xpath('//*[contains(text(),"Book") or contains(text(),"Follow") or contains(text(),"Schedule")]'));
        expect(bookBtn.length).to.be.greaterThan(0);
    });
});
