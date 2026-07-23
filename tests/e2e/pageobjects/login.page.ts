// @ts-nocheck
import { driver, $ } from '@wdio/globals';

class LoginPage {
    get inputEmail() {
        // Appium strategy for Android (UiSelector) or generic xpath
        if (driver.isMobile) {
            return $('//android.widget.EditText[contains(@text, "doctor@clinic.com")]|//android.widget.EditText[1]');
        }
        return $('input[type="email"], input[placeholder="doctor@clinic.com"]');
    }

    get inputPassword() {
        if (driver.isMobile) {
            return $('//android.widget.EditText[contains(@password, "true")]|//android.widget.EditText[2]');
        }
        return $('input[type="password"], input[placeholder="••••••••"]');
    }

    get btnSignIn() {
        if (driver.isMobile) {
            return $('~Sign In'); // assuming accessibility id
        }
        return $('button=Sign In, div=Sign In');
    }

    async login(email: string, password: string) {
        await this.inputEmail.setValue(email);
        await this.inputPassword.setValue(password);
        await this.btnSignIn.click();
    }
}

export default new LoginPage();
