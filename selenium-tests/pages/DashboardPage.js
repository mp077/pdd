const { By, until } = require('selenium-webdriver');

class DashboardPage {
    constructor(driver) {
        this.driver = driver;
        this.dashboardHeader = By.xpath('//*[text()="Appointments" or contains(text(), "Appointments")]');
        this.patientsNav = By.xpath('//*[contains(text(), "Patients")]');
        this.scheduleNav = By.xpath('//*[contains(text(), "Schedule")]');
        this.profileNav = By.xpath('//*[text()="Profile" or contains(text(), "Profile")]');
        this.logoutBtn = By.xpath('//*[contains(text(), "Sign Out")]');
    }

    async isLoaded() {
        await this.driver.wait(until.elementLocated(this.dashboardHeader), 15000);
        return true;
    }

    async navigateToPatients() {
        await this.driver.findElement(this.patientsNav).click();
    }

    async logout() {
        // Click Profile tab first
        await this.driver.wait(until.elementLocated(this.profileNav), 5000);
        await this.driver.findElement(this.profileNav).click();
        
        // Wait for profile screen to load and find logout button
        await this.driver.wait(until.elementLocated(this.logoutBtn), 5000);
        const buttons = await this.driver.findElements(this.logoutBtn);
        for (let btn of buttons) {
            try {
                if (await btn.isDisplayed()) {
                    await btn.click();
                    break;
                }
            } catch(e) {}
        }
        
        // Wait for native browser alert to pop up
        await this.driver.sleep(1500);
        try {
            const alert = await this.driver.switchTo().alert();
            await alert.accept();
        } catch (e) {
            console.log("No alert found or already accepted");
        }
    }
}
module.exports = DashboardPage;
