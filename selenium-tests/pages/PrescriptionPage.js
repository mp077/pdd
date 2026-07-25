const { By, until } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');

class PrescriptionPage {
    constructor(driver) {
        this.driver = driver;
        this.prescriptionPatientSearch = By.css('input[placeholder*="Search by Patient Name"]');
        this.medSearchInput = By.css('[data-testid="medication-search-input"]');
        this.saveBtn = By.css('[data-testid="save-prescription-btn"]');
    }

    async searchMedication(name) {
        await DriverUtils.waitAndSendKeys(this.driver, this.medSearchInput, name);
        await this.driver.sleep(1000);
    }

    async searchAndSelectPatient(name) {
        // Type into the patient search input
        const Key = require('selenium-webdriver').Key;
        const searchEl = await this.driver.wait(until.elementLocated(this.prescriptionPatientSearch), 10000);
        await this.driver.executeScript('arguments[0].scrollIntoView({block:"center"});', searchEl);
        await searchEl.sendKeys(Key.CONTROL, 'a');
        await searchEl.sendKeys(Key.DELETE);
        await this.driver.sleep(200);
        await searchEl.sendKeys(name);
        await this.driver.sleep(1500); // Wait for filtered results to render

        // Click first visible result using bubbling MouseEvent (required for React synthetic events)
        try {
            const results = await this.driver.findElements(By.xpath('//*[contains(text(), "' + name + '")]'));
            for (let r of results) {
                const tag = await r.getTagName().catch(() => '');
                const displayed = await r.isDisplayed().catch(() => false);
                if (displayed && tag !== 'html' && tag !== 'body' && tag !== 'head') {
                    await this.driver.executeScript(`
                        var evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
                        arguments[0].dispatchEvent(evt);
                    `, r);
                    await this.driver.sleep(1000);
                    return;
                }
            }
        } catch(e) {}
    }
}
module.exports = PrescriptionPage;
