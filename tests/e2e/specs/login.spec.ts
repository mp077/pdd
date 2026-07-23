// @ts-nocheck
import { browser, driver, $, expect } from '@wdio/globals';
import LoginPage from '../pageobjects/login.page';

describe('Login application', () => {
    it('should show error with invalid credentials', async () => {
        // Simple navigation logic if testing on web
        if (!driver.isMobile) {
            await browser.url('/');
        }
        
        await LoginPage.login('invalid@clinic.com', 'wrongpassword');
        
        // This relies on whatever error element shows up in your app
        if (driver.isMobile) {
            const errorText = await $('//android.widget.TextView[contains(@text, "Login failed")]');
            await expect(errorText).toExist();
        } else {
            const errorBubble = await $('div=Login failed.');
            await expect(errorBubble).toExist();
        }
    });
});
