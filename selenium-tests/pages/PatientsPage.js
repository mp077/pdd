const { By, until } = require('selenium-webdriver');

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
            await this.driver.wait(until.elementLocated(this.searchInput), 5000);
            return true;
        } catch (e) {
            return false;
        }
    }

    async searchPatient(name) {
        await this.driver.wait(until.elementLocated(this.searchInput), 5000);
        const searchInput = await this.driver.findElement(this.searchInput);
        await searchInput.clear();
        await searchInput.sendKeys(name);
        await this.driver.sleep(1000); // Wait for React to filter
    }

    async clickFirstPatientCard() {
        // Wait for at least one patient card
        await this.driver.wait(until.elementLocated(By.css('[data-testid^="patient-card-"]')), 5000);
        const cards = await this.driver.findElements(By.css('[data-testid^="patient-card-"]'));
        if (cards.length > 0) {
            await cards[0].click();
            return true;
        }
        return false;
    }
}
module.exports = PatientsPage;
