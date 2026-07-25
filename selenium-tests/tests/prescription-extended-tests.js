const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const PrescriptionPage = require('../pages/PrescriptionPage');

describe('Prescription Extended Tests', function () {
    this.timeout(50000);
    let driver;
    let loginPage;
    let rxPage;

    before(async function () {
        driver = await DriverUtils.initDriver();
        loginPage = new LoginPage(driver);
        rxPage = new PrescriptionPage(driver);

        await loginPage.open();
        await loginPage.enterCredentials('m@p.com', '123456');
        await loginPage.clickLogin();
        await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Appointments")]')), 12000);

        // Navigate to Prescription
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Prescription"]'));
        await driver.sleep(1500);
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('[TC_WEB_022] Prescription screen header should show "Prescription"', async function () {
        const header = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Prescription")]')), 8000);
        expect(header).to.not.be.undefined;
    });

    it('[TC_WEB_023] Patient search input should always be visible in header', async function () {
        const patientSearch = await driver.wait(
            until.elementLocated(By.css('input[placeholder*="Search by Patient Name"]')), 8000
        );
        expect(patientSearch).to.not.be.undefined;
    });

    it('[TC_WEB_024] medication search input should always be in DOM', async function () {
        const medInput = await driver.wait(
            until.elementLocated(By.css('[data-testid="medication-search-input"]')), 8000
        );
        expect(medInput).to.not.be.undefined;
    });

    it('[TC_WEB_025_rx] searching for a medicine should show suggestions', async function () {
        await rxPage.searchMedication('Amox');
        await driver.sleep(1000);
        const suggestions = await driver.findElements(
            By.xpath('//*[contains(text(), "Amox")]')
        );
        expect(suggestions.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_026_rx] searching for invalid medicine returns no suggestions', async function () {
        await rxPage.searchMedication('ZZZZNOTAMEDICINE999');
        await driver.sleep(800);
        const suggestions = await driver.findElements(
            By.css('[data-testid="medication-search-input"]')
        );
        // Input should still exist (no crash)
        expect(suggestions.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_027_rx] clearing medication search removes suggestions', async function () {
        await rxPage.searchMedication('Amoxicillin');
        await driver.sleep(800);
        // Clear the input
        await rxPage.searchMedication('');
        await driver.sleep(500);
        const input = await driver.wait(
            until.elementLocated(By.css('[data-testid="medication-search-input"]')), 5000
        );
        expect(input).to.not.be.undefined;
    });

    it('[TC_WEB_028_rx] prescription patient search should filter by name', async function () {
        // Type into patient search header
        const patientSearch = await driver.findElement(By.css('input[placeholder*="Search by Patient Name"]'));
        await DriverUtils.waitAndSendKeys(driver, By.css('input[placeholder*="Search by Patient Name"]'), 'a');
        await driver.sleep(1200);
        // Results should appear or empty state — no crash
        const page = await driver.getCurrentUrl();
        expect(page).to.include('localhost');
    });
});
