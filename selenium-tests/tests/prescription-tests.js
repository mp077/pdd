const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const PrescriptionPage = require('../pages/PrescriptionPage');

describe('Prescription Workspace Tests', function () {
    this.timeout(40000);
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
        await driver.wait(until.elementLocated(By.xpath('//*[text()="Appointments" or contains(text(), "Appointments")]')), 10000);
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('[TC_WEB_020] should navigate to Prescription Workspace', async function () {
        // Go to Prescription via bottom nav
        await driver.findElement(By.xpath('//*[contains(text(), "Prescription")]')).click();
        
        // Search and select patient first
        await rxPage.searchAndSelectPatient('Test');
        
        const searchInput = await driver.wait(until.elementLocated(rxPage.medSearchInput), 5000);
        expect(searchInput).to.not.be.undefined;
    });

    it('[TC_WEB_021] should search for medication', async function () {
        await rxPage.searchMedication('Amoxicillin');
        
        // Wait for suggestion list
        const suggestions = await driver.wait(until.elementsLocated(By.xpath('//*[contains(text(), "Amoxicillin")]')), 5000);
        expect(suggestions.length).to.be.greaterThan(0);
    });
});
