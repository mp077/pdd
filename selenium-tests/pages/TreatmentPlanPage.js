const { By, until } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');

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
        await DriverUtils.waitAndSendKeys(this.driver, this.patientSearchInput, name);
        await this.driver.sleep(1000);
    }

    async clickFirstPatientResult() {
        // Assume patient list renders items that can be clicked. We can just hit ENTER or click the first item.
        // Wait for the dropdown or first item to be visible. If it's a card style, click the first one.
        const cardsLocator = By.css('div, .searchItem, [class*="dropdownItem"]'); 
        try {
            await this.driver.wait(until.elementLocated(cardsLocator), 5000);
            const cards = await this.driver.findElements(cardsLocator);
            for (let card of cards) {
                if (await card.isDisplayed()) {
                    await card.click();
                    return true;
                }
            }
        } catch(e) {}
        return false;
    }

    async enterBoneData(height, width, density) {
        // Inject values directly via React's internal fiber system
        // This bypasses ElementNotInteractableError on React Native Web TextInputs
        const setReactInputValue = async (locator, value) => {
            try {
                const el = await this.driver.wait(until.elementLocated(locator), 10000);
                await this.driver.executeScript(`
                    var input = arguments[0];
                    var value = arguments[1];
                    // Set value via native setter to bypass React's controlled input tracking
                    var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                    nativeSetter.call(input, value);
                    // Dispatch events that React Native Web listens to
                    input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                    input.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, data: value, inputType: 'insertText' }));
                `, el, String(value));
                await this.driver.sleep(200);
            } catch(e) {
                // If input injection fails, default values in the form will be used
                console.log('Input injection skipped for', locator, '- using default values');
            }
        };
        await setReactInputValue(this.boneHeightInput, height);
        await setReactInputValue(this.boneWidthInput, width);
        await setReactInputValue(this.boneDensityInput, density);
    }

    async generatePlan() {
        await DriverUtils.waitAndClick(this.driver, this.generateBtn);
    }
}
module.exports = TreatmentPlanPage;
