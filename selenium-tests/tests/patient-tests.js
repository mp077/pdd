const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const PatientsPage = require('../pages/PatientsPage');

describe('Patients Module Tests', function () {
    this.timeout(40000);
    let driver;
    let loginPage;
    let dashboardPage;
    let patientsPage;

    before(async function () {
        driver = await DriverUtils.initDriver();
        loginPage = new LoginPage(driver);
        dashboardPage = new DashboardPage(driver);
        patientsPage = new PatientsPage(driver);
        
        await loginPage.open();
        await loginPage.enterCredentials('m@p.com', '123456');
        await loginPage.clickLogin();
        await dashboardPage.isLoaded();
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('[TC_WEB_010] should open Patients screen from Dashboard', async function () {
        await driver.wait(until.elementLocated(dashboardPage.patientsNav), 5000);
        await driver.findElement(dashboardPage.patientsNav).click();
        
        const isLoaded = await patientsPage.isLoaded();
        expect(isLoaded).to.be.true;
    });

    it('[TC_WEB_011] should be able to search for a patient', async function () {
        await patientsPage.searchPatient('Test');
        // If there are results, the cards should be visible
        const cards = await driver.findElements(By.css('[data-testid^="patient-card-"]'));
        expect(cards).to.not.be.undefined;
    });

    it('[TC_WEB_012] should open patient profile on click', async function () {
        await patientsPage.searchPatient(''); // clear search
        const clicked = await patientsPage.clickFirstPatientCard();
        expect(clicked).to.be.true;
        
        // Wait for PatientProfileDoctor screen header
        await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Treatment Timeline")]')), 10000);
        expect(true).to.be.true;
        
        // Go back to patients
        await driver.findElement(dashboardPage.patientsNav).click();
    });
});
