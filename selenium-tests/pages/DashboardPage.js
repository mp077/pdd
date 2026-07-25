const { By, until } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');

class DashboardPage {
    constructor(driver) {
        this.driver = driver;
        this.dashboardHeader = By.xpath('//*[contains(text(), "Appointments")]');
        this.patientsNav = By.xpath('//*[text()="Patients"]');
        this.profileNav = By.xpath('//*[text()="Profile"]');
        this.prescriptionNav = By.xpath('//*[text()="Prescription"]');
        this.logoutBtn = By.css('[data-testid="logout-button"]');
    }

    async isLoaded() {
        try {
            await this.driver.wait(until.elementLocated(this.dashboardHeader), 15000);
            return true;
        } catch (e) {
            return false;
        }
    }

    async navigateToPatients() {
        await DriverUtils.waitAndClick(this.driver, this.patientsNav);
    }

    async logout() {
        // Click Profile tab first
        await DriverUtils.waitAndClick(this.driver, this.profileNav);
        
        // Wait for profile screen and click logout button by testID
        await DriverUtils.waitAndClick(this.driver, this.logoutBtn);
        await this.driver.sleep(2000);
    }
}
module.exports = DashboardPage;
