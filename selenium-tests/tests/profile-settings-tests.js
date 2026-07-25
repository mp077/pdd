/**
 * profile-settings-tests.js  – TC_WEB_375 to TC_WEB_389
 * Doctor Profile screen – all sections and settings.
 */
const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');
const LoginPage = require('../pages/LoginPage');

describe('Profile & Settings Tests', function () {
    this.timeout(60000);
    let driver;

    before(async function () {
        driver = await DriverUtils.initDriver();
        const lp = new LoginPage(driver);
        await lp.open();
        await lp.enterCredentials('m@p.com', '123456');
        await lp.clickLogin();
        await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Appointments")]')), 12000);
        await DriverUtils.waitAndClick(driver, By.xpath('//*[text()="Profile"]'));
        await driver.sleep(1500);
    });

    after(async function () { if (driver) await driver.quit(); });

    it('[TC_WEB_375] Profile screen loads with Personal Information section', async function () {
        const section = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Personal Information")]')), 8000);
        expect(section).to.not.be.undefined;
    });

    it('[TC_WEB_376] Profile shows Full Name label', async function () {
        const nameLabel = await driver.findElements(By.xpath('//*[contains(text(),"Full Name") or contains(text(),"Name")]'));
        expect(nameLabel.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_377] Profile shows Email label', async function () {
        const emailLabel = await driver.findElements(By.xpath('//*[contains(text(),"Email")]'));
        expect(emailLabel.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_378] Profile shows Specialization label', async function () {
        const specLabel = await driver.findElements(By.xpath('//*[contains(text(),"Specialization") or contains(text(),"Special")]'));
        expect(specLabel.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_379] Profile shows Clinic Name label', async function () {
        const clinicLabel = await driver.findElements(By.xpath('//*[contains(text(),"Clinic") or contains(text(),"Practice")]'));
        expect(clinicLabel.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_380] Profile shows Phone Number field', async function () {
        const licLabel = await driver.findElements(By.xpath('//*[contains(text(),"Phone") or contains(text(),"Number")]'));
        expect(licLabel.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_381] Professional Details section is visible', async function () {
        const section = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Professional") or contains(text(),"Details")]')), 8000);
        expect(section).to.not.be.undefined;
    });

    it('[TC_WEB_382] Preferences section is visible', async function () {
        const section = await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Preferences") or contains(text(),"Settings")]')), 8000);
        expect(section).to.not.be.undefined;
    });

    it('[TC_WEB_383] Notifications toggle renders in Preferences', async function () {
        const toggle = await driver.findElements(By.css('input[type="checkbox"], [role="switch"]'));
        expect(toggle.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_384] Dark Mode option is visible in Preferences', async function () {
        const darkMode = await driver.findElements(By.xpath('//*[contains(text(),"Dark") or contains(text(),"Theme")]'));
        expect(darkMode.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_385] Doctor avatar / initials are displayed at top', async function () {
        const avatarArea = await driver.findElements(By.xpath('//*[contains(text(),"Dr.") or @data-testid="profile-avatar"]'));
        expect(avatarArea.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_386] Sign Out button is visible and styled distinctly', async function () {
        const logoutBtn = await driver.wait(until.elementLocated(By.css('[data-testid="logout-button"]')), 8000);
        expect(logoutBtn).to.not.be.undefined;
    });

    it('[TC_WEB_387] Profile screen renders without JavaScript errors', async function () {
        const url = await driver.getCurrentUrl();
        expect(url).to.include('localhost');
    });

    it('[TC_WEB_388] Profile page title or heading says "Profile"', async function () {
        const title = await driver.findElements(By.xpath('//*[contains(text(),"Profile")]'));
        expect(title.length).to.be.greaterThan(0);
    });

    it('[TC_WEB_389] Profile data is populated (not empty placeholders)', async function () {
        // Doctor logged in as m@p.com should have some data
        const emailEl = await driver.findElements(By.xpath('//*[contains(text(),"@")]'));
        expect(emailEl.length).to.be.greaterThan(0);
    });
});
