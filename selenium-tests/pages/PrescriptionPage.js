const { By, until } = require('selenium-webdriver');

class PrescriptionPage {
    constructor(driver) {
        this.driver = driver;
        this.prescriptionPatientSearch = By.css('input[placeholder*="Search by Patient Name"]');
        this.medSearchInput = By.css('[data-testid="medication-search-input"]');
        this.saveBtn = By.css('[data-testid="save-prescription-btn"]');
    }

    async searchMedication(name) {
        const input = await this.driver.wait(until.elementLocated(this.medSearchInput), 5000);
        await input.clear();
        await input.sendKeys(name);
        await this.driver.sleep(1000);
    }

    async searchAndSelectPatient(name) {
        const input = await this.driver.wait(until.elementLocated(this.prescriptionPatientSearch), 5000);
        await input.clear();
        await input.sendKeys(name);
        await this.driver.sleep(1000);
        // click first result
        const result = await this.driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), "${name}")]`)), 5000);
        await result.click();
    }
}
module.exports = PrescriptionPage;
