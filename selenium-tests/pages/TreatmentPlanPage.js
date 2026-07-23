const { By, until } = require('selenium-webdriver');

class TreatmentPlanPage {
    constructor(driver) {
        this.driver = driver;
        this.patientSearchInput = By.css('[data-testid="patient-search-input"]');
        this.boneHeightInput = By.css('[data-testid="bone-height-input"]');
        this.boneWidthInput = By.css('[data-testid="bone-width-input"]');
        this.boneDensityInput = By.css('[data-testid="bone-density-input"]');
        this.generateBtn = By.css('[data-testid="generate-plan-btn"]');
    }

    async searchPatient(name) {
        const input = await this.driver.wait(until.elementLocated(this.patientSearchInput), 5000);
        await input.clear();
        await input.sendKeys(name);
        await this.driver.sleep(1000);
    }

    async clickFirstPatientResult() {
        // Assume patient list renders items that can be clicked. We can just hit ENTER or click the first item.
        // Wait for the dropdown or first item to be visible. If it's a card style, click the first one.
        const cards = await this.driver.findElements(By.css('.searchItem')); // Will need to verify this class
        if (cards.length > 0) {
            await cards[0].click();
            return true;
        }
        return false;
    }

    async enterBoneData(height, width, density) {
        const hInput = await this.driver.findElement(this.boneHeightInput);
        await hInput.clear();
        await hInput.sendKeys(height);

        const wInput = await this.driver.findElement(this.boneWidthInput);
        await wInput.clear();
        await wInput.sendKeys(width);

        const dInput = await this.driver.findElement(this.boneDensityInput);
        await dInput.clear();
        await dInput.sendKeys(density);
    }

    async generatePlan() {
        await this.driver.findElement(this.generateBtn).click();
    }
}
module.exports = TreatmentPlanPage;
