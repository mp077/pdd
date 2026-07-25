const { By, until } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');

class ProfilePage {
    constructor(driver) {
        this.driver = driver;
        this.logoutBtn = By.css('[data-testid="logout-button"]');
        this.profileTitle = By.xpath('//*[contains(text(), "Personal Information") or contains(text(), "Profile")]');
        this.doctorName = By.xpath('//*[contains(text(), "Dr.")]');
    }

    async isLoaded() {
        try {
            await this.driver.wait(until.elementLocated(this.profileTitle), 10000);
            return true;
        } catch(e) { return false; }
    }

    async getDoctorName() {
        try {
            const el = await this.driver.wait(until.elementLocated(this.doctorName), 5000);
            return await el.getText();
        } catch(e) { return ''; }
    }

    async logout() {
        await DriverUtils.waitAndClick(this.driver, this.logoutBtn);
        await this.driver.sleep(2000);
    }
}

module.exports = ProfilePage;
