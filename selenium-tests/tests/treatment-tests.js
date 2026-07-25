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
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Patients"]'));
        
        // Wait for a patient card and click
        await DriverUtils.waitAndClick(driver, By.css('[data-testid^="patient-card-"]'));
        
        // Now inside patient profile, wait for "Treatment Plan" tab
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Treatment Plan" or contains(text(), "Treatment Plan")]'));
        
        // Verify we are on planning page
        const boneHeight = await driver.wait(until.elementLocated(planPage.boneHeightInput), 5000);
        expect(boneHeight).to.not.be.undefined;
    });

    it('[TC_WEB_016] should generate an AI Treatment Plan successfully', async function () {
        await planPage.enterBoneData('14.0', '6.5', '1100');
        await planPage.generatePlan();
        await driver.sleep(2000); // Give React time to process and render results
        
        // Wait for results to appear - results render as "Recommendation #1"
        const resultHeader = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Recommendation") or contains(text(), "Implant") or contains(text(), "Success")]')), 25000);
        expect(resultHeader).to.not.be.undefined;
    });
});
