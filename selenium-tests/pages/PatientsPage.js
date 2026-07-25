const { By, until } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');

class PatientsPage {
    constructor(driver) {
        this.driver = driver;
        this.searchInput = By.css('[data-testid="search-patient-input"]');
        this.addPatientBtnDesktop = By.css('[data-testid="new-case-btn-desktop"]');
        this.addPatientFab = By.css('[data-testid="new-case-fab"]');
        this.savePatientBtn = By.css('[data-testid="save-patient-btn"]');
        this.patientNameInput = By.css('[data-testid="patient-name-input"]');
    }

    async isLoaded() {
        try {
            await this.driver.wait(until.elementLocated(this.searchInput), 15000);
            return true;
        } catch (e) {
            return false;
        }
    }

    async searchPatient(name) {
        const Key = require('selenium-webdriver').Key;
        const el = await this.driver.wait(until.elementLocated(this.searchInput), 10000);
        await this.driver.executeScript('arguments[0].scrollIntoView({block:"center"});', el);
        await this.driver.sleep(200);
        // Clear existing text first
        await el.sendKeys(Key.CONTROL, 'a');
        await el.sendKeys(Key.DELETE);
        await this.driver.sleep(300);
        if (name) {
            await el.sendKeys(name);
        }
        await this.driver.sleep(1000); // Wait for React state to filter
    }

    async clickFirstPatientCard() {
        // Wait for at least one patient card to appear (up to 10s)
        await this.driver.wait(until.elementLocated(By.css('[data-testid^="patient-card-"]')), 10000);
        const cards = await this.driver.findElements(By.css('[data-testid^="patient-card-"]'));
        if (cards.length > 0) {
            await DriverUtils.waitAndClick(this.driver, By.css('[data-testid^="patient-card-"]'));
            return true;
        }
        return false;
    }
}
module.exports = PatientsPage;
