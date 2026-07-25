const { By, until } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');

class SchedulePage {
    constructor(driver) {
        this.driver = driver;
        this.scheduleList = By.css('[data-testid="schedule-list"]');
        this.totalCount = By.css('[data-testid="schedule-total-count"]');
        this.scheduleTitle = By.xpath('//*[contains(text(), "Schedule")]');
    }

    async isLoaded() {
        try {
            await this.driver.wait(until.elementLocated(this.scheduleTitle), 10000);
            return true;
        } catch(e) { return false; }
    }

    async getTotalCount() {
        try {
            const el = await this.driver.wait(until.elementLocated(this.totalCount), 8000);
            const text = await el.getText();
            return parseInt(text) || 0;
        } catch(e) { return 0; }
    }

    async getAppointmentCards() {
        return await this.driver.findElements(By.css('[data-testid^="appointment-card-"]'));
    }
}

module.exports = SchedulePage;
