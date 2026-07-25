const { By, until } = require('selenium-webdriver');
const DriverUtils = require('../utils/driver');

class LoginPage {
    constructor(driver) {
        this.driver = driver;
        this.emailInput = By.css('[data-testid="email-input"]');
        this.passwordInput = By.css('[data-testid="password-input"]');
        this.loginBtn = By.css('[data-testid="login-button"]');
    }

    async open(url = 'http://localhost:8082') {
        await this.driver.get(url);
    }

    async isLoaded() {
        try {
            await this.driver.wait(until.elementLocated(this.loginBtn), 15000);
            return true;
        } catch (e) {
            return false;
        }
    }

    async enterCredentials(email, password) {
        await DriverUtils.waitAndSendKeys(this.driver, this.emailInput, email);
        await DriverUtils.waitAndSendKeys(this.driver, this.passwordInput, password);
    }

    async clickLogin() {
        await DriverUtils.waitAndClick(this.driver, this.loginBtn);
    }
}
module.exports = LoginPage;
