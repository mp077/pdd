const { By, until } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');

class AdminPage {
    constructor(driver) {
        this.driver = driver;
        // Fallback to text matching since old bundle lacks testIDs on AdminNavigator
        this.navPending = By.xpath('//*[text()="Approvals" or contains(@data-testid, "admin-nav-pending")]');
        this.navDoctors = By.xpath('//*[text()="Doctors" or contains(@data-testid, "admin-nav-doctors")]');
    }

    async isLoaded() {
        try {
            await this.driver.wait(until.elementLocated(this.navPending), 15000);
            return true;
        } catch (e) {
            return false;
        }
    }

    async goToDoctors() {
        await DriverUtils.waitAndClick(this.driver, this.navDoctors);
    }
}
module.exports = AdminPage;
