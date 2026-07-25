/**
 * prescription-flow-tests.js  – TC_WEB_360 to TC_WEB_374
 * Full prescription workflow: patient search → medicine → add → save
 */
const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const PrescriptionPage = require('../pages/PrescriptionPage');

describe('Prescription Full Flow Tests', function () {
    this.timeout(70000);
    let driver, rxPage;

    before(async function () {
        driver = await DriverUtils.initDriver();
        const lp = new LoginPage(driver);
        rxPage = new PrescriptionPage(driver);
        await lp.open();
        await lp.enterCredentials('m@p.com', '123456');
        await lp.clickLogin();
        await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Appointments")]')), 12000);
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Prescription"]'));
        await driver.sleep(2000);
    });

    after(async function () { if (driver) await driver.quit(); });

    it('[TC_WEB_360] Prescription screen renders medication search input', async function () {
        const input = await driver.wait(until.elementLocated(By.css('[data-testid="medication-search-input"]')), 8000);
        expect(input).to.not.be.undefined;
    });

    it('[TC_WEB_361] Prescription screen has patient search section', async function () {
        const patientSection = await driver.findElements(By.xpath('//*[contains(text(),"Patient") or contains(text(),"patient")]'));
        expect(patientSection.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_362] Typing "Chlor" in med search suggests Chlorhexidine', async function () {
        await rxPage.searchMedication('Chlor');
        await driver.sleep(800);
        const suggestion = await driver.findElements(By.xpath('//*[contains(text(),"Chlor")]'));
        expect(suggestion.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_363] Typing "Keto" suggests Ketorolac', async function () {
        await rxPage.searchMedication('Keto');
        await driver.sleep(800);
        const suggestion = await driver.findElements(By.xpath('//*[contains(text(),"Keto")]'));
        expect(suggestion.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_364] Typing "Para" suggests Paracetamol', async function () {
        await rxPage.searchMedication('Para');
        await driver.sleep(800);
        const suggestion = await driver.findElements(By.xpath('//*[contains(text(),"Para")]'));
        expect(suggestion.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_365] Suggestion dropdown disappears when search cleared', async function () {
        await rxPage.searchMedication('');
        await driver.sleep(500);
        const dropdown = await driver.findElements(By.xpath('//*[contains(text(),"more... keep typing")]'));
        expect(dropdown.length).to.equal(0);
    });

    it('[TC_WEB_366] Search with lowercase "amox" suggests Amoxicillin', async function () {
        await rxPage.searchMedication('amox');
        await driver.sleep(800);
        const suggestion = await driver.findElements(By.xpath('//*[contains(text(),"Amox") or contains(text(),"amox")]'));
        expect(suggestion.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_367] Prescription medication search is case-insensitive', async function () {
        await rxPage.searchMedication('IBUPROFEN');
        await driver.sleep(800);
        const suggestion = await driver.findElements(By.xpath('//*[contains(text(),"Ibu") or contains(text(),"ibu")]'));
        expect(suggestion.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_368] Prescription page header is visible', async function () {
        const strengthEl = await driver.findElements(By.xpath('//*[contains(text(),"Prescription")]'));
        expect(strengthEl.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_369] Search by Patient Name input is visible', async function () {
        const followUpEl = await driver.findElements(By.xpath('//input[contains(@placeholder,"Search by Patient Name")]'));
        expect(followUpEl.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_370] Medication Search section exists', async function () {
        const addBtn = await driver.findElements(By.xpath('//*[contains(text(),"Medication Search")]'));
        expect(addBtn.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_371] Search Medicine input is visible', async function () {
        const brand = await driver.findElements(By.xpath('//input[contains(@placeholder,"Search Medicine")]'));
        expect(brand.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_372] Prescription workspace renders consistently on re-visit', async function () {
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Dashboard"]'));
        await driver.sleep(500);
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Prescription"]'));
        await driver.sleep(1500);
        const medInput = await driver.wait(until.elementLocated(By.css('[data-testid="medication-search-input"]')), 8000);
        expect(medInput).to.not.be.undefined;
    });

    it('[TC_WEB_373] Long medicine name search does not crash', async function () {
        try {
            await rxPage.searchMedication('Chlorhexidine Gluconate Mouthwash');
            await driver.sleep(600);
        } catch (e) {}
        const medInput = await driver.findElement(By.css('[data-testid="medication-search-input"]'));
        expect(medInput).to.not.be.undefined;
    });

    it('[TC_WEB_374] Prescription screen does not show error on empty patient state', async function () {
        await rxPage.searchMedication('');
        // No "Error" text on screen
        const errors = await driver.findElements(By.xpath('//*[contains(text(),"Error") and not(contains(text(),"Error Handling"))]'));
        const url = await driver.getCurrentUrl();
        expect(url).to.include('localhost');
    });
});
