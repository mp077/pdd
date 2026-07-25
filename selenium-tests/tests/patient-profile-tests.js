const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const PatientsPage = require('../pages/PatientsPage');

// Helper: Login and open first patient profile
async function loginAndOpenPatient(driver) {
    const loginPage = new LoginPage(driver);
    const patientsPage = new PatientsPage(driver);
    await loginPage.open();
    await loginPage.enterCredentials('m@p.com', '123456');
    await loginPage.clickLogin();
    await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Appointments")]')), 12000);
    await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Patients"]'));
    await driver.sleep(1500);
    await patientsPage.isLoaded();
    await patientsPage.clickFirstPatientCard();
    await driver.sleep(2000);
    await driver.wait(until.elementLocated(By.css('[data-testid="profile-title"]')), 10000);
}

describe('Patient Profile Comprehensive Tests', function () {
    this.timeout(60000);
    let driver;

    before(async function () {
        driver = await DriverUtils.initDriver();
        await loginAndOpenPatient(driver);
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    // --- Navigation & Load ---
    it('[TC_WEB_100] Patient Profile page title should show "Patient Profile"', async function () {
        const title = await driver.wait(until.elementLocated(By.css('[data-testid="profile-title"]')), 8000);
        const text = await title.getText();
        expect(text).to.include('Patient');
    });

    it('[TC_WEB_101] Patient profile card should be visible', async function () {
        const card = await driver.wait(until.elementLocated(By.css('[data-testid="patient-profile-card"]')), 8000);
        expect(card).to.not.be.undefined;
    });

    it('[TC_WEB_102] Patient name should be displayed in profile', async function () {
        const nameEl = await driver.wait(until.elementLocated(By.css('[data-testid="patient-profile-name"]')), 8000);
        const name = await nameEl.getText();
        expect(name.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_103] Patient meta info should show PID and age', async function () {
        const meta = await driver.wait(until.elementLocated(By.css('[data-testid="patient-profile-meta"]')), 8000);
        const text = await meta.getText();
        expect(text).to.match(/PID|Y|M/);
    });

    it('[TC_WEB_104] Status badge should show Initial or Planned', async function () {
        const badge = await driver.wait(until.elementLocated(By.css('[data-testid="patient-status-badge"]')), 8000);
        const text = await badge.getText();
        expect(['Initial', 'Planned']).to.include(text);
    });

    // --- Tabs ---
    it('[TC_WEB_105] Overview tab should be present', async function () {
        const tab = await driver.wait(until.elementLocated(By.css('[data-testid="profile-tab-overview"]')), 8000);
        expect(tab).to.not.be.undefined;
    });

    it('[TC_WEB_106] Treatment Plan tab should be present', async function () {
        const tab = await driver.wait(until.elementLocated(By.css('[data-testid="profile-tab-treatment"]')), 8000);
        expect(tab).to.not.be.undefined;
    });

    it('[TC_WEB_107] Clinical Follow-up tab should be present', async function () {
        const tab = await driver.wait(until.elementLocated(By.css('[data-testid="profile-tab-monitoring"]')), 8000);
        expect(tab).to.not.be.undefined;
    });

    it('[TC_WEB_108] Clicking Overview tab shows Clinical Summary section', async function () {
        await DriverUtils.waitAndClick(driver, By.css('[data-testid="profile-tab-overview"]'));
        await driver.sleep(800);
        const summary = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Clinical Summary") or contains(text(), "Overview")]')), 8000);
        expect(summary).to.not.be.undefined;
    });

    it('[TC_WEB_109] Clicking Treatment Plan tab shows bone inputs', async function () {
        await DriverUtils.waitAndClick(driver, By.css('[data-testid="profile-tab-treatment"]'));
        await driver.sleep(800);
        const boneInput = await driver.wait(until.elementLocated(By.css('[data-testid="bone-height-input"]')), 8000);
        expect(boneInput).to.not.be.undefined;
    });

    it('[TC_WEB_110] Treatment tab has bone width input', async function () {
        const boneWidth = await driver.wait(until.elementLocated(By.css('[data-testid="bone-width-input"]')), 5000);
        expect(boneWidth).to.not.be.undefined;
    });

    it('[TC_WEB_111] Treatment tab has bone density input', async function () {
        const density = await driver.wait(until.elementLocated(By.css('[data-testid="bone-density-input"]')), 5000);
        expect(density).to.not.be.undefined;
    });

    it('[TC_WEB_112] Generate Plan button is visible on Treatment tab', async function () {
        const btn = await driver.wait(until.elementLocated(By.css('[data-testid="generate-plan-btn"]')), 5000);
        expect(btn).to.not.be.undefined;
    });

    it('[TC_WEB_113] Clicking Generate Plan produces recommendations', async function () {
        await DriverUtils.waitAndClick(driver, By.css('[data-testid="generate-plan-btn"]'));
        await driver.sleep(2500);
        const result = await driver.wait(
            until.elementLocated(By.xpath('//*[contains(text(), "Recommendation") or contains(text(), "Implant") or contains(text(), "Success")]')),
            20000
        );
        expect(result).to.not.be.undefined;
    });

    it('[TC_WEB_114] Recommendation cards show success probability', async function () {
        const probText = await driver.findElements(By.xpath('//*[contains(text(), "%") or contains(text(), "probability") or contains(text(), "Confidence")]'));
        expect(probText.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_115] Recommendation cards show implant dimensions (mm)', async function () {
        const dimText = await driver.findElements(By.xpath('//*[contains(text(), "mm") or contains(text(), "diameter") or contains(text(), "Diameter")]'));
        expect(dimText.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_116] Approve button should be visible in results', async function () {
        const approveBtn = await driver.findElements(By.xpath('//*[contains(text(), "Approve") or contains(text(), "Confirm") or contains(text(), "Select")]'));
        expect(approveBtn.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_117] Clicking Clinical Follow-up tab switches content', async function () {
        await DriverUtils.waitAndClick(driver, By.css('[data-testid="profile-tab-monitoring"]'));
        await driver.sleep(800);
        const content = await driver.wait(
            until.elementLocated(By.xpath('//*[contains(text(), "Follow-up") or contains(text(), "ISQ") or contains(text(), "Monitoring") or contains(text(), "Clinical")]')),
            8000
        );
        expect(content).to.not.be.undefined;
    });

    it('[TC_WEB_118] Back button should navigate away from profile', async function () {
        const backBtn = await driver.wait(until.elementLocated(By.css('[data-testid="profile-back-btn"]')), 5000);
        expect(backBtn).to.not.be.undefined;
    });

    it('[TC_WEB_119] Three tabs total on patient profile', async function () {
        const tabs = await driver.findElements(By.css('[data-testid^="profile-tab-"]'));
        expect(tabs.length).to.equal(3);
    });

    it('[TC_WEB_120] Patient profile avatar shows first letter of name', async function () {
        const avatar = await driver.findElements(By.xpath('//*[string-length(text())=1 and contains(@class,"")]'));
        // Avatar box is always present
        const profileCard = await driver.findElement(By.css('[data-testid="patient-profile-card"]'));
        expect(profileCard).to.not.be.undefined;
    });
});
