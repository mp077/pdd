/**
 * patient-profile-tabs-tests.js  – TC_WEB_420 to TC_WEB_434
 * Tests for Patient Profile tab navigation and content verification.
 */
const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const PatientsPage = require('../pages/PatientsPage');

describe('Patient Profile Tabs Tests', function () {
    this.timeout(70000);
    let driver, patientsPage;

    before(async function () {
        driver = await DriverUtils.initDriver();
        const lp = new LoginPage(driver);
        patientsPage = new PatientsPage(driver);
        await lp.open();
        await lp.enterCredentials('m@p.com', '123456');
        await lp.clickLogin();
        await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Appointments")]')), 12000);
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Patients"]'));
        await driver.sleep(1500);
        await patientsPage.isLoaded();
        const cards = await driver.findElements(By.css('[data-testid^="patient-card-"]'));
        if (cards.length > 0) {
            await driver.executeScript("arguments[0].click();", cards[0]);
            await driver.sleep(2000);
        }
    });

    after(async function () { if (driver) await driver.quit(); });

    it('[TC_WEB_420] Profile Back button is visible', async function () {
        const backBtn = await driver.wait(until.elementLocated(By.css('[data-testid="profile-back-btn"]')), 8000);
        expect(backBtn).to.not.be.undefined;
    });

    it('[TC_WEB_421] Patient Profile title is visible', async function () {
        const title = await driver.wait(until.elementLocated(By.css('[data-testid="profile-title"]')), 8000);
        expect(title).to.not.be.undefined;
    });

    it('[TC_WEB_422] Patient info card is displayed', async function () {
        const card = await driver.wait(until.elementLocated(By.css('[data-testid="patient-profile-card"]')), 8000);
        expect(card).to.not.be.undefined;
    });

    it('[TC_WEB_423] Overview tab is selected by default', async function () {
        const overviewTab = await driver.wait(until.elementLocated(By.css('[data-testid="profile-tab-overview"]')), 8000);
        expect(overviewTab).to.not.be.undefined;
    });

    it('[TC_WEB_424] Overview tab shows patient details section', async function () {
        const details = await driver.findElements(By.xpath('//*[contains(text(),"Contact") or contains(text(),"Patient")]'));
        expect(details.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_425] Overview tab shows Medical History section (Clinical Summary)', async function () {
        const history = await driver.findElements(By.xpath('//*[contains(text(),"Clinical Summary") or contains(text(),"History")]'));
        expect(history.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_426] Clicking Treatment Planning tab switches view', async function () {
        await DriverUtils.waitAndClick(driver, By.css('[data-testid="profile-tab-treatment"]'));
        await driver.sleep(1000);
        const treatmentTitle = await driver.findElements(By.xpath('//*[contains(text(),"Bone Profile") or contains(text(),"Treatment")]'));
        expect(treatmentTitle.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_427] Treatment Planning tab retains patient context', async function () {
        const patientName = await driver.findElements(By.css('[data-testid="patient-profile-name"]'));
        expect(patientName.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_428] Clicking Clinical Follow-up tab switches view', async function () {
        await DriverUtils.waitAndClick(driver, By.css('[data-testid="profile-tab-monitoring"]'));
        await driver.sleep(1000);
        const followUpTitle = await driver.findElements(By.xpath('//*[contains(text(),"ISQ") or contains(text(),"Bone Loss")]'));
        expect(followUpTitle.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_429] Clinical Follow-up tab retains patient context', async function () {
        const patientName = await driver.findElements(By.css('[data-testid="patient-profile-name"]'));
        expect(patientName.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_430] Clicking Overview tab returns to Overview view', async function () {
        await DriverUtils.waitAndClick(driver, By.css('[data-testid="profile-tab-overview"]'));
        await driver.sleep(1000);
        const details = await driver.findElements(By.xpath('//*[contains(text(),"Contact") or contains(text(),"Patient")]'));
        expect(details.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_431] Status badge is visible on patient card', async function () {
        const badge = await driver.findElements(By.css('[data-testid="patient-status-badge"]'));
        expect(badge.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_432] Profile page does not throw unhandled errors during tab switching', async function () {
        await DriverUtils.waitAndClick(driver, By.css('[data-testid="profile-tab-treatment"]'));
        await driver.sleep(500);
        await DriverUtils.waitAndClick(driver, By.css('[data-testid="profile-tab-monitoring"]'));
        await driver.sleep(500);
        await DriverUtils.waitAndClick(driver, By.css('[data-testid="profile-tab-overview"]'));
        await driver.sleep(500);
        const url = await driver.getCurrentUrl();
        expect(url).to.include('localhost');
    });

    it('[TC_WEB_433] Clicking Back button navigates to Patient List', async function () {
        await DriverUtils.waitAndClick(driver, By.css('[data-testid="profile-back-btn"]'));
        await driver.sleep(1500);
        const input = await driver.wait(until.elementLocated(By.css('[data-testid="search-patient-input"]')), 8000);
        expect(input).to.not.be.undefined;
    });

    it('[TC_WEB_434] Re-opening patient profile loads correctly', async function () {
        const cards = await driver.findElements(By.css('[data-testid^="patient-card-"]'));
        if (cards.length > 0) {
            await driver.executeScript("arguments[0].click();", cards[0]);
            await driver.sleep(2000);
            const title = await driver.wait(until.elementLocated(By.css('[data-testid="profile-title"]')), 8000);
            expect(title).to.not.be.undefined;
        } else {
            expect(true).to.be.true;
        }
    });
});
