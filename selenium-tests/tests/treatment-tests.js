const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const TreatmentPlanPage = require('../pages/TreatmentPlanPage');

describe('Treatment Planning Tests', function () {
    this.timeout(40000);
    let driver;
    let loginPage;
    let planPage;

    before(async function () {
        driver = await DriverUtils.initDriver();
        loginPage = new LoginPage(driver);
        planPage = new TreatmentPlanPage(driver);
        
        await loginPage.open();
        await loginPage.enterCredentials('m@p.com', '123456');
        await loginPage.clickLogin();
        await driver.wait(until.elementLocated(By.xpath('//*[text()="Appointments" or contains(text(), "Appointments")]')), 10000);
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('[TC_WEB_015] should navigate to Patient Profile and open Treatment Planning', async function () {
        // Go to Patients
        await driver.findElement(By.xpath('//*[contains(text(), "Patients")]')).click();
        
        // Wait for a patient card and click
        const card = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "PID-")]')), 5000);
        await card.click();
        
        // Now inside patient profile, wait for "Treatment Plan" tab
        const planBtn = await driver.wait(until.elementLocated(By.xpath('//*[text()="Treatment Plan" or contains(text(), "Treatment Plan")]')), 5000);
        await planBtn.click();
        
        // Verify we are on planning page
        const boneHeight = await driver.wait(until.elementLocated(planPage.boneHeightInput), 5000);
        expect(boneHeight).to.not.be.undefined;
    });

    it('[TC_WEB_016] should generate an AI Treatment Plan successfully', async function () {
        await planPage.enterBoneData('14.0', '6.5', '1100');
        await planPage.generatePlan();
        
        // Wait for results to appear
        const resultHeader = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "AI Recommendation")]')), 15000);
        expect(resultHeader).to.not.be.undefined;
    });
});
