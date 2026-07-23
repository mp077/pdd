const { By, until } = require('selenium-webdriver');

class AdminPage {
    constructor(driver) {
        this.driver = driver;
        this.navOverview = By.xpath('//*[contains(text(), "System Admin")] | //*[contains(text(), "Overview")]');
        this.navDoctors = By.xpath('//*[contains(text(), "Doctors")]');
        this.navPending = By.css('[data-testid="admin-nav-pending"]');
    }

    async isLoaded() {
        try {
            await this.driver.wait(until.elementLocated(this.navOverview), 5000);
            return true;
        } catch (e) {
            return false;
        }
    }

    async goToDoctors() {
        await this.driver.findElement(this.navDoctors).click();
        await this.driver.sleep(500);
    }
}
module.exports = AdminPage;
