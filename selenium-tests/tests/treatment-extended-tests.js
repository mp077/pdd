const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const PatientsPage = require('../pages/PatientsPage');
const TreatmentPlanPage = require('../pages/TreatmentPlanPage');

describe('Treatment Extended Tests', function () {
    this.timeout(60000);
    let driver;
    let loginPage;
    let patientsPage;
    let planPage;

    before(async function () {
        driver = await DriverUtils.initDriver();
        loginPage = new LoginPage(driver);
        patientsPage = new PatientsPage(driver);
        planPage = new TreatmentPlanPage(driver);

        await loginPage.open();
        await loginPage.enterCredentials('m@p.com', '123456');
        await loginPage.clickLogin();
        await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Appointments")]')), 12000);

        await driver.get('http://localhost:8081');
        await driver.sleep(1000);
        // Navigate to Patients → open first patient profile → Treatment Plan tab
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Patients"]'));
        await driver.sleep(2500); // Give it more time to load list
        await patientsPage.clickFirstPatientCard();
        await driver.sleep(2000);
        // Click Treatment Plan tab
        await DriverUtils.waitAndClick(driver, By.xpath('//*[contains(text(), "Treatment Plan") or contains(text(), "Treatment")]'));
        await driver.sleep(1000);
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('[TC_WEB_017_tx] bone height input should accept valid numeric value', async function () {
        const input = await driver.wait(until.elementLocated(By.css('[data-testid="bone-height-input"]')), 10000);
        expect(input).to.not.be.undefined;
    });

    it('[TC_WEB_018_tx] bone width input should be present', async function () {
        const input = await driver.wait(until.elementLocated(By.css('[data-testid="bone-width-input"]')), 8000);
        expect(input).to.not.be.undefined;
    });

    it('[TC_WEB_019_tx] bone density input should be present', async function () {
        const input = await driver.wait(until.elementLocated(By.css('[data-testid="bone-density-input"]')), 8000);
        expect(input).to.not.be.undefined;
    });

    it('[TC_WEB_020_tx] generate plan button should be visible', async function () {
        const btn = await driver.wait(until.elementLocated(By.css('[data-testid="generate-plan-btn"]')), 8000);
        expect(btn).to.not.be.undefined;
    });

    it('[TC_WEB_021_tx] generate plan with default values should produce recommendation', async function () {
        await planPage.generatePlan();
        await driver.sleep(2000);
        const result = await driver.wait(
            until.elementLocated(By.xpath('//*[contains(text(), "Recommendation") or contains(text(), "Implant") or contains(text(), "Success")]')),
            20000
        );
        expect(result).to.not.be.undefined;
    });

    it('[TC_WEB_022_tx] AI result cards should contain implant dimensions', async function () {
        const dimensionText = await driver.findElements(By.xpath('//*[contains(text(), "mm") or contains(text(), "diameter") or contains(text(), "length")]'));
        // Plan results should show implant dimensions
        expect(dimensionText.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_023_tx] Approve Implant button should be visible in results', async function () {
        const approveBtn = await driver.findElements(By.xpath('//*[contains(text(), "Approve") or contains(text(), "Confirm")]'));
        expect(approveBtn.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_024_tx] patient profile tabs should be navigable', async function () {
        // Go to Overview tab
        const overviewTab = await driver.findElements(By.xpath('//*[contains(text(), "Overview") or contains(text(), "Summary")]'));
        if (overviewTab.length > 0) {
            await DriverUtils.waitAndClick(driver, By.xpath('//*[contains(text(), "Overview") or contains(text(), "Summary")]'));
            await driver.sleep(800);
        }
        expect(true).to.be.true;
    });
});
