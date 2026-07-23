const { browser, driver, $, expect } = require('@wdio/globals');
const LoginPage = require('../pageobjects/login.page.js');

describe('Login application', () => {
    it('should show error with invalid credentials', async () => {
        if (!driver.isMobile) {
            await browser.url('/');
        }
        
        await LoginPage.login('invalid@clinic.com', 'wrongpassword');
        
        if (driver.isMobile) {
            const errorText = await $('//*[contains(@text, "Incorrect") or contains(@text, "failed") or contains(@text, "Error") or contains(@text, "Network")]');
            await errorText.waitForExist({ timeout: 5000 });
            await expect(errorText).toExist();
        } else {
            const errorBubble = await $('//*[contains(text(), "Incorrect") or contains(text(), "failed") or contains(text(), "Error") or contains(text(), "Network")]');
            await errorBubble.waitForExist({ timeout: 5000 });
            await expect(errorBubble).toExist();
        }
    });
});
