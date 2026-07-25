const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');
const ProfilePage = require('../pages/ProfilePage');

describe('Profile Tests', function () {
    this.timeout(40000);
    let driver;
    let loginPage;
    let profilePage;

    before(async function () {
        driver = await DriverUtils.initDriver();
        loginPage = new LoginPage(driver);
        profilePage = new ProfilePage(driver);

        await loginPage.open();
        await loginPage.enterCredentials('m@p.com', '123456');
        await loginPage.clickLogin();
        await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Appointments")]')), 12000);

        // Navigate to Profile
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Profile"]'));
        await driver.sleep(1500);
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('[TC_WEB_060] Profile screen should load successfully', async function () {
        const isLoaded = await profilePage.isLoaded();
        expect(isLoaded).to.be.true;
    });

    it('[TC_WEB_061] Profile should display Personal Information section', async function () {
        const personalInfo = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Personal Information")]')), 8000);
        expect(personalInfo).to.not.be.undefined;
    });

    it('[TC_WEB_062] Profile should display Professional Details section', async function () {
        const profDetails = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Professional") or contains(text(), "Specialization")]')), 8000);
        expect(profDetails).to.not.be.undefined;
    });

    it('[TC_WEB_063] Profile should display doctor name', async function () {
        const nameEls = await driver.findElements(By.xpath('//*[contains(text(), "Dr.") or contains(text(), "Doctor")]'));
        expect(nameEls.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_064] Profile should display Preferences section', async function () {
        const prefsSection = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Preferences") or contains(text(), "Notifications")]')), 8000);
        expect(prefsSection).to.not.be.undefined;
    });

    it('[TC_WEB_065] Sign Out button should be visible', async function () {
        const logoutBtn = await driver.wait(until.elementLocated(By.css('[data-testid="logout-button"]')), 8000);
        expect(logoutBtn).to.not.be.undefined;
    });

    it('[TC_WEB_066] Logout should redirect to login screen', async function () {
        await DriverUtils.waitAndClick(driver, By.css('[data-testid="logout-button"]'));
        await driver.sleep(2000);
        // Should be back on login page
        const loginInput = await driver.wait(until.elementLocated(By.css('[data-testid="email-input"]')), 10000);
        expect(loginInput).to.not.be.undefined;
    });
});
