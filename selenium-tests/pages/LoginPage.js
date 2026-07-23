const { By, until } = require('selenium-webdriver');

class LoginPage {
    constructor(driver) {
        this.driver = driver;
        // Use data-testid for ultra-stable locators
        this.emailInput = By.css('[data-testid="email-input"]');
        this.passwordInput = By.css('[data-testid="password-input"]');
        this.loginBtn = By.css('[data-testid="login-button"]');
    }

    async open(url = 'http://localhost:8081') {
        await this.driver.get(url);
    }

    async isLoaded() {
        try {
            await this.driver.wait(until.elementLocated(this.loginBtn), 5000);
            return true;
        } catch (e) {
            return false;
        }
    }

    async enterCredentials(email, password) {
        await this.driver.wait(until.elementLocated(this.emailInput), 10000);
        await this.driver.findElement(this.emailInput).sendKeys(email);
        await this.driver.findElement(this.passwordInput).sendKeys(password);
    }

    async clickLogin() {
        await this.driver.findElement(this.loginBtn).click();
    }
}
module.exports = LoginPage;
