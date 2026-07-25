/**
 * decision-support-tests.js  – TC_WEB_463 to TC_WEB_475
 * Tests for Decision AI / Support screen.
 */
const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');

describe('Decision AI Support Tests', function () {
    this.timeout(60000);
    let driver;

    before(async function () {
        driver = await DriverUtils.initDriver();
        const lp = new LoginPage(driver);
        await lp.open();
        await lp.enterCredentials('m@p.com', '123456');
        await lp.clickLogin();
        await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Appointments")]')), 12000);
        const decisionBtn = await driver.findElements(By.xpath('//*[contains(text(),"Decision AI") or contains(text(),"AI Insights")]'));
        if (decisionBtn.length > 0) {
            await DriverUtils.waitAndClick(driver, By.xpath('//*[contains(text(),"Decision AI") or contains(text(),"AI Insights")]'));
            await driver.sleep(1500);
        } else {
            this.skip();
        }
    });

    after(async function () { if (driver) await driver.quit(); });

    it('[TC_WEB_463] Decision AI screen loads successfully', async function () {
        const title = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"AI Decision Support") or contains(text(),"Decision")]')), 8000);
        expect(title).to.not.be.undefined;
    });

    it('[TC_WEB_464] Search input for patient selection exists', async function () {
        const input = await driver.findElements(By.xpath('//input[@placeholder="Search active patients..."]'));
        expect(input.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_465] Default patient name is displayed on screen', async function () {
        const name = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Sarah Johnson") or contains(text(),"Johnson")]')), 8000);
        expect(name).to.not.be.undefined;
    });

    it('[TC_WEB_466] Patient implant site is displayed', async function () {
        const site = await driver.findElements(By.xpath('//*[contains(text(),"#14") or contains(text(),"Site")]'));
        expect(site.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_467] Patient bone quality is displayed', async function () {
        const quality = await driver.findElements(By.xpath('//*[contains(text(),"D2") or contains(text(),"Thick Cortical")]'));
        expect(quality.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_468] Recovery score is displayed', async function () {
        const score = await driver.findElements(By.xpath('//*[contains(text(),"92") or contains(text(),"Recovery Score")]'));
        expect(score.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_469] Healing status is displayed', async function () {
        const status = await driver.findElements(By.xpath('//*[contains(text(),"Excellent Healing") or contains(text(),"Healing")]'));
        expect(status.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_470] Risk level is displayed prominently', async function () {
        const risk = await driver.findElements(By.xpath('//*[contains(text(),"Low Risk") or contains(text(),"High Risk")]'));
        expect(risk.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_471] Clinical Progress history timeline exists', async function () {
        const progress = await driver.findElements(By.xpath('//*[contains(text(),"Clinical Progress") or contains(text(),"History")]'));
        expect(progress.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_472] Timeline shows Implant Placement entry', async function () {
        const entry = await driver.findElements(By.xpath('//*[contains(text(),"Implant Placement")]'));
        expect(entry.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_473] Timeline shows score percentages', async function () {
        const pct = await driver.findElements(By.xpath('//*[contains(text(),"%")]'));
        expect(pct.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_474] Clicking patient search reveals dropdown', async function () {
        await DriverUtils.waitAndClick(driver, By.xpath('//input[@placeholder="Search active patients..."]'));
        await driver.sleep(500);
        const dropdown = await driver.findElements(By.xpath('//*[contains(text(),"Marcus O\'Neill")]'));
        expect(dropdown.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_475] Navigating to Dashboard and back retains Decision Support', async function () {
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Dashboard"]'));
        await driver.sleep(1000);
        await DriverUtils.waitAndClick(driver, By.xpath('//*[contains(text(),"Decision AI") or contains(text(),"AI Insights")]'));
        await driver.sleep(1500);
        const title = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"AI Decision Support") or contains(text(),"Decision")]')), 8000);
        expect(title).to.not.be.undefined;
    });
});
